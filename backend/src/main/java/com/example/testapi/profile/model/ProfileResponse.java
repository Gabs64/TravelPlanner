package com.example.testapi.profile.model;

public class ProfileResponse {
    public String id;
    public String email;
    public String fullName;
    public String phone;
    public boolean hasPhoto;

    public ProfileResponse(String id, String email, String fullName, String phone, boolean hasPhoto) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.phone = phone;
        this.hasPhoto = hasPhoto;
    }
}