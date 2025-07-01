package handler

import (
	"patient-chatbot/internal/service"

	"github.com/gin-gonic/gin"
)

type Handler struct {
	chatService *service.Service
}

func NewHandler(chatService *service.Service) *Handler {
	return &Handler{chatService: chatService}
}

func (h *Handler) HandleGetHealth(c *gin.Context) {
	c.JSON(200, NewResponse("OK", "System is Up and Running!"))
}

func (h *Handler) HandleChat(c *gin.Context) {
	var request ChatRequestDTO
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, NewResponse(nil, "Request is invalid"))
		return
	}

	data, err := h.chatService.Chat(c.Request.Context(), request.OrgID, request.Question)
	if err != nil {
		c.JSON(500, NewResponse(nil, "an error occurred while processing your request"))
		return
	}

	c.JSON(200, NewResponse(ChatResponseDTO{Answer: data}, "Chat message sent"))
}

func (h *Handler) HandleUpload(c *gin.Context) {
	var request UploadRequestDTO
	if err := c.ShouldBind(&request); err != nil {
		c.JSON(400, NewResponse(nil, "Request is invalid"))
		return
	}

	err := h.chatService.Upload(c.Request.Context(), request.OrgID, request.File)
	if err != nil {
		c.JSON(500, NewResponse(nil, err.Error()))
		return
	}

	c.JSON(200, NewResponse(nil, "File uploaded successfully"))
}
