package service

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"mime/multipart"
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

func (s *Service) Chat(ctx context.Context, messages []dto.Message) (string, error) {
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

	response, err := s.llmClient.Chat(ctx, messages, chunksText)
	if err != nil {
		return "", err
	}

	return response, nil
}

func (s *Service) Upload(ctx context.Context, file *multipart.FileHeader) error {
	encodedFile, err := encodeFile(file)
	if err != nil {
		return err
	}

	extractedText, err := s.llmClient.ExtractText(ctx, encodedFile)
	if err != nil {
		return err
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
		return err
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
		return err
	}

	err = s.vectordbClient.CreateChunks(ctx, records)
	if err != nil {
		return err
	}
	return nil
}

func encodeFile(file *multipart.FileHeader) (string, error) {
	f, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("opening file: %w", err)
	}
	defer f.Close()

	data, err := io.ReadAll(f)
	if err != nil {
		return "", fmt.Errorf("reading file: %w", err)
	}

	mimeType := file.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	b64 := base64.StdEncoding.EncodeToString(data)

	dataURI := fmt.Sprintf("data:%s;base64,%s", mimeType, b64)
	return dataURI, nil
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
		return nil, 0, err
	}
	return documents, total, nil
}

func (s *Service) DeleteDocument(ctx context.Context, id string) error {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return err
	}

	document, err := s.repository.GetDocumentByID(ctx, uuid)
	if err != nil {
		return err
	}

	chunksIds := make([]string, len(document.Chunks))
	for i, chunk := range document.Chunks {
		chunksIds[i] = chunk.ID.String()
	}

	err = s.vectordbClient.DeleteChunks(ctx, chunksIds)
	if err != nil {
		return err
	}

	err = s.repository.SoftDeleteDocumentAndChunks(ctx, uuid)
	if err != nil {
		err = s.RecoverChunks(ctx, document.Chunks)
		if err != nil {
			return err
		}
		return err
	}
	return nil
}

func (s *Service) DeleteChunk(ctx context.Context, id string) error {
	uuid, err := uuid.Parse(id)
	if err != nil {
		return err
	}

	chunk, err := s.repository.GetChunkByID(ctx, uuid)
	if err != nil {
		return err
	}

	err = s.vectordbClient.DeleteChunks(ctx, []string{id})
	if err != nil {
		return err
	}

	err = s.repository.SoftDeleteChunk(ctx, uuid)
	if err != nil {
		err = s.RecoverChunks(ctx, []repository.Chunk{*chunk})
		if err != nil {
			return err
		}
		return err
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
