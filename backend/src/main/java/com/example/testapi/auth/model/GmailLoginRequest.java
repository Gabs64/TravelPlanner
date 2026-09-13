package com.example.testapi.auth.model;

public class GmailLoginRequest {
    private String email;
    private String fullName;
    private String photoUrl;
    private String googleIdToken;

    public GmailLoginRequest() {}

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public String getGoogleIdToken() { return googleIdToken; }
    public void setGoogleIdToken(String googleIdToken) { this.googleIdToken = googleIdToken; }
}
