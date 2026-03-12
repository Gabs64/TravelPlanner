package com.example.testapi.auth.service;

import com.example.testapi.auth.model.LoginRequest;
import com.example.testapi.auth.model.RegisterRequest;
import com.example.testapi.common.model.MessageResponse;
import com.example.testapi.profile.entity.UserProfile;
import com.example.testapi.profile.repository.UserProfileRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

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
        p.setPhone(req.phone);

        repo.save(p);
        return ResponseEntity.ok(new MessageResponse("Registration successful"));
    }

    public ResponseEntity<?> login(LoginRequest req) {
        var opt = repo.findByEmail(req.getEmail());
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Login failed"));
        }

        UserProfile p = opt.get();
        String incomingHash = Integer.toString(req.getPassword().hashCode());

        if (!incomingHash.equals(p.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponse("Login Failed"));
        }

        String token = UUID.randomUUID().toString();
        
        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", p.getId());
        
        return ResponseEntity.ok(response);
    }
}