package main

import (
	"log"
	"net/url"
	"os/exec"
	"runtime"

	"github.com/gorilla/websocket"
)

// Function to trigger flash screen
func triggerFlash() {
	switch runtime.GOOS {
	case "windows":
		flashWindows()
	case "darwin":
		flashMac()
	default:
		log.Println("Unsupported platform")
	}
}

// Flash effect for Windows
func flashWindows() {
	cmd := exec.Command("powershell", "-Command", `
        Add-Type -AssemblyName PresentationFramework; 
        $window = New-Object Windows.Window;
        $window.WindowStartupLocation = "CenterScreen";
        $window.WindowStyle = 'None';
        $window.Background = 'White';
        $window.Topmost = $true;
        $window.Width = 1920;
        $window.Height = 1080;
        $window.Show();
        Start-Sleep -Seconds 1;
        $window.Close();
    `)
	cmd.Run()
}

// Flash effect for macOS
func flashMac() {
	cmd := exec.Command("osascript", "-e", `
        tell application "System Events" 
            set the bounds of the first window to {0, 0, 1920, 1080} 
            set background color of the first window to {65535, 65535, 65535} 
        end tell
        delay 1
        tell application "System Events" to close the first window
    `)
	cmd.Run()
}

func main() {
	// Connect to the WebSocket server
	u := url.URL{Scheme: "ws", Host: "localhost:8080", Path: "/ws"}
	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatalf("Error connecting to WebSocket server: %v", err)
	}
	defer conn.Close()

	// Read client ID
	_, message, err := conn.ReadMessage()
	if err != nil {
		log.Fatalf("Error reading client ID: %v", err)
	}
	clientID := string(message)
	log.Printf("Connected with client ID: %s", clientID)

	// Listen for messages from the server
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Println("Disconnected from server")
			break
		}

		// Handle "flash" message
		if string(message) == "flash" {
			log.Println("Flash triggered")
			triggerFlash()
		}
	}
}
