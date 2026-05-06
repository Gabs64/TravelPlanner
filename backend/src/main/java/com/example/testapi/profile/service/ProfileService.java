package com.example.testapi.profile.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.testapi.profile.entity.UserProfile;
import com.example.testapi.profile.model.ChangePasswordRequest;
import com.example.testapi.profile.model.EditProfileRequest;
import com.example.testapi.profile.model.MessageResponse;
import com.example.testapi.profile.model.UserSettings;
import com.example.testapi.profile.repository.UserProfileRepo;

@Service
public class ProfileService {

    private final UserProfileRepo repo;

    public ProfileService(UserProfileRepo repo) {
        this.repo = repo;
    }

    public UserProfile getUserEntity(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public ProfileResponse getProfile(String id) {
        UserProfile p = getUserEntity(id);

        UserSettings settings = new UserSettings(
                p.isDarkMode(),
                p.isNotifications(),
                p.getLanguage(),
                p.getPrivacy()
        );

        return new ProfileResponse(
                p.getId(),
                p.getEmail(),
                p.getFullName(),
                p.getNickname(),
                p.getPhone(),
                p.getPhotoBytes() != null,
                settings
        );
    }

    @Transactional
    public MessageResponse editProfile(String id, EditProfileRequest req) {
        UserProfile p = getUserEntity(id);

        if (req.getFullName() != null) p.setFullName(req.getFullName());
        if (req.getNickname() != null) p.setNickname(req.getNickname());
        if (req.getPhone() != null) p.setPhone(req.getPhone());

        repo.save(p);
        return new MessageResponse("Profile updated successfully");
    }

    @Transactional
    public MessageResponse changePassword(String id, ChangePasswordRequest req) {
        UserProfile p = getUserEntity(id);
        // Simple hash, replace with BCrypt in production
        p.setPasswordHash(Integer.toString(req.getNewPassword().hashCode()));
        repo.save(p);
        return new MessageResponse("Password updated successfully");
    }

    @Transactional
    public MessageResponse uploadPhoto(String id, MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            return new MessageResponse("File required");
        }

        String type = file.getContentType();
        if (type == null || (!type.equals("image/png") && !type.equals("image/jpeg"))) {
            return new MessageResponse("Only .png and .jpg allowed");
        }

        UserProfile p = getUserEntity(id);

        p.setPhotoBytes(file.getBytes());  // ✅ store bytes
        p.setPhotoMime(type);              // store MIME type

        repo.save(p);

        return new MessageResponse("Photo uploaded successfully");
    }

    @Transactional
    public MessageResponse updateSettings(String id, UserSettings settings) {
        UserProfile p = getUserEntity(id);

        p.setDarkMode(settings.isDarkMode());
        p.setNotifications(settings.isNotifications());
        p.setLanguage(settings.getLanguage());
        p.setPrivacy(settings.getPrivacy());

        repo.save(p);
        return new MessageResponse("Settings updated successfully");
    }

    @Transactional
    public void saveUser(UserProfile user) {
        repo.save(user);
    }
}