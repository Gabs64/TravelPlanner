package com.example.testapi.auth.service;

import com.example.testapi.auth.model.LoginRequest;
import com.example.testapi.auth.model.LoginResponse;
import com.example.testapi.auth.model.RegisterRequest;
import com.example.testapi.common.model.MessageResponse;
import com.example.testapi.profile.entity.UserProfile;
import com.example.testapi.profile.repository.UserProfileRepo;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    private final UserProfileRepo repo;

    public AuthService(UserProfileRepo repo) {
        this.repo = repo;
    }

    public Object register(RegisterRequest req) {
        if (req.email == null || req.password == null) {
            return new MessageResponse("Email and password are required");
        }

        if (repo.findByEmail(req.email).isPresent()) {
            return new MessageResponse("Email already exists");
        }

        UserProfile p = new UserProfile();
        p.setId(UUID.randomUUID().toString());
        p.setEmail(req.email);

        p.setPasswordHash(Integer.toString(req.password.hashCode()));

        p.setFullName(req.fullName);
        p.setPhone(req.phone);

        repo.save(p);
        return new MessageResponse("Registration successful");
    }

    public Object login(LoginRequest req) {
        var opt = repo.findByEmail(req.getEmail());
        if (opt.isEmpty()) return new MessageResponse("Login failed");

        UserProfile p = opt.get();
        String incomingHash = Integer.toString(req.getPassword().hashCode());

        if (!incomingHash.equals(p.getPasswordHash())) {
            return new MessageResponse("Login Failed");
        }

        String token = UUID.randomUUID().toString();
        return new LoginResponse("Login Successful", token, p.getId());
    }
}