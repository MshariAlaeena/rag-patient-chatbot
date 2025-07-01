package main

import (
	"log"
	"patient-chatbot/internal/client/embedding"
	"patient-chatbot/internal/client/llm"
	"patient-chatbot/internal/client/vectordb"
	"patient-chatbot/internal/config"
	"patient-chatbot/internal/handler"
	"patient-chatbot/internal/service"

	"github.com/gin-gonic/gin"
)

type Server struct {
	router *gin.Engine
}

func NewServer(cfg *config.Config) *Server {
	llmClient := llm.NewLLMClient(cfg)
	embeddingClient := embedding.NewEmbeddingClient(cfg)
	vectordbClient, err := vectordb.NewVectordbClient(cfg)
	if err != nil {
		log.Fatalf("Failed to create vectordb client: %v", err)
	}
	chatService := service.NewService(cfg, llmClient, embeddingClient, vectordbClient)
	h := handler.NewHandler(chatService)

	r := gin.Default()
	RegisterRoutes(r, h)

	return &Server{router: r}
}

func (s *Server) Run() error {
	return s.router.Run(":8080")
}

func RegisterRoutes(r *gin.Engine, h *handler.Handler) {
	api := r.Group("/api/v1")
	{
		api.GET("/health", h.HandleGetHealth)
		api.POST("/chat", h.HandleChat)
		api.POST("/upload", h.HandleUpload)
	}
}
