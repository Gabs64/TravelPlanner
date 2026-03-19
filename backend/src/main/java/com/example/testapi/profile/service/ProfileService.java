package com.example.testapi.profile.service;

import com.example.testapi.profile.entity.UserProfile;
import com.example.testapi.profile.model.*;
import com.example.testapi.profile.repository.UserProfileRepo;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProfileService {

    private final UserProfileRepo repo;

    public ProfileService(UserProfileRepo repo) {
        this.repo = repo;
    }

    private UserProfile getUser(String id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public ProfileResponse getProfile(String id) {
        UserProfile p = getUser(id);
        return new ProfileResponse(
                p.getId(),
                p.getEmail(),
                p.getFullName(),
                p.getPhone(),
                p.getPhotoBytes() != null
        );
    }

    public MessageResponse editProfile(String id, EditProfileRequest req) {
        UserProfile p = getUser(id);
        if (req.getFullName() != null) p.setFullName(req.getFullName());
        if (req.getPhone() != null) p.setPhone(req.getPhone());
        repo.save(p);
        return new MessageResponse("Profile updated successfully");
    }

    public MessageResponse changePassword(String id, ChangePasswordRequest req) {
        UserProfile p = getUser(id);
        p.setPasswordHash(Integer.toString(req.getNewPassword().hashCode()));
        repo.save(p);
        return new MessageResponse("Password updated successfully");
    }

    public MessageResponse uploadPhoto(String id, MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) return new MessageResponse("File required");

        String type = file.getContentType();
        if (type == null || (!type.equals("image/png") && !type.equals("image/jpeg"))) {
            return new MessageResponse("Only .png and .jpg allowed");
        }

        UserProfile p = getUser(id);
        p.setPhotoBytes(file.getBytes());
        p.setPhotoMime(type);
        repo.save(p);

        return new MessageResponse("Photo uploaded successfully");
    }
}