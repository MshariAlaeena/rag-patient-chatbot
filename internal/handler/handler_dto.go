package handler

import "mime/multipart"

type HandlerResponse struct {
	Data    interface{} `json:"data"`
	Message string      `json:"message"`
}

func NewResponse(data interface{}, message string) HandlerResponse {
	return HandlerResponse{
		Data:    data,
		Message: message,
	}
}

type ChatRequestDTO struct {
	OrgID    string `json:"org_id" binding:"required"`
	Question string `json:"question" binding:"required"`
}

type ChatResponseDTO struct {
	Answer string `json:"answer"`
}

type UploadRequestDTO struct {
	OrgID string                `form:"org_id" binding:"required"`
	File  *multipart.FileHeader `form:"file"  binding:"required"`
}

type UploadResponseDTO struct {
	Answer string `json:"answer"`
}
