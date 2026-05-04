package com.example.testapi.profile.model;

public class ProfileResponse {

    private String id;
    private String email;
    private String fullName;
    private String nickname;
    private String phone;
    private boolean hasPhoto;
    private String photoUrl;

    public ProfileResponse(String id, String email, String fullName, String nickname, String phone, boolean hasPhoto) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.nickname = nickname;
        this.phone = phone;
        this.hasPhoto = hasPhoto;

        if (hasPhoto) {
            this.photoUrl = "http://localhost:8080/profile/" + id + "/photo";
        }
    }

    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public String getNickname() { return nickname; }
    public String getPhone() { return phone; }
    public boolean isHasPhoto() { return hasPhoto; }
    public String getPhotoUrl() { return photoUrl; }
}