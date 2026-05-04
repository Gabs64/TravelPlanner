package com.example.testapi.auth.service;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.example.testapi.auth.model.LoginRequest;
import com.example.testapi.auth.model.RegisterRequest;
import com.example.testapi.common.model.MessageResponse;
import com.example.testapi.profile.entity.UserProfile;
import com.example.testapi.profile.repository.UserProfileRepo;

@Service
public class AuthService {

    private final UserProfileRepo repo;

    public AuthService(UserProfileRepo repo) {
        this.repo = repo;
    }

    public ResponseEntity<?> register(RegisterRequest req) {
        if (req.email == null || req.password == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email and password are required"));
        }

        if (repo.findByEmail(req.email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new MessageResponse("Email already exists"));
        }

        UserProfile p = new UserProfile();
        p.setId(UUID.randomUUID().toString());
        p.setEmail(req.email);

        p.setPasswordHash(Integer.toString(req.password.hashCode()));

        p.setFullName(req.fullName);
        p.setNickname(req.nickname);
        p.setPhone(req.phone);

        // Set default profile photo
        String[] defaultPaths = {"static/images/userheadDefault.png", "static/userheadDefault.png"};
        boolean loadedDefault = false;

        for (String path : defaultPaths) {
            try {
                ClassPathResource resource = new ClassPathResource(path);
                if (!resource.exists()) {
                    continue;
                }
                byte[] defaultPhoto = resource.getInputStream().readAllBytes();
                p.setPhotoBytes(defaultPhoto);
                p.setPhotoMime("image/png");
                loadedDefault = true;
                break;
            } catch (IOException e) {
                // try next path
            }
        }

        if (!loadedDefault) {
            System.out.println("[AuthService] Warning: Could not load default profile photo from classpath");
        }

        repo.save(p);
        return ResponseEntity.ok(new MessageResponse("Registration successful"));
    }

    public ResponseEntity<?> login(LoginRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email and password are required"));
        }

        // debug output for troubleshooting
        System.out.println("[AuthService] login request: email=" + req.getEmail() + ", password=<hidden>");
        var opt = repo.findByEmail(req.getEmail());
        if (opt.isEmpty()) {
            System.out.println("[AuthService] user not found for " + req.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Login failed"));
        }

        UserProfile p = opt.get();
        String incomingHash = Integer.toString(req.getPassword().hashCode());
        System.out.println("[AuthService] incomingHash=" + incomingHash + ", storedHash=" + p.getPasswordHash());

        if (!incomingHash.equals(p.getPasswordHash())) {
            System.out.println("[AuthService] password mismatch");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Login failed"));
        }

        String token = UUID.randomUUID().toString();
        
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", p.getId());
        
        System.out.println("[AuthService] login successful for " + req.getEmail());
        return ResponseEntity.ok(response);
    }
}