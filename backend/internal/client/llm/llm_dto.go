package llm

import "patient-chatbot/internal/dto"

type ChatMessageBlock struct {
	Role    dto.Role `json:"role"`
	Content string   `json:"content"`
}

type ChatRequest struct {
	Model               string             `json:"model"`
	Messages            []ChatMessageBlock `json:"messages"`
	Temperature         float32            `json:"temperature"`
	MaxCompletionTokens int                `json:"max_completion_tokens"`
	TopP                float32            `json:"top_p"`
	Stream              bool               `json:"stream"`
	Stop                interface{}        `json:"stop"`
}

type ImageBlock struct {
	URL string `json:"url"`
}

type ExtractTextContentBlock struct {
	Type     string      `json:"type"`
	Text     string      `json:"text,omitempty"`
	ImageURL *ImageBlock `json:"image_url,omitempty"`
}

type ExtractTextMessageBlock struct {
	Role    string                    `json:"role"`
	Content []ExtractTextContentBlock `json:"content"`
}

type ExtractTextRequest struct {
	Model               string                    `json:"model"`
	Messages            []ExtractTextMessageBlock `json:"messages"`
	Temperature         float32                   `json:"temperature"`
	MaxCompletionTokens int                       `json:"max_completion_tokens"`
	TopP                float32                   `json:"top_p"`
	Stream              bool                      `json:"stream"`
	Stop                interface{}               `json:"stop"`
}

type ExtractTextResponse struct {
	Title    string   `json:"title"`
	Category string   `json:"category"`
	Chunks   []string `json:"chunks"`
}

type ChatChoice struct {
	Message ChatMessageBlock `json:"message"`
}

type ChatResponse struct {
	Choices []ChatChoice `json:"choices"`
}

type QuittingCoachResponse struct {
	DaysSmokeFree          int  `json:"daysSmokeFree"`
	MoneySaved             int  `json:"moneySaved"`
	MentionedDaysSmokeFree bool `json:"mentionedDaysSmokeFree"`
	MentionedMoneySaved    bool `json:"mentionedMoneySaved"`
}
