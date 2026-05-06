package com.example.testapi.profile.model;

public class ProfileResponse {

    private String id;
    private String email;
    private String fullName;
    private String nickname;
    private String phone;
    private boolean hasPhoto;
    private String photoUrl;
    private UserSettings settings;

    public ProfileResponse(String id, String email, String fullName, String nickname, String phone, boolean hasPhoto, UserSettings settings) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.nickname = nickname;
        this.phone = phone;
        this.hasPhoto = hasPhoto;
        this.photoUrl = null;
        this.settings = settings;
    }

    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getNickname() { return nickname; }
    public String getPhone() { return phone; }
    public boolean isHasPhoto() { return hasPhoto; }
    public String getPhotoUrl() { return photoUrl; }
    public UserSettings getSettings() { return settings; }
}