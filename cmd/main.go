package main

import (
	"log"
	"patient-chatbot/internal/config"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("error loading config: %v", err)
	}

	server := NewServer(cfg)

	if err := server.Run(); err != nil {
		log.Fatalf("error running server: %v", err)
	}
}
