package com.example.testapi.profile.model;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserSettings {
    @JsonProperty("darkMode")
    private boolean darkMode;

    @JsonProperty("notifications")
    private boolean notifications;

    @JsonProperty("language")
    private String language;

    @JsonProperty("privacy")
    private String privacy;

    public UserSettings() {}

    public UserSettings(boolean darkMode, boolean notifications, String language, String privacy) {
        this.darkMode = darkMode;
        this.notifications = notifications;
        this.language = language;
        this.privacy = privacy;
    }

    public boolean isDarkMode() { return darkMode; }
    public void setDarkMode(boolean darkMode) { this.darkMode = darkMode; }

    public boolean isNotifications() { return notifications; }
    public void setNotifications(boolean notifications) { this.notifications = notifications; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getPrivacy() { return privacy; }
    public void setPrivacy(String privacy) { this.privacy = privacy; }
}