package embedding

type JinaEmbedData struct {
	Index     int       `json:"index"`
	Embedding []float32 `json:"embedding"`
}

type JinaEmbedResponse struct {
	Data []JinaEmbedData `json:"data"`
}

type JinaEmbedClientRequest struct {
	Model string      `json:"model"`
	Task  string      `json:"task"`
	Input []TextInput `json:"input"`
}

type TextInput struct {
	Text string `json:"text"`
}
