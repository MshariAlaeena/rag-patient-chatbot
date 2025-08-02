package handler

import (
	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine, h *Handler) {
	api := r.Group("/api/v1")
	{
		api.GET("/health", h.HandleGetHealth)
		api.POST("/chat", h.HandleChat)
		api.POST("/upload", h.HandleUpload)
		api.GET("/documents", h.HandleGetDocuments)
		api.DELETE("/document/:id", h.HandleDeleteDocument)
		api.DELETE("/content/:id", h.HandleDeleteContent)
		api.GET("/dashboard", h.HandleGetDashboardData)
		api.GET("/dashboard/calendar", h.HandleGetDashboardCalendar)
		api.POST("/dashboard/slip", h.HandleReportSlip)
	}
}
