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

	data, err := h.chatService.Chat(c.Request.Context(), request.Messages)
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

	err := h.chatService.Upload(c.Request.Context(), request.File)
	if err != nil {
		c.JSON(500, NewResponse(nil, err.Error()))
		return
	}

	c.JSON(200, NewResponse(nil, "File uploaded successfully"))
}

func (h *Handler) HandleGetDocuments(c *gin.Context) {
	var request PaginationRequest
	if err := c.ShouldBindQuery(&request); err != nil {
		c.JSON(400, NewResponse(nil, "invalid request"))
		return
	}

	documents, total, err := h.chatService.GetDocuments(c.Request.Context(), request.Page, request.PageSize)
	if err != nil {
		c.JSON(500, NewResponse(nil, "an error occurred while fetching documents"))
		return
	}

	documentsDTO := make([]Documents, len(documents))
	for i, document := range documents {
		chunkContents := make([]ExtractedContent, len(document.Chunks))
		for j, chunk := range document.Chunks {
			chunkContents[j] = ExtractedContent{
				ContentID: chunk.ID.String(),
				Content:   chunk.Content,
			}
		}
		documentsDTO[i] = Documents{
			DocumentID:        document.ID.String(),
			DocumentName:      document.Title + document.Extension,
			DocumentExtension: Extension(document.Extension),
			ExtractedContent:  chunkContents,
			UploadedAt:        document.CreatedAt.Format("2006-01-02"),
		}
	}

	c.JSON(200, NewResponse(GetDocumentsResponseDTO{
		Documents: documentsDTO,
		PageSize:  request.PageSize,
		Page:      request.Page,
		Total:     total,
	}, "Documents fetched successfully"))
}

func (h *Handler) HandleDeleteDocument(c *gin.Context) {
	id := c.Param("id")
	err := h.chatService.DeleteDocument(c.Request.Context(), id)
	if err != nil {
		c.JSON(500, NewResponse(nil, "an error occurred while deleting document"))
		return
	}
	c.JSON(200, NewResponse(nil, "Document deleted successfully"))
}

func (h *Handler) HandleDeleteContent(c *gin.Context) {
	id := c.Param("id")
	err := h.chatService.DeleteChunk(c.Request.Context(), id)
	if err != nil {
		c.JSON(500, NewResponse(nil, "an error occurred while deleting content"))
		return
	}
	c.JSON(200, NewResponse(nil, "Content deleted successfully"))
}
