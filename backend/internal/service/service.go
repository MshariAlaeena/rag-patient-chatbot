package service

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"patient-chatbot/internal/client/llm"
	"patient-chatbot/internal/client/vectordb"
	"patient-chatbot/internal/config"
	"patient-chatbot/internal/dto"
	"patient-chatbot/internal/repository"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/pinecone-io/go-pinecone/v4/pinecone"
	"golang.org/x/sync/errgroup"
)

type Service struct {
	cfg            *config.Config
	llmClient      *llm.LLMClient
	vectordbClient *vectordb.VectordbClient
	repository     *repository.Repository
}

func NewService(
	cfg *config.Config,
	llmClient *llm.LLMClient,
	vectordbClient *vectordb.VectordbClient,
	repository *repository.Repository,
) *Service {
	return &Service{
		cfg:            cfg,
		llmClient:      llmClient,
		vectordbClient: vectordbClient,
		repository:     repository,
	}
}

func (s *Service) Chat(ctx context.Context, messages []dto.Message, lang string) (string, error) {
	chunks, err := s.vectordbClient.Search(ctx, messages[len(messages)-1].Content)
	if err != nil {
		return "", err
	}

	chunksText := make([]string, len(chunks.Result.Hits))
	for i, chunk := range chunks.Result.Hits {
		chunksText[i] = chunk.Fields["chunk_text"].(string)
	}

	if len(messages) > 50 {
		messages = messages[len(messages)-50:]
	}

	response, err := s.llmClient.Chat(ctx, messages, chunksText, lang)
	if err != nil {
		return "", err
	}

	return response, nil
}

func (s *Service) Upload(ctx context.Context, file *multipart.FileHeader) error {
	f, err := file.Open()
	if err != nil {
		return fmt.Errorf("upload :: open file: %w", err)
	}
	defer f.Close()

	buf := make([]byte, 512)
	n, _ := f.Read(buf)
	mimeType := http.DetectContentType(buf[:n])
	isText := strings.HasPrefix(mimeType, "text/")

	if _, err := f.Seek(0, io.SeekStart); err != nil {
		return fmt.Errorf("upload :: seek: %w", err)
	}
	data, err := io.ReadAll(f)
	if err != nil {
		return fmt.Errorf("upload :: read file: %w", err)
	}

	var payload string
	if isText {
		payload = string(data)
	} else {
		b64 := base64.StdEncoding.EncodeToString(data)
		payload = fmt.Sprintf("data:%s;base64,%s", mimeType, b64)
	}

	extractedText, err := s.llmClient.ExtractText(ctx, payload, isText)
	if err != nil {
		return fmt.Errorf("upload :: extractText: %w", err)
	}

	filename, ext := sanitizeFilename(file.Filename)
	docId := uuid.New()
	doc := &repository.Document{
		BaseModel: repository.BaseModel{
			ID: docId,
		},
		Title:     extractedText.Title,
		Category:  extractedText.Category,
		Path:      filename,
		Extension: ext,
	}

	err = s.repository.CreateDocument(ctx, doc)
	if err != nil {
		return fmt.Errorf("upload :: createDocument: %w", err)
	}

	records := make([]*pinecone.IntegratedRecord, len(extractedText.Chunks))
	chunks := make([]*repository.Chunk, len(extractedText.Chunks))
	for i, chunk := range extractedText.Chunks {
		chunkId := uuid.New()
		records[i] = &pinecone.IntegratedRecord{
			"id":         chunkId,
			"chunk_text": chunk,
		}
		chunks[i] = &repository.Chunk{
			BaseModel: repository.BaseModel{
				ID: chunkId,
			},
			Content:    chunk,
			DocumentID: docId,
		}
	}

	err = s.repository.CreateChunks(ctx, chunks)
	if err != nil {
		return fmt.Errorf("upload :: createChunks: %w", err)
	}

	err = s.vectordbClient.CreateChunks(ctx, records)
	if err != nil {
		return fmt.Errorf("upload :: createChunks: %w", err)
	}
	return nil
}

func sanitizeFilename(filename string) (string, string) {
	ext := filepath.Ext(filename)
	filename = strings.TrimSuffix(filename, ext)

	filename = strings.TrimSpace(filename)
	filename = strings.ToLower(filename)
	filename = strings.ReplaceAll(filename, " ", "_")
	return filename, ext
}

