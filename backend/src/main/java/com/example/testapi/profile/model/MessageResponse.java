package com.example.testapi.profile.model;

public class MessageResponse {

    private String message;

    // Default constructor (required for JSON deserialization)
    public MessageResponse() {}

    // Constructor to quickly create a response with a message
    public MessageResponse(String message) {
        this.message = message;
    }

    // Getter
    public String getMessage() {
        return message;
    }

    // Setter
    public void setMessage(String message) {
        this.message = message;
    }
}