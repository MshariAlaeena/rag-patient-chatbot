package handler

import (
	"patient-chatbot/internal/middleware"
	"patient-chatbot/internal/service"
	"patient-chatbot/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

type Handler struct {
	chatService *service.Service
}

func NewHandler(chatService *service.Service) *Handler {
	return &Handler{chatService: chatService}
}

func (h *Handler) HandleGetHealth(c *gin.Context) {
	c.JSON(200, NewResponse("OK", utils.Localize(c, "system_is_up_and_running")))
}

func (h *Handler) HandleChat(c *gin.Context) {
	var request ChatRequestDTO
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(400, NewResponse(nil, utils.Localize(c, "request_is_invalid")))
		return
	}

	lang := middleware.GetLang(c)
	data, err := h.chatService.Chat(c.Request.Context(), request.Messages, lang)
	if err != nil {
		log.Error().Msg("error: " + err.Error())
		c.JSON(500, NewResponse(nil, utils.Localize(c, "an_error_occurred_while_processing_your_request")))
		return
	}

	c.JSON(200, NewResponse(ChatResponseDTO{Answer: data}, utils.Localize(c, "chat_message_sent")))
}

func (h *Handler) HandleUpload(c *gin.Context) {
	var request UploadRequestDTO
	if err := c.ShouldBind(&request); err != nil {
		c.JSON(400, NewResponse(nil, utils.Localize(c, "request_is_invalid")))
		return
	}

	err := h.chatService.Upload(c.Request.Context(), request.File)
	if err != nil {
		log.Error().Msg("error: " + err.Error())
		c.JSON(500, NewResponse(nil, err.Error()))
		return
	}

	c.JSON(200, NewResponse(nil, utils.Localize(c, "file_uploaded_successfully")))
}

func (h *Handler) HandleGetDocuments(c *gin.Context) {
	var request PaginationRequest
	if err := c.ShouldBindQuery(&request); err != nil {
		c.JSON(400, NewResponse(nil, utils.Localize(c, "request_is_invalid")))
		return
	}

	documents, total, err := h.chatService.GetDocuments(c.Request.Context(), request.Page, request.PageSize)
	if err != nil {
		log.Error().Msg("error: " + err.Error())
		c.JSON(500, NewResponse(nil, utils.Localize(c, "an_error_occurred_while_processing_your_request")))
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
	}, utils.Localize(c, "documents_fetched_successfully")))
}

func (h *Handler) HandleDeleteDocument(c *gin.Context) {
	id := c.Param("id")
	err := h.chatService.DeleteDocument(c.Request.Context(), id)
	if err != nil {
		log.Error().Msg("error: " + err.Error())
		c.JSON(500, NewResponse(nil, utils.Localize(c, "an_error_occurred_while_processing_your_request")))
		return
	}
	c.JSON(200, NewResponse(nil, utils.Localize(c, "document_deleted_successfully")))
}

func (h *Handler) HandleDeleteContent(c *gin.Context) {
	id := c.Param("id")
	err := h.chatService.DeleteChunk(c.Request.Context(), id)
	if err != nil {
		log.Error().Msg("error: " + err.Error())
		c.JSON(500, NewResponse(nil, utils.Localize(c, "an_error_occurred_while_processing_your_request")))
		return
	}
	c.JSON(200, NewResponse(nil, utils.Localize(c, "content_deleted_successfully")))
}
