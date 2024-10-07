# Use the official Go image as the base image
FROM golang:1.17-alpine

# Set the working directory inside the container
WORKDIR /app

ENV AUTH_TOKEN=1234567890

# Copy the Go module files
COPY go.mod go.sum ./

# Download the dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN go build -o server

# Expose the port the server listens on
EXPOSE 8080

# Run the server
CMD ["./server"]