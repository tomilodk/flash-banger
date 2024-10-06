package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"strings"
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

func sendFlashToClient(name string, text string) {
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

	// Send the flash message to the client
	message := map[string]string{
		"command": "flash",
		"body":    text,
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

	log.Printf("Flash triggered for client: %s, clientName: %s, text: %s", targetClient.ID, targetClient.Name, text)
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

			sendFlashToClient(requestBody.Name, requestBody.Text)
		} else if msg.Command == "get-names" {
			var response struct {
				Command string `json:"command"`
				Body    string `json:"body"`
			}
			response.Command = "get-names-response"
			response.Body = strings.Join(getNames(), ",")

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
func triggerFlash(w http.ResponseWriter, r *http.Request) {
	clientName := r.URL.Query().Get("name")
	if clientName == "" {
		http.Error(w, "Missing client name", http.StatusBadRequest)
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

	sendFlashToClient(clientName, text)

	w.WriteHeader(http.StatusOK)
}

func main() {
	rand.Seed(time.Now().UnixNano())

	http.HandleFunc("/ws", handleClientConnection)
	http.HandleFunc("/flash", triggerFlash)

	log.Println("Server listening on :8080")
	log.Fatal(http.ListenAndServe("0.0.0.0:8080", nil))
}
