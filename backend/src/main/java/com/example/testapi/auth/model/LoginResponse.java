package com.example.testapi.auth.model;

public class LoginResponse {
    public String message;
    public String accessToken;
    public String userId;

    public LoginResponse(String message, String accessToken, String userId) {
        this.message = message;
        this.accessToken = accessToken;
        this.userId = userId;
    }
}