func (s *Service) GetDocuments(ctx context.Context, page int, pageSize int) ([]repository.Document, int, error) {
	offset := (page - 1) * pageSize
	documents, total, err := s.repository.GetAllDocuments(ctx, offset, pageSize)
	if err != nil {
		return nil, 0, fmt.Errorf("getDocuments :: getAllDocuments: %w", err)
	}
	return documents, total, nil
}

func (s *Service) DeleteDocument(ctx context.Context, id string) error {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("deleteDocument :: uuid.Parse: %w", err)
	}

	document, err := s.repository.GetDocumentByID(ctx, uuid)
	if err != nil {
		return fmt.Errorf("deleteDocument :: GetDocumentByID: %w", err)
	}

	chunksIds := make([]string, len(document.Chunks))
	for i, chunk := range document.Chunks {
		chunksIds[i] = chunk.ID.String()
	}

	err = s.vectordbClient.DeleteChunks(ctx, chunksIds)
	if err != nil {
		return fmt.Errorf("deleteDocument :: DeleteChunks: %w", err)
	}

	err = s.repository.SoftDeleteDocumentAndChunks(ctx, uuid)
	if err != nil {
		err = s.RecoverChunks(ctx, document.Chunks)
		if err != nil {
			return fmt.Errorf("deleteDocument :: recoverChunks: %w", err)
		}
		return fmt.Errorf("deleteDocument :: softDeleteDocumentAndChunks: %w", err)
	}
	return nil
}

func (s *Service) DeleteChunk(ctx context.Context, id string) error {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return fmt.Errorf("deleteChunk :: uuid.Parse: %w", err)
	}

	chunk, err := s.repository.GetChunkByID(ctx, uuid)
	if err != nil {
		return fmt.Errorf("deleteChunk :: getChunkByID: %w", err)
	}

	err = s.vectordbClient.DeleteChunks(ctx, []string{id})
	if err != nil {
		return fmt.Errorf("deleteChunk :: deleteChunks: %w", err)
	}

	err = s.repository.SoftDeleteChunk(ctx, uuid)
	if err != nil {
		err = s.RecoverChunks(ctx, []repository.Chunk{*chunk})
		if err != nil {
			return fmt.Errorf("deleteChunk :: recoverChunks: %w", err)
		}
		return fmt.Errorf("deleteChunk :: softDeleteChunk: %w", err)
	}

	return nil
}

// RecoverChunks re-inserts chunks into Pinecone after a failed delete from the primary database.
func (s *Service) RecoverChunks(ctx context.Context, chunks []repository.Chunk) error {
	records := make([]*pinecone.IntegratedRecord, len(chunks))
	for i, chunk := range chunks {
		records[i] = &pinecone.IntegratedRecord{
			"id":         chunk.ID,
			"chunk_text": chunk.Content,
		}
	}
	return s.vectordbClient.CreateChunks(ctx, records)
}

func (s *Service) GetDashboardCalendar(ctx context.Context, userID uuid.UUID, date string) ([]dto.FullMonthProgressEvents, error) {
	dateTime, err := time.Parse("2006-01-02", date)
	if err != nil {
		return nil, fmt.Errorf("getDashboardData :: parseDate: %w", err)
	}

	var (
		progressEventsDays []repository.ProgressEvent
		user               *repository.User
	)

	g, ctx := errgroup.WithContext(ctx)

	g.Go(func() error {
		var err error
		progressEventsDays, err = s.repository.GetProgressEventsForMonth(ctx, userID, dateTime)
		if err != nil {
			return fmt.Errorf("GetProgressEventsForMonth: %w", err)
		}
		return nil
	})

	g.Go(func() error {
		var err error
		user, err = s.repository.GetUserByID(ctx, userID)
		if err != nil {
			return fmt.Errorf("GetUserByID: %w", err)
		}
		return nil
	})

	if err := g.Wait(); err != nil {
		return nil, err
	}

	eventMap := make(map[string]repository.ProgressEvent, len(progressEventsDays))
	for _, e := range progressEventsDays {
		key := e.Date.Format("2006-01-02")
		eventMap[key] = e
	}

	loc := dateTime.Location()
	start := time.Date(dateTime.Year(), dateTime.Month(), 1, 0, 0, 0, 0, loc)
	end := start.AddDate(0, 1, 0)
	isCurrentMonth := dateTime.Month() == time.Now().Month() && dateTime.Year() == time.Now().Year()

	if isCurrentMonth {
		end = time.Now()
	}

	fullMonthProgressEvents := make([]dto.FullMonthProgressEvents, 0)
	for d := start; d.Before(end); d = d.AddDate(0, 0, 1) {
		formattedDate := d.Format("2006-01-02")
		if d.Before(user.CreatedAt) {
			/*
				Potential issues:
				- ProgressEventsDays for a day is empty in two Cases:
					1. User has not used system yet -->
					2. User has not reported any slips on that day

				Solutions:
				1. Fetch

			*/
			fullMonthProgressEvents = append(fullMonthProgressEvents, dto.FullMonthProgressEvents{
				Date:   formattedDate,
				Status: repository.ProgressEventStatusUnknown,
			})
			continue
		}
		key := formattedDate
		if ev, ok := eventMap[key]; ok {
			fullMonthProgressEvents = append(fullMonthProgressEvents, dto.FullMonthProgressEvents{
				Date:   ev.Date.Format("2006-01-02"),
				Status: ev.Status,
			})
			if ev.Status != repository.ProgressEventStatusSlip {
				fullMonthProgressEvents[len(fullMonthProgressEvents)-1].Status = repository.ProgressEventStatusSmokeFree
			}
		} else {
			fullMonthProgressEvents = append(fullMonthProgressEvents, dto.FullMonthProgressEvents{
				Date:   formattedDate,
				Status: repository.ProgressEventStatusSmokeFree,
			})
		}
	}

	return fullMonthProgressEvents, nil
}

