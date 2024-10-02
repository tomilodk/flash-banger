package main

import (
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
		_, _, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Client disconnected: %s", clientID)
			clientsMutex.Lock()
			delete(clients, clientID)
			clientsMutex.Unlock()
			conn.Close()
			break
		}
	}
}

// Handler to trigger flash on a specific client
func triggerFlash(w http.ResponseWriter, r *http.Request) {
	clientID := r.URL.Query().Get("id")
	if clientID == "" {
		http.Error(w, "Missing client ID", http.StatusBadRequest)
		return
	}

	clientsMutex.Lock()
	client, exists := clients[clientID]
	clientsMutex.Unlock()

	if !exists {
		http.Error(w, "Client not found", http.StatusNotFound)
		return
	}

	// Send the flash message to the client
	err := client.Conn.WriteMessage(websocket.TextMessage, []byte("flash"))
	if err != nil {
		log.Printf("Error sending flash to client %s: %v", clientID, err)
		http.Error(w, "Failed to trigger flash", http.StatusInternalServerError)
		return
	}

	log.Printf("Flash triggered for client: %s", clientID)
	w.WriteHeader(http.StatusOK)
}

func main() {
	rand.Seed(time.Now().UnixNano())

	http.HandleFunc("/ws", handleClientConnection)
	http.HandleFunc("/flash", triggerFlash)

	log.Println("Server listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
