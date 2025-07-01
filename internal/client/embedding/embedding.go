package embedding

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"patient-chatbot/internal/config"
)

type EmbeddingClient struct {
	cfg *config.Config
}

func NewEmbeddingClient(cfg *config.Config) *EmbeddingClient {
	return &EmbeddingClient{
		cfg: cfg,
	}
}

func (e *EmbeddingClient) EmbedQuery(ctx context.Context, texts []string) (*JinaEmbedResponse, error) {
	data := JinaEmbedClientRequest{
		Model: "jina-embeddings-v4",
		Task:  "text-matching",
		Input: []TextInput{},
	}

	for _, text := range texts {
		data.Input = append(data.Input, TextInput{Text: text})
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Fatalf("Error encoding JSON data: %v", err)
		return nil, err
	}

	req, err := http.NewRequest("POST", e.cfg.JinaEmbedURL, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Fatalf("Error creating HTTP request: %v", err)
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+e.cfg.JinaAuthToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Error making HTTP request: %v", err)
		return nil, err
	}
	defer resp.Body.Close()

	var jr JinaEmbedResponse
	if err := json.NewDecoder(resp.Body).Decode(&jr); err != nil {
		return nil, fmt.Errorf("decode embed response: %w", err)
	}
	if len(jr.Data) == 0 {
		return nil, fmt.Errorf("no embeddings returned")
	}

	return &jr, nil
}
