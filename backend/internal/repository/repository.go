package repository

import (
	"context"
	"time"

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
		&User{},
		&ProgressEvent{},
	)
	if err != nil {
		log.Error().Msg("migration failed: " + err.Error())
	}

	db.FirstOrCreate(&User{
		BaseModel: BaseModel{
			ID: uuid.MustParse("d1fc8771-bac7-4080-913b-2b25e4ab4957"),
		},
		Email:         "malaeena@groq.com",
		Password:      "123456",
		MoneySaved:    0,
		DaysSmokeFree: 0,
	})

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

func (r *Repository) UpsertProgressMoneySaved(ctx context.Context, userID uuid.UUID, money int) error {
	today := time.Now()

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		res := tx.Model(&ProgressEvent{}).
			Where("user_id = ? AND date = ?", userID, today).
			UpdateColumn("money_saved", gorm.Expr("COALESCE(money_saved,0) + ?", money))
		if res.Error != nil {
			return res.Error
		}

		if res.RowsAffected == 0 {
			evt := ProgressEvent{
				BaseModel: BaseModel{
					ID: uuid.New(),
				},
				UserID:     userID,
				Date:       time.Now(),
				Status:     ProgressEventStatusSmokeFree,
				MoneySaved: &money,
			}
			if err := tx.Create(&evt).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

func (r *Repository) UpsertProgressStatus(
	ctx context.Context,
	userID uuid.UUID,
	status ProgressEventStatus,
) error {
	today := time.Now().Format("2006-01-02")

	return r.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		res := tx.Model(&ProgressEvent{}).
			Where("user_id = ? AND date = ?", userID, today).
			UpdateColumn("status", status)
		if res.Error != nil {
			return res.Error
		}

		if res.RowsAffected == 0 {
			evt := ProgressEvent{
				BaseModel: BaseModel{
					ID: uuid.New(),
				},
				UserID: userID,
				Date:   time.Now(),
				Status: status,
			}
			if err := tx.Create(&evt).Error; err != nil {
				return err
			}
		}
		return nil
	})
}

func (r *Repository) GetProgressEventsForMonth(
	ctx context.Context,
	userID uuid.UUID,
	date time.Time,
) ([]ProgressEvent, error) {
	start := time.Date(date.Year(), date.Month(), 1, 0, 0, 0, 0, date.Location())
	end := start.AddDate(0, 1, 0)

	var progressEvents []ProgressEvent
	result := r.db.WithContext(ctx).
		Where("user_id = ? AND date >= ? AND date < ?", userID, start, end).
		Order("date ASC").
		Find(&progressEvents)
	if result.Error != nil {
		return nil, result.Error
	}
	return progressEvents, nil
}

func (r *Repository) GetUserByID(ctx context.Context, id uuid.UUID) (*User, error) {
	var user User
	err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *Repository) CreateProgressEvent(ctx context.Context, progressEvent *ProgressEvent) error {
	return r.db.WithContext(ctx).Create(progressEvent).Error
}

func (r *Repository) GetProgressEventsByUserID(ctx context.Context, userID uuid.UUID) ([]ProgressEvent, error) {
	var progressEvents []ProgressEvent
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Find(&progressEvents).Error
	if err != nil {
		return nil, err
	}
	return progressEvents, nil
}
