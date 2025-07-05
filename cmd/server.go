package main

import (
	"log"
	"patient-chatbot/internal/client/embedding"
	"patient-chatbot/internal/client/llm"
	"patient-chatbot/internal/client/vectordb"
	"patient-chatbot/internal/config"
	"patient-chatbot/internal/handler"
	"patient-chatbot/internal/repository"
	"patient-chatbot/internal/service"

	"github.com/gin-contrib/cors"
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
	repository := repository.NewRepository(cfg.DBURL)
	chatService := service.NewService(cfg, llmClient, embeddingClient, vectordbClient, repository)
	h := handler.NewHandler(chatService)

	r := gin.Default()

	r.Use(cors.Default())

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
		api.GET("/documents", h.HandleGetDocuments)
		api.DELETE("/document/:id", h.HandleDeleteDocument)
		api.DELETE("/content/:id", h.HandleDeleteContent)
	}
}
