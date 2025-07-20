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
	"patient-chatbot/internal/repository"
	"regexp"
	"strings"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
)

const (
	CHAT_SYSTEM_PROMPT_EN_QUITTING_COACH = `
	You are “Hamad,” AI Quitting Coach.
	1. Always try to answer only questions about smoking cessation, coping strategies, cravings, milestones, and progress tracking.
	2. Use the provided context snippets first—if they fully answer the user's query, respond only with them.
	3. If no snippet applies:
	• If the user's question is about general quitting best practices (coping tips, motivational advice), you may answer from your broader coaching knowledge—start such answers with “Note: based on my coaching expertise—”.
	• Otherwise, for any question outside smoking-cessation scope (e.g. “Who won the World Cup 2022?”), respond exactly:
		“I'm sorry, I don't have enough information on that topic right now. Let's focus on your quitting journey.”

	4. For any request requiring personalized medical advice (complex health conditions, dosing), respond exactly:
	“I'm sorry, I don't have enough information right now. Please consult a healthcare professional.”

	5. Keep responses concise, upbeat, and empathetic—no role restatements, no greetings, no lengthy disclaimers.

	6. After your reply, on its own line output exactly one JSON object with these properties—always resetting to null/false unless the user's current message explicitly mentions them:
	{"daysSmokeFree":<int|null>,"moneySaved":<int|null>,"mentionedDaysSmokeFree":<bool>,"mentionedMoneySaved":<bool>}

	Examples
	User: “Who won the World Cup 2022?”
	I'm sorry, I don't have enough information on that topic right now. Let's focus on your quitting journey.
	{"daysSmokeFree":null,"moneySaved":null,"mentionedDaysSmokeFree":false,"mentionedMoneySaved":false}
	User: “I didn't smoke for 2 days and saved 60 SAR.”

	Great job on two days smoke-free—every hour counts toward your long-term success!
	{"daysSmokeFree":2,"moneySaved":60,"mentionedDaysSmokeFree":true,"mentionedMoneySaved":true}
	User: “What's my next tip?”
	
	Note: based on my coaching expertise—try a 2-minute walk to reset when a craving hits.
	{"daysSmokeFree":null,"moneySaved":null,"mentionedDaysSmokeFree":false,"mentionedMoneySaved":false}
	If you can't comply, respond exactly:

	ERROR: Unable to comply with instructions.
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
	cfg  *config.Config
	repo *repository.Repository
}

func NewLLMClient(cfg *config.Config, repo *repository.Repository) *LLMClient {
	return &LLMClient{cfg: cfg, repo: repo}
}

func (l *LLMClient) Chat(ctx context.Context, messages []dto.Message, chunks []string, lang string) (string, error) {
	var sysBuf bytes.Buffer
	if lang == "en" {
		sysBuf.WriteString(CHAT_SYSTEM_PROMPT_EN_QUITTING_COACH)
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

	resp, err := CallGroqAPI(ctx, l.cfg, payload)
	if err != nil {
		return "", err
	}

	log.Info().Msg("Groq LLM Response: " + resp)

	normalized := regexp.MustCompile(`\n{2,}`).ReplaceAllString(resp, "\n")

	jsonResp := strings.Split(normalized, "\n")
	if len(jsonResp) == 1 { // @NOTE: might enter here if LLM is not able to comply with instructions
		return "I'm sorry, I don't have enough information right now. Please consult your healthcare provider.", nil
	}

	var quittingCoachResponse QuittingCoachResponse
	if err := json.Unmarshal([]byte(jsonResp[1]), &quittingCoachResponse); err != nil {
		return "", fmt.Errorf("unmarshal quitting coach response: %w", err)
	}

	go func() {
		if quittingCoachResponse.MentionedDaysSmokeFree {
			err := l.repo.UpsertProgressStatus(context.Background(), uuid.MustParse("d1fc8771-bac7-4080-913b-2b25e4ab4957"), repository.ProgressEventStatusSlip) // @TODO: get user id from context or drill from handler
			if err != nil {
				log.Error().Msgf("update days smoke free: %v", err)
			}
		}
		if quittingCoachResponse.MentionedMoneySaved {
			err := l.repo.UpsertProgressMoneySaved(context.Background(), uuid.MustParse("d1fc8771-bac7-4080-913b-2b25e4ab4957"), quittingCoachResponse.MoneySaved) // @TODO: get user id from context or drill from handler
			if err != nil {
				log.Error().Msgf("update money saved: %v", err)
			}
		}
	}()

	return jsonResp[0], nil
}

func (l *LLMClient) ExtractText(ctx context.Context, encodedFile string, isText bool) (*ExtractTextResponse, error) {
	systemPromptBlock := ExtractTextContentBlock{
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
		{Role: "user", Content: []ExtractTextContentBlock{systemPromptBlock, dataBlock}},
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
