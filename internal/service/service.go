package service

import (
	"context"
	"encoding/base64"
	"fmt"
	"io"
	"mime/multipart"
	"patient-chatbot/internal/client/embedding"
	"patient-chatbot/internal/client/llm"
	"patient-chatbot/internal/client/vectordb"
	"patient-chatbot/internal/config"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"github.com/pinecone-io/go-pinecone/v4/pinecone"
)

type Service struct {
	cfg             *config.Config
	llmClient       *llm.LLMClient
	embeddingClient *embedding.EmbeddingClient
	vectordbClient  *vectordb.VectordbClient
}

func NewService(
	cfg *config.Config,
	llmClient *llm.LLMClient,
	embeddingClient *embedding.EmbeddingClient,
	vectordbClient *vectordb.VectordbClient,
) *Service {
	return &Service{
		cfg:             cfg,
		llmClient:       llmClient,
		embeddingClient: embeddingClient,
		vectordbClient:  vectordbClient,
	}
}

const (
	chunkMinLen = 250
)

func (s *Service) Chat(ctx context.Context, orgId string, question string) (string, error) {
	chunks, err := s.vectordbClient.Search(ctx, question)
	if err != nil {
		return "", err
	}

	var chunksText []string
	for _, chunk := range chunks.Result.Hits {
		chunksText = append(chunksText, chunk.Fields["chunk_text"].(string))
	}

	response, err := s.llmClient.Chat(ctx, question, chunksText)
	if err != nil {
		return "", err
	}

	return response, nil
}

func (s *Service) Upload(ctx context.Context, orgId string, file *multipart.FileHeader) error {
	encodedFile, err := encodeFile(file)
	if err != nil {
		return err
	}

	extractedText, err := s.llmClient.ExtractText(ctx, encodedFile)
	if err != nil {
		return err
	}
	chunks := splitTextIntoChunks(extractedText, chunkMinLen)

	var records []*pinecone.IntegratedRecord
	for _, chunk := range chunks {
		chunkId := uuid.New()
		records = append(records, &pinecone.IntegratedRecord{
			"id":         chunkId,
			"chunk_text": chunk,
		})
	}

	err = s.vectordbClient.Upsert(ctx, records)
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

func splitTextIntoChunks(text string, minLen int) []string {
	sentences := regexp.MustCompilePOSIX(`[.?!]`).Split(text, -1)
	var chunks []string
	var buf strings.Builder

	for _, sentence := range sentences {
		if buf.Len()+len(sentence) > 2*minLen && buf.Len() >= minLen {
			chunks = append(chunks, strings.TrimSpace(buf.String()))
			buf.Reset()
		}
		buf.WriteString(sentence)
		buf.WriteString(" ")
		if buf.Len() >= minLen {
			chunks = append(chunks, strings.TrimSpace(buf.String()))
			buf.Reset()
		}
	}
	if buf.Len() > 0 {
		chunks = append(chunks, strings.TrimSpace(buf.String()))
	}
	return chunks
}
