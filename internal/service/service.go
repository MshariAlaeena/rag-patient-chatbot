package service

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"patient-chatbot/internal/client/embedding"
	"patient-chatbot/internal/client/llm"
	"patient-chatbot/internal/client/vectordb"
	"patient-chatbot/internal/config"
	"patient-chatbot/internal/dto"
	"patient-chatbot/internal/repository"
	"strings"

	"github.com/google/uuid"
	"github.com/pinecone-io/go-pinecone/v4/pinecone"
)

type Service struct {
	cfg             *config.Config
	llmClient       *llm.LLMClient
	embeddingClient *embedding.EmbeddingClient
	vectordbClient  *vectordb.VectordbClient
	repository      *repository.Repository
}

func NewService(
	cfg *config.Config,
	llmClient *llm.LLMClient,
	embeddingClient *embedding.EmbeddingClient,
	vectordbClient *vectordb.VectordbClient,
	repository *repository.Repository,
) *Service {
	return &Service{
		cfg:             cfg,
		llmClient:       llmClient,
		embeddingClient: embeddingClient,
		vectordbClient:  vectordbClient,
		repository:      repository,
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
