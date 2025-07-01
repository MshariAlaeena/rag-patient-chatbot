package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"patient-chatbot/internal/config"
)

const (
	CHAT_SYSTEM_PROMPT = `
	You are Hamad, a professional and compassionate medical assistant.
	Always use only the provided context snippets to answer patient questions.
	If the context does not contain the information needed, respond with "I'm sorry, I don't have that information right now. Please consult your healthcare provider."
	Keep answers clear, accurate, and empathetic.
	Do not provide medical advice beyond the scope of the context; instead, encourage users to seek professional help when appropriate.
	Format your response as a friendly paragraph, and, when relevant, cite which snippet you used (e.g., “Based on our guidelines: ...”).
	`
	EXTRACT_SYSTEM_PROMPT = `
	You are a medical assistant. You will be given the plain text of a medical document.
	Extract every complete sentence or list item exactly as written—preserve wording, punctuation, and numbering.
	Output nothing else: no headings, no commentary, no fragments.
	List each extracted sentence or bullet on its own line.
	`
)

type LLMClient struct {
	cfg *config.Config
}

func NewLLMClient(cfg *config.Config) *LLMClient {
	return &LLMClient{cfg: cfg}
}

func (l *LLMClient) Chat(ctx context.Context, question string, chunks []string) (string, error) {
	var sysBuf bytes.Buffer
	sysBuf.WriteString(CHAT_SYSTEM_PROMPT)
	if len(chunks) > 0 {
		sysBuf.WriteString("Context:\n")
		for _, chunkText := range chunks {
			sysBuf.WriteString("- " + chunkText + "\n")
		}
	}

	msgs := []ChatMessageBlock{
		{Role: "system", Content: sysBuf.String()},
		{Role: "user", Content: question},
	}

	reqBody := ChatRequest{
		Model:               l.cfg.LLMModel,
		Messages:            msgs,
		Temperature:         1.0,
		MaxCompletionTokens: 1024,
		TopP:                1.0,
		Stream:              false,
		Stop:                nil,
	}

	payload, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("marshal chat request: %w", err)
	}
	return CallGroqAPI(ctx, l.cfg, payload)
}

func (l *LLMClient) ExtractText(ctx context.Context, encodedFile string) (string, error) {
	textBlock := ExtractTextContentBlock{
		Type: "text",
		Text: EXTRACT_SYSTEM_PROMPT,
	}

	imageBlock := ExtractTextContentBlock{
		Type: "image_url",
		ImageURL: &ImageBlock{
			URL: encodedFile,
		},
	}

	msgs := []ExtractTextMessageBlock{
		{Role: "user", Content: []ExtractTextContentBlock{textBlock, imageBlock}},
	}

	reqBody := ExtractTextRequest{
		Model:               l.cfg.MULTIMODAL_LLM_MODEL,
		Messages:            msgs,
		Temperature:         1.0,
		MaxCompletionTokens: 1024,
		TopP:                1.0,
		Stream:              false,
		Stop:                nil,
	}

	payload, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("marshal extract text request: %w", err)
	}
	return CallGroqAPI(ctx, l.cfg, payload)
}

func CallGroqAPI(ctx context.Context, cfg *config.Config, payload []byte) (string, error) {
	req, err := http.NewRequestWithContext(ctx, "POST", "https://api.groq.com/openai/v1/chat/completions", bytes.NewReader(payload))
	if err != nil {
		return "", fmt.Errorf("new chat request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+cfg.GroqAPIKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("chat API call: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("chat API error [%d]: %s", resp.StatusCode, string(body))
	}

	var cr ChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&cr); err != nil {
		return "", fmt.Errorf("decode chat response: %w", err)
	}
	if len(cr.Choices) == 0 {
		return "", fmt.Errorf("no choices in chat response")
	}
	return cr.Choices[0].Message.Content, nil
}
