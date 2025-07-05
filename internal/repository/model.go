package repository

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BaseModel struct {
	ID        uuid.UUID      `gorm:"primaryKey;type:uuid;"`
	CreatedAt time.Time      `gorm:"not null;autoCreateTime"`
	UpdatedAt time.Time      `gorm:"not null;autoUpdateTime"`
	DeletedAt gorm.DeletedAt `gorm:"default:null"`
}

type Document struct {
	BaseModel
	Title     string `gorm:"not null;type:varchar(255)"`
	Category  string `gorm:"not null;type:varchar(255)"`
	Path      string `gorm:"not null;type:varchar(255)"`
	Extension string `gorm:"not null;type:varchar(255)"`

	Chunks   []Chunk   `gorm:"foreignKey:DocumentID"`
	Messages []Message `gorm:"foreignKey:DocumentID"`
}

type Chunk struct {
	BaseModel
	Content    string    `gorm:"not null;type:text"`
	DocumentID uuid.UUID `gorm:"not null;type:uuid"`

	Document Document `gorm:"foreignKey:DocumentID"`
}

type Message struct {
	BaseModel
	Role       string    `gorm:"not null;type:varchar(255)"`
	Content    string    `gorm:"not null;type:text"`
	DocumentID uuid.UUID `gorm:"not null;type:uuid"`

	Document Document `gorm:"foreignKey:DocumentID"`
}
