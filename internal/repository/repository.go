package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type Repository struct {
	db *gorm.DB
}

func NewRepository(dbURL string) *Repository {
	db, err := gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Error().Msg("Failed to connect to database: " + err.Error())
	}

	err = db.AutoMigrate(
		&Document{},
		&Chunk{},
		&Message{},
	)
	if err != nil {
		log.Error().Msg("migration failed: " + err.Error())
	}
	return &Repository{db: db}
}

func (r *Repository) CreateDocument(ctx context.Context, document *Document) error {
	return r.db.WithContext(ctx).Create(document).Error
}

func (r *Repository) CreateChunks(ctx context.Context, chunks []*Chunk) error {
	return r.db.WithContext(ctx).Create(chunks).Error
}

func (r *Repository) CreateMessage(ctx context.Context, message *Message) error {
	return r.db.WithContext(ctx).Create(message).Error
}

func (r *Repository) GetAllDocuments(ctx context.Context, offset int, pageSize int) ([]Document, int, error) {
	var documents []Document
	var total int64
	err := r.db.WithContext(ctx).Preload("Chunks").Offset(offset).Limit(pageSize).Find(&documents).Error
	if err != nil {
		return nil, 0, err
	}
	err = r.db.WithContext(ctx).Model(&Document{}).Count(&total).Error
	if err != nil {
		return nil, 0, err
	}
	return documents, int(total), nil
}

func (r *Repository) GetDocumentByID(ctx context.Context, id uuid.UUID) (*Document, error) {
	var document Document
	err := r.db.WithContext(ctx).Preload("Chunks").First(&document, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &document, nil
}

func (r *Repository) GetChunkByID(ctx context.Context, id uuid.UUID) (*Chunk, error) {
	var chunk Chunk
	err := r.db.WithContext(ctx).First(&chunk, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &chunk, nil
}

func (r *Repository) SoftDeleteDocumentAndChunks(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := tx.Delete(&Chunk{}, "document_id = ?", id).Error; err != nil {
			return err
		}
		return tx.Delete(&Document{}, "id = ?", id).Error
	})
}

func (r *Repository) SoftDeleteChunk(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&Chunk{}, "id = ?", id).Error
}
