package com.example.testapi.profile.model;

public class EditProfileRequest {
    private String fullName;
    private String phone;

    public EditProfileRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}