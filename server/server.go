package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"server/streaks"

	"github.com/gorilla/websocket"
)

// Struct to represent a client connection
type Client struct {
	ID      string
	Conn    *websocket.Conn
	Name    string
	Version string
}

var (
	clients      = make(map[string]*Client)
	clientsMutex = sync.Mutex{}
	upgrader     = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow all origins
		},
	}
)

var streakService *streaks.StreakService

// Generate a unique client ID
func generateClientID() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 8)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}

func sendFlashToClient(name string, text string, from string) {
	var targetClient *Client
	clientsMutex.Lock()
	for _, client := range clients {
		if client.Name == name {
			targetClient = client
			break
		}
	}
	clientsMutex.Unlock()

	if targetClient == nil {
		log.Printf("Client not found: %s", name)
		//throw
		return
	}

	body := map[string]string{
		"text": text,
		"from": from,
	}

	// Send the flash message to the client
	message := map[string]interface{}{
		"command": "flash",
		"body":    body,
	}
	jsonMessage, err := json.Marshal(message)

	if err != nil {
		log.Printf("Error marshaling JSON: %v", err)
		return
	}
	err = targetClient.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
	if err != nil {
		log.Printf("Error sending flash to client %s: %v", targetClient.ID, err)
		return
	}

	err = streakService.UpdateStreak(from, targetClient.Name)
	if err != nil {
		log.Printf("Error updating streak for client %s: %v", targetClient.ID, err)
		return
	}

	log.Printf("Flash triggered for client: %s, clientName: %s, text: %s", targetClient.ID, targetClient.Name, text)
}

func getClientObjects(thisClientName string) []string {
	clientsMutex.Lock()
	defer clientsMutex.Unlock()

	filteredClients := make([]*Client, 0)
	for _, client := range clients {
		if client.Name != thisClientName {
			filteredClients = append(filteredClients, client)
		}
	}

	otherClients := make([]string, 0, len(filteredClients))
	for _, client := range filteredClients {
		streak, err := streakService.GetStreak(client.Name, thisClientName)
		if err != nil {
			log.Printf("Error getting streak for client %s: %v", client.Name, err)
			continue
		}
		lastMessageTime, _ := time.Parse(time.RFC3339, streak.LastMessageSentUtc)
		timeSinceLastMessage := time.Now().UTC().Sub(lastMessageTime).Seconds()
		otherClients = append(otherClients, fmt.Sprintf("%s|%s|%d|%.0f", client.Name, client.Version, streak.Streak, timeSinceLastMessage))
	}
	return otherClients
}

func getNames() []string {
	clientsMutex.Lock()
	defer clientsMutex.Unlock()

	names := make([]string, 0, len(clients))
	for _, client := range clients {
		names = append(names, client.Name)
	}
	return names
}

// WebSocket handler for client connections
func handleClientConnection(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error upgrading connection: %v", err)
		return
	}

	// Generate a client ID and register the client
	clientID := generateClientID()
	client := &Client{
		ID:   clientID,
		Conn: conn,
	}

	clientsMutex.Lock()
	clients[clientID] = client
	clientsMutex.Unlock()

	// Send the client ID to the client
	err = conn.WriteMessage(websocket.TextMessage, []byte(clientID))
	if err != nil {
		log.Printf("Error sending client ID: %v", err)
		return
	}

	log.Printf("Client registered with ID: %s", clientID)

	// Listen for client messages (not used in this example)
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Client disconnected: %s", clientID)
			clientsMutex.Lock()
			delete(clients, clientID)
			clientsMutex.Unlock()
			conn.Close()
			break
		}

		log.Printf("Received message: %s", message)

		var msg struct {
			Command string `json:"command"`
			Body    string `json:"body"`
		}

		if err := json.Unmarshal(message, &msg); err != nil {
			log.Printf("Error unmarshaling message: %v", err)
			continue
		}

		if msg.Command == "set-name" {
			client.Name = msg.Body

			// if name already exists, disconnect
			clientsMutex.Lock()
			if _, ok := clients[client.Name]; ok {
				log.Printf("Client name already exists: %s", client.Name)
				conn.WriteMessage(websocket.TextMessage, []byte("name-taken"))

				conn.Close()
				break
			}
			clientsMutex.Unlock()

			log.Printf("Client name set to: %s", client.Name)
		} else if msg.Command == "send-message" {
			var requestBody struct {
				Name string `json:"name"`
				Text string `json:"text"`
			}

			if err := json.Unmarshal([]byte(msg.Body), &requestBody); err != nil {
				log.Printf("Error unmarshaling message in send-message: %v", err)
				continue
			}

			sendFlashToClient(requestBody.Name, requestBody.Text, client.Name)
		} else if msg.Command == "set-version" {
			client.Version = msg.Body
			log.Printf("Client version set to: %s", client.Version)
		} else if msg.Command == "get-raw-clients" {
			var response struct {
				Command string `json:"command"`
				Body    string `json:"body"`
			}
			response.Command = "get-raw-clients-response"
			clientObjectsRaw := getClientObjects(client.Name)
			clientObjects := strings.Join(clientObjectsRaw, ",")

			response.Body = clientObjects

			jsonResponse, err := json.Marshal(response)
			if err != nil {
				log.Printf("Error marshaling JSON: %v", err)
				continue
			}
			conn.WriteMessage(websocket.TextMessage, jsonResponse)
		} else if msg.Command == "get-names" {
			var response struct {
				Command string `json:"command"`
				Body    string `json:"body"`
			}
			response.Command = "get-names-response"
			clientObjectsRaw := getNames()
			clientObjects := strings.Join(clientObjectsRaw, ",")

			response.Body = clientObjects

			jsonResponse, err := json.Marshal(response)
			if err != nil {
				log.Printf("Error marshaling JSON: %v", err)
				continue
			}
			conn.WriteMessage(websocket.TextMessage, jsonResponse)
		}
	}
}

// Handler to trigger flash on a specific client
func triggerFlashAll(w http.ResponseWriter, r *http.Request) {
	auth := r.Header.Get("Authorization")
	if auth != os.Getenv("AUTH_TOKEN") {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	from := r.URL.Query().Get("from")
	if from == "" {
		http.Error(w, "Missing from", http.StatusBadRequest)
		return
	}
	if len(from) > 10 || len(from) < 2 {
		http.Error(w, "From should be 2-10 characters", http.StatusBadRequest)
		return
	}

	var requestBody struct {
		Text string `json:"text"`
	}
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&requestBody); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	text := requestBody.Text

	if text == "" {
		http.Error(w, "Missing text", http.StatusBadRequest)
		return
	}

	for _, client := range clients {
		sendFlashToClient(client.Name, text, from)
	}

	w.WriteHeader(http.StatusOK)
}

func main() {
	streakService = streaks.NewStreakService("streaks")

	http.HandleFunc("/ws", handleClientConnection)
	http.HandleFunc("/flash-all", triggerFlashAll)

	log.Println("Server listening on :8080")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", nil))
}
