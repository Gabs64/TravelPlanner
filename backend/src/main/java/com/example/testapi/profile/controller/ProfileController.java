package com.example.testapi.profile.controller;

import com.example.testapi.auth.model.MessageResponse;
import com.example.testapi.profile.entity.UserProfile;
import com.example.testapi.profile.model.ChangePasswordRequest;
import com.example.testapi.profile.model.EditProfileRequest;
import com.example.testapi.profile.repository.UserProfileRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/profile")
public class ProfileController {

    private final UserProfileRepo repo;

    public ProfileController(UserProfileRepo repo) {
        this.repo = repo;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable String id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(p -> ResponseEntity.ok(p))
                .orElseGet(() -> ResponseEntity.status(404).body(new MessageResponse("User not found")));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> editProfile(@PathVariable String id, @RequestBody EditProfileRequest req) {
        var opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(new MessageResponse("User not found"));

        UserProfile p = opt.get();
        if (req.fullName != null) p.setFullName(req.fullName);
        if (req.phone != null) p.setPhone(req.phone);

        repo.save(p);
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully"));
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable String id, @RequestBody ChangePasswordRequest req) {
        var opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(new MessageResponse("User not found"));

        UserProfile p = opt.get();
        p.setPasswordHash(Integer.toString(req.newPassword.hashCode()));
        repo.save(p);

        return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
    }

    @PostMapping("/{id}/photo")
    public ResponseEntity<?> uploadPhoto(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file
    ) throws Exception {

        String ct = file.getContentType();
        if (ct == null || !(ct.equals("image/png") || ct.equals("image/jpeg"))) {
            return ResponseEntity.badRequest().body(new MessageResponse("Only .png and .jpg allowed"));
        }

        var opt = repo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.status(404).body(new MessageResponse("User not found"));

        UserProfile p = opt.get();
        p.setPhotoBytes(file.getBytes());
        p.setPhotoMime(ct);

        repo.save(p);

        return ResponseEntity.ok(new MessageResponse("Photo uploaded successfully"));
    }
}