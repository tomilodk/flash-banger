package streaks

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"time"
)

const RESET_STREAK_VALUE = 0

type ClientStreaks struct {
	Streaks map[string]*StreakData `json:"streaks"` // key is the other client's name
}

type StreakData struct {
	Streak                 int    `json:"streak"`
	LastMessageSentUtc     string `json:"lastMessageSentUtc"`
	LastStreakIncrementUtc string `json:"lastStreakIncrementUtc"`
}

type StreakService struct {
	baseDir string
}

func NewStreakService(baseDir string) *StreakService {
	dataDir := filepath.Join("data", baseDir)
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		panic(fmt.Sprintf("Failed to create streaks directory: %v", err))
	}

	return &StreakService{baseDir: dataDir}
}

func (s *StreakService) getClientFilePath(client string) string {
	return filepath.Join(s.baseDir, client+".json")
}

func (s *StreakService) loadClientStreaks(client string) (*ClientStreaks, error) {
	filePath := s.getClientFilePath(client)

	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return &ClientStreaks{
			Streaks: make(map[string]*StreakData),
		}, nil
	}

	data, err := os.ReadFile(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read streak file: %v", err)
	}

	var clientStreaks ClientStreaks
	if err := json.Unmarshal(data, &clientStreaks); err != nil {
		return nil, fmt.Errorf("failed to unmarshal streak data: %v", err)
	}

	return &clientStreaks, nil
}

func (s *StreakService) saveClientStreaks(client string, data *ClientStreaks) error {
	filePath := s.getClientFilePath(client)

	jsonData, err := json.MarshalIndent(data, "", "    ")
	if err != nil {
		return fmt.Errorf("failed to marshal streak data: %v", err)
	}

	if err := os.WriteFile(filePath, jsonData, 0644); err != nil {
		return fmt.Errorf("failed to write streak file: %v", err)
	}

	return nil
}

func (s *StreakService) UpdateStreak(sender, recipient string) error {
	currentTime := time.Now().UTC()

	senderStreaks, err := s.loadClientStreaks(sender)
	if err != nil {
		return err
	}

	recipientStreaks, err := s.loadClientStreaks(recipient)
	if err != nil {
		return err
	}

	senderStreak, exists := senderStreaks.Streaks[recipient]
	if !exists {
		senderStreak = &StreakData{
			Streak:                 RESET_STREAK_VALUE,
			LastMessageSentUtc:     currentTime.Format(time.RFC3339),
			LastStreakIncrementUtc: currentTime.Format(time.RFC3339),
		}
		senderStreaks.Streaks[recipient] = senderStreak
	}

	recipientStreak, exists := recipientStreaks.Streaks[sender]
	if !exists {
		recipientStreak = &StreakData{
			Streak:                 RESET_STREAK_VALUE,
			LastMessageSentUtc:     currentTime.Format(time.RFC3339),
			LastStreakIncrementUtc: currentTime.Format(time.RFC3339),
		}
		recipientStreaks.Streaks[sender] = recipientStreak
	}

	lastMessageTime, err := time.Parse(time.RFC3339, senderStreak.LastMessageSentUtc)
	if err != nil {
		return fmt.Errorf("failed to parse last message time: %v", err)
	}

	lastIncrementTime, err := time.Parse(time.RFC3339, senderStreak.LastStreakIncrementUtc)
	if err != nil {
		return fmt.Errorf("failed to parse last increment time: %v", err)
	}

	timeSinceLastMessage := currentTime.Sub(lastMessageTime)
	timeSinceLastIncrement := currentTime.Sub(lastIncrementTime)

	if timeSinceLastMessage.Hours() > 24 {
		senderStreak.Streak = RESET_STREAK_VALUE
		recipientStreak.Streak = RESET_STREAK_VALUE
		senderStreak.LastStreakIncrementUtc = currentTime.Format(time.RFC3339)
		recipientStreak.LastStreakIncrementUtc = currentTime.Format(time.RFC3339)
	} else {
		if timeSinceLastIncrement.Hours() > 24 {
			senderStreak.Streak++
			recipientStreak.Streak = senderStreak.Streak
			senderStreak.LastStreakIncrementUtc = currentTime.Format(time.RFC3339)
			recipientStreak.LastStreakIncrementUtc = currentTime.Format(time.RFC3339)
		}
	}

	senderStreak.LastMessageSentUtc = currentTime.Format(time.RFC3339)
	recipientStreak.LastMessageSentUtc = currentTime.Format(time.RFC3339)

	if err := s.saveClientStreaks(sender, senderStreaks); err != nil {
		return err
	}

	if err := s.saveClientStreaks(recipient, recipientStreaks); err != nil {
		return err
	}

	return nil
}

func (s *StreakService) GetAllStreaks(client string) (*ClientStreaks, error) {
	return s.loadClientStreaks(client)
}

func (s *StreakService) GetStreak(client, otherClient string) (*StreakData, error) {
	clientStreaks, err := s.loadClientStreaks(client)
	if err != nil {
		return nil, err
	}

	streak, exists := clientStreaks.Streaks[otherClient]
	if !exists {
		return &StreakData{
			Streak:                 RESET_STREAK_VALUE,
			LastMessageSentUtc:     "",
			LastStreakIncrementUtc: "",
		}, nil
	}

	return streak, nil
}
