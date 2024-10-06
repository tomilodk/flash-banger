package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

// Struct to represent a client connection
type Client struct {
	ID   string
	Conn *websocket.Conn
	Name string
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

// Generate a unique client ID
func generateClientID() string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, 8)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
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
			log.Printf("Client name set to: %s", client.Name)
		}
	}
}

// Handler to trigger flash on a specific client
func triggerFlash(w http.ResponseWriter, r *http.Request) {
	clientName := r.URL.Query().Get("name")
	if clientName == "" {
		http.Error(w, "Missing client name", http.StatusBadRequest)
		return
	}

	var targetClient *Client
	clientsMutex.Lock()
	for _, client := range clients {
		if client.Name == clientName {
			targetClient = client
			break
		}
	}
	clientsMutex.Unlock()

	if targetClient == nil {
		http.Error(w, "Client not found", http.StatusNotFound)
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

	// Send the flash message to the client
	message := map[string]string{
		"command": "flash",
		"body":    text,
	}
	jsonMessage, err := json.Marshal(message)

	if err != nil {
		log.Printf("Error marshaling JSON: %v", err)
		http.Error(w, "Failed to create flash message", http.StatusInternalServerError)
		return
	}
	err = targetClient.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
	if err != nil {
		log.Printf("Error sending flash to client %s: %v", targetClient.ID, err)
		http.Error(w, "Failed to trigger flash", http.StatusInternalServerError)
		return
	}

	log.Printf("Flash triggered for client: %s", targetClient.ID)
	w.WriteHeader(http.StatusOK)
}

func main() {
	rand.Seed(time.Now().UnixNano())

	http.HandleFunc("/ws", handleClientConnection)
	http.HandleFunc("/flash", triggerFlash)

	log.Println("Server listening on :8080")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", nil))
}
