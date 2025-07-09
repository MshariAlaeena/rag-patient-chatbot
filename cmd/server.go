package main

import (
	"patient-chatbot/internal/client/llm"
	"patient-chatbot/internal/client/vectordb"
	"patient-chatbot/internal/config"
	"patient-chatbot/internal/handler"
	logger "patient-chatbot/internal/log"
	"patient-chatbot/internal/middleware"
	"patient-chatbot/internal/repository"
	"patient-chatbot/internal/service"
	"patient-chatbot/internal/utils"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type Server struct {
	router *gin.Engine
}

func NewServer(cfg *config.Config) *Server {
	r := gin.New()

	r.Use(middleware.LocaleMiddleware(utils.Bundle))
	r.Use(middleware.RequestID())

	r.Use(gin.Recovery())
	r.Use(cors.Default())

	r.Use(logger.Init())

	llmClient := llm.NewLLMClient(cfg)
	vectordbClient, err := vectordb.NewVectordbClient(cfg)
	if err != nil {
		log.Error().Msg("Failed to create vectordb client: " + err.Error())
	}
	repository := repository.NewRepository(cfg.DBURL)
	chatService := service.NewService(cfg, llmClient, vectordbClient, repository)
	h := handler.NewHandler(chatService)

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
