package com.example.testapi.profile.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.testapi.profile.entity.UserProfile;

public interface UserProfileRepo extends JpaRepository<UserProfile, String> {
    @Query("select new com.example.testapi.profile.entity.UserProfile(u.id, u.email, u.fullName, u.nickname, u.phone, u.passwordHash, u.photoMime) from UserProfile u where u.email = :email")
    Optional<UserProfile> findByEmail(@Param("email") String email);
}