package com.example.testapi.profile.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.testapi.profile.entity.UserProfile;
import com.example.testapi.profile.model.ChangePasswordRequest;
import com.example.testapi.profile.model.EditProfileRequest;
import com.example.testapi.profile.model.MessageResponse;
import com.example.testapi.profile.service.ProfileService;

@RestController
@RequestMapping("/profile")
@CrossOrigin(origins = "http://localhost:3000")
public class ProfileController {

    private final ProfileService service;

    public ProfileController(ProfileService service) {
        this.service = service;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable String id) {
        try {
            return ResponseEntity.ok(service.getProfile(id));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editProfile(@PathVariable String id, @RequestBody EditProfileRequest req) {
        try {
            return ResponseEntity.ok(service.editProfile(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable String id, @RequestBody ChangePasswordRequest req) {
        try {
            return ResponseEntity.ok(service.changePassword(id, req));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(new MessageResponse(e.getMessage()));
        }
    }

    // ✅ upload photo
    @PostMapping("/{id}/photo")
    public ResponseEntity<?> uploadPhoto(@PathVariable String id,
                                         @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(service.uploadPhoto(id, file));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new MessageResponse("Upload failed: " + e.getMessage()));
        }
    }

    // ✅ get photo
    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> getPhoto(@PathVariable String id) {
        UserProfile user = service.getUserEntity(id);

        if (user.getPhotoBytes() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, user.getPhotoMime())
                .body(user.getPhotoBytes());
    }
}