package main

import (
	"log"
	"patient-chatbot/internal/config"
	"patient-chatbot/internal/utils"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("error loading config: %v", err)
	}

	utils.Init()
	server := NewServer(cfg)

	if err := server.Run(); err != nil {
		log.Fatalf("error running server: %v", err)
	}
}
