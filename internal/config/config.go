package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	PineconeNamespace    string
	PineconeAPIKey       string
	PineconeHost         string
	PineconeIndex        string
	JinaEmbedURL         string
	JinaAuthToken        string
	GroqAPIKey           string
	LLMModel             string
	MULTIMODAL_LLM_MODEL string
	DBURL                string
}

func Load() (*Config, error) {
	err := godotenv.Load()
	if err != nil {
		return nil, fmt.Errorf("error loading .env file: %w", err)
	}

	cfg := &Config{
		PineconeNamespace:    os.Getenv("PINECONE_NAMESPACE"),
		PineconeAPIKey:       os.Getenv("PINECONE_API_KEY"),
		PineconeIndex:        os.Getenv("PINECONE_INDEX"),
		PineconeHost:         os.Getenv("PINECONE_HOST"),
		JinaEmbedURL:         os.Getenv("JINA_EMBED_URL"),
		JinaAuthToken:        os.Getenv("JINA_AUTH_TOKEN"),
		GroqAPIKey:           os.Getenv("GROQ_API_KEY"),
		LLMModel:             os.Getenv("LLM_MODEL"),
		MULTIMODAL_LLM_MODEL: os.Getenv("MULTIMODAL_LLM_MODEL"),
	}

	if cfg.PineconeAPIKey == "" || cfg.PineconeIndex == "" || cfg.PineconeHost == "" || cfg.GroqAPIKey == "" || cfg.LLMModel == "" || cfg.MULTIMODAL_LLM_MODEL == "" {
		return nil, fmt.Errorf("missing required environment variables")
	}
	return cfg, nil
}
