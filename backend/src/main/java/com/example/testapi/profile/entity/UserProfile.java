package com.example.testapi.profile.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @Column(length = 36)
    private String id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "nickname")
    private String nickname;

    @Column(name = "phone")
    private String phone;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "photo_bytes", columnDefinition = "bytea")
    private byte[] photoBytes;

    @Column(name = "photo_mime")
    private String photoMime;

    @Column(name = "dark_mode", columnDefinition = "boolean default false")
    private boolean darkMode;

    @Column(name = "notifications", columnDefinition = "boolean default true")
    private boolean notifications;

    @Column(name = "language", length = 10, columnDefinition = "varchar(10) default 'en'")
    private String language;

    @Column(name = "privacy", length = 20, columnDefinition = "varchar(20) default 'public'")
    private String privacy;

    public UserProfile() {}

    public UserProfile(String id, String email, String fullName, String nickname, String phone, String passwordHash, String photoMime) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.nickname = nickname;
        this.phone = phone;
        this.passwordHash = passwordHash;
        this.photoMime = photoMime;
        this.darkMode = false;
        this.notifications = true;
        this.language = "en";
        this.privacy = "public";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public byte[] getPhotoBytes() { return photoBytes; }
    public void setPhotoBytes(byte[] photoBytes) { this.photoBytes = photoBytes; }

    public String getPhotoMime() { return photoMime; }
    public void setPhotoMime(String photoMime) { this.photoMime = photoMime; }

    public boolean isDarkMode() { return darkMode; }
    public void setDarkMode(boolean darkMode) { this.darkMode = darkMode; }

    public boolean isNotifications() { return notifications; }
    public void setNotifications(boolean notifications) { this.notifications = notifications; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getPrivacy() { return privacy; }
    public void setPrivacy(String privacy) { this.privacy = privacy; }
}