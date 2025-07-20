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

type User struct {
	BaseModel
	Email         string `gorm:"not null;type:varchar(255)"`
	Password      string `gorm:"not null;type:varchar(255)"`
	MoneySaved    int    `gorm:"not null;type:int"`
	DaysSmokeFree int    `gorm:"not null;type:int"`

	ProgressEvents []ProgressEvent `gorm:"foreignKey:UserID"`
}

type ProgressEventStatus string

const (
	ProgressEventStatusSlip      ProgressEventStatus = "SLIP"
	ProgressEventStatusUnknown   ProgressEventStatus = "UNKNOWN"
	ProgressEventStatusSmokeFree ProgressEventStatus = "SMOKE_FREE" // @NOTE: this is not used in the database, it's only for the client to know that the user is smoke free
)

type ProgressEvent struct {
	BaseModel
	UserID     uuid.UUID           `gorm:"not null;type:uuid"`
	Date       time.Time           `gorm:"not null;type:date;uniqueIndex:idx_user_date"`
	Status     ProgressEventStatus `gorm:"not null;type:varchar(255)"`
	Notes      *string             `gorm:"type:text;default:NULL"`
	MoneySaved *int                `gorm:"type:int;default:0"`

	User User `gorm:"foreignKey:UserID"`
}