func (s *Service) GetDashboardData(ctx context.Context, userID uuid.UUID) (*dto.DashboardData, error) {
	progressEvents, err := s.repository.GetProgressEventsByUserID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("getDashboardData :: getUserByID: %w", err)
	}

	totalMoneySaved := 0
	totalDaysFree := 0
	streakDaysSmokeFree := 0
	for _, event := range progressEvents {
		if event.MoneySaved != nil {
			totalMoneySaved += *event.MoneySaved
		}
		if event.Status != repository.ProgressEventStatusSlip {
			totalDaysFree++
			streakDaysSmokeFree++
			continue
		}
		streakDaysSmokeFree = 0
	}
	return &dto.DashboardData{
		TotalMoneySaved:     totalMoneySaved,
		TotalDaysSmokeFree:  totalDaysFree,
		StreakDaysSmokeFree: streakDaysSmokeFree,
	}, nil
}

func BuildFullMonthEvents(events []repository.ProgressEvent, month time.Time) []dto.FullMonthProgressEvents {
	eventMap := make(map[string]repository.ProgressEvent, len(events))
	for _, e := range events {
		key := e.Date.Format("2006-01-02")
		eventMap[key] = e
	}

	loc := month.Location()
	start := time.Date(month.Year(), month.Month(), 1, 0, 0, 0, 0, loc)
	end := start.AddDate(0, 1, 0)
	isCurrentMonth := month.Month() == time.Now().Month() && month.Year() == time.Now().Year()

	if isCurrentMonth {
		end = time.Now()
	}

	fullMonthProgressEvents := make([]dto.FullMonthProgressEvents, 0)
	for d := start; d.Before(end); d = d.AddDate(0, 0, 1) {
		key := d.Format("2006-01-02")
		if ev, ok := eventMap[key]; ok {
			fullMonthProgressEvents = append(fullMonthProgressEvents, dto.FullMonthProgressEvents{
				Date:   ev.Date.Format("2006-01-02"),
				Status: ev.Status,
			})
			if ev.Status != repository.ProgressEventStatusSlip {
				fullMonthProgressEvents[len(fullMonthProgressEvents)-1].Status = repository.ProgressEventStatusSmokeFree
			}
		} else {
			fullMonthProgressEvents = append(fullMonthProgressEvents, dto.FullMonthProgressEvents{
				Date:   d.Format("2006-01-02"),
				Status: repository.ProgressEventStatusSmokeFree,
			})
		}
	}

	return fullMonthProgressEvents
}

func (s *Service) ReportSlip(ctx context.Context, userID uuid.UUID) error {
	progressEvent := &repository.ProgressEvent{
		BaseModel: repository.BaseModel{
			ID: uuid.New(),
		},
		UserID: userID,
		Date:   time.Now(),
		Status: repository.ProgressEventStatusSlip,
	}
	err := s.repository.CreateProgressEvent(ctx, progressEvent)
	if err != nil {
		return fmt.Errorf("reportSlip :: createProgressEvent: %w", err)
	}
	return nil
}
