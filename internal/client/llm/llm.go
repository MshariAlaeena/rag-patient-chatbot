package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"patient-chatbot/internal/config"
	"patient-chatbot/internal/dto"
	"strings"
)

const (
	CHAT_SYSTEM_PROMPT_EN = `
	You are Hamad, a professional and compassionate medical assistant.
	Use the provided context snippets first. If they fully answer the question, respond using only them. if an answer is not found in the context, respond saying "I'm sorry, I don't have enough information right now. Please consult your healthcare provider."
	If the context is incomplete but the question is general and low-risk (e.g. definitions, common best practices), you may answer from your medical knowledge—clearly stating you're relying on general knowledge.
	If you answer from general knowledge, prepend: “Note: based on my general medical knowledge—”.
	If the question requires specifics beyond context and general best practices (e.g. dosing for a specific patient), respond exactly:
	“I'm sorry, I don't have enough information right now. Please consult your healthcare provider.”
	Keep answers concise, clear, accurate, and empathetic.
	Do NOT restate your role, add greetings, or ask follow-ups.
	Format your reply as one friendly paragraph. When you cite a snippet, use exactly:
	“Based on our guidelines: …”
	If you cannot comply, respond exactly:
	“ERROR: Unable to comply with instructions.”
	`
	CHAT_SYSTEM_PROMPT_AR = `
	أنت حمد، مساعد طبي محترف ورحيم.
	استخدم مقتطفات السياق المقدمة فقط للإجابة—لا تضف أي تحية أو مقدمة أو أسئلة متابعة.
	إذا لم يحتوي السياق على المعلومات المطلوبة، أجب تمامًا:
	“عذرًا، ليس لدي هذه المعلومة الآن. يُرجى استشارة مقدم الرعاية الصحية الخاص بك.”
	حافظ على الإجابات واضحة ودقيقة ومتعاطفة.
	لا تقدّم نصائح طبية تتجاوز نطاق السياق؛ بل شجّع المستخدمين على طلب المساعدة المتخصصة عند الحاجة.
	نسّق إجابتك في فقرة ودودة واحدة فقط. عند الاقتضاء، استشهد بالمقتطف المستخدم (مثلاً: “بناءً على إرشاداتنا: …”).
	إذا لم تستطع الالتزام بهذه التعليمات حرفيًا، أجب:
	“خطأ: غير قادر على تنفيذ التعليمات.”
	`
	EXTRACT_SYSTEM_PROMPT = `
	You are a medical assistant. You will be given plain text of a medical document.
	1. Generate a concise **title** (3-7 words).  
	2. Propose one **category** describing the document.  
	3. Split the document into chunks of roughly 300-500 characters each, cutting only at sentence boundaries.  
	- If a heading (e.g. “Symptoms”) would otherwise stand alone, attach it to the following sentence.  
	- Do not emit any chunk shorter than one complete sentence.  
	4. Output exactly this JSON object (compact, no line breaks)
	Make sure all newlines inside strings are escaped as \n, double quotes are escaped as \", backslashes as \\, and any Unicode codepoint uses exactly four hex digits (e.g. \u00A0, not \u00a F)
	{"title":"…","category":"…","chunks":["…","…",…]}
	Don't output anything else (no commentary or headings).
	`
)

type LLMClient struct {
	cfg *config.Config
}

func NewLLMClient(cfg *config.Config) *LLMClient {
	return &LLMClient{cfg: cfg}
}

func (l *LLMClient) Chat(ctx context.Context, messages []dto.Message, chunks []string, lang string) (string, error) {
	var sysBuf bytes.Buffer
	if lang == "en" {
		sysBuf.WriteString(CHAT_SYSTEM_PROMPT_EN)
	} else {
		sysBuf.WriteString(CHAT_SYSTEM_PROMPT_AR)
	}
	if len(chunks) > 0 {
		sysBuf.WriteString("Context:\n")
		for _, chunkText := range chunks {
			sysBuf.WriteString("- " + chunkText + "\n")
		}
	}

	msgs := []ChatMessageBlock{
		{Role: "system", Content: sysBuf.String()},
	}

	for _, message := range messages {
		if strings.TrimSpace(message.Content) != "" {
			msgs = append(msgs, ChatMessageBlock{
				Role:    message.Role,
				Content: message.Content,
			})
			continue
		}
		if len(msgs) > 0 {
			msgs = msgs[:len(msgs)-1]
		}
	}

	reqBody := ChatRequest{
		Messages:            msgs,
		Temperature:         0,
		MaxCompletionTokens: 1024,
		TopP:                1.0,
		Stream:              false,
		Stop:                []string{"ERROR"},
	}

	if lang == "en" {
		reqBody.Model = l.cfg.LLMModel
	} else {
		reqBody.Model = l.cfg.ArabicLLMModel
	}

	payload, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("marshal chat request: %w", err)
	}
	return CallGroqAPI(ctx, l.cfg, payload)
}

func (l *LLMClient) ExtractText(ctx context.Context, encodedFile string, isText bool) (*ExtractTextResponse, error) {
	textBlock := ExtractTextContentBlock{
		Type: "text",
		Text: EXTRACT_SYSTEM_PROMPT,
	}

	dataBlock := ExtractTextContentBlock{}
	if isText {
		dataBlock.Type = "text"
		dataBlock.Text = encodedFile
	} else {
		dataBlock.Type = "image_url"
		dataBlock.ImageURL = &ImageBlock{
			URL: encodedFile,
		}
	}

	msgs := []ExtractTextMessageBlock{
		{Role: "user", Content: []ExtractTextContentBlock{textBlock, dataBlock}},
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
		return nil, fmt.Errorf("marshal extract text request: %w", err)
	}
	res, err := CallGroqAPI(ctx, l.cfg, payload)
	if err != nil {
		return nil, err
	}

	var extractTextResponse ExtractTextResponse
	if err := json.Unmarshal([]byte(res), &extractTextResponse); err != nil {
		return nil, fmt.Errorf("unmarshal extract text response: %w", err)
	}

	return &extractTextResponse, nil
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
