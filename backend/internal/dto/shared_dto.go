package dto

import "patient-chatbot/internal/repository"

type Role string

const (
	UserRole      Role = "user"
	AssistantRole Role = "assistant"
	SystemRole    Role = "system"
)

type Message struct {
	Role    Role   `json:"role"`
	Content string `json:"content"`
}

type DashboardData struct {
	TotalMoneySaved     int `json:"total_money_saved"`
	TotalDaysSmokeFree  int `json:"total_days_smoke_free"`
	StreakDaysSmokeFree int `json:"streak_days_smoke_free"`
}

type FullMonthProgressEvents struct {
	Date   string                         `json:"date"`
	Status repository.ProgressEventStatus `json:"status"`
}

/*
GET /api/v1/dashboard
response example:
	{
        "total_money_saved": 0,
        "total_days_smoke_free": 30,
        "streak_days_smoke_free": 16,
	}

GET /api/v1/dashboard/calendar?date=2025-07-01
response example:
	[
		{
			"date": "2025-07-01",
			"status": "SMOKE_FREE"
		},
		{
			"date": "2025-07-02",
			"status": "SLIP"
		}
	]
status values: "SMOKE_FREE", "SLIP", "UNKNOWN"
*/
