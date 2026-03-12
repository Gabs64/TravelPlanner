package com.example.testapi.profile.repository;

import com.example.testapi.profile.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserProfileRepo extends JpaRepository<UserProfile, String> {
    Optional<UserProfile> findByEmail(String email);
}