package com.example.testapi.profile.model;

public class ChangePasswordRequest {
    private String newPassword;

    public ChangePasswordRequest() {}

    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
}