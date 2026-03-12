package com.example.testapi.auth.controller;

import com.example.testapi.auth.model.LoginRequest;
import com.example.testapi.auth.model.RegisterRequest;
import com.example.testapi.auth.service.AuthService;
import com.example.testapi.common.model.MessageResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000") // allow React dev server
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        Object result = service.register(req);

        if (result instanceof MessageResponse mr) {
            if (mr.message.toLowerCase().contains("exists") || mr.message.toLowerCase().contains("required")) {
                return ResponseEntity.badRequest().body(result);
            }
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        Object result = service.login(req);

        if (result instanceof MessageResponse mr && mr.message.equalsIgnoreCase("Login failed")) {
            return ResponseEntity.status(401).body(result);
        }
        return ResponseEntity.ok(result);
    }
}