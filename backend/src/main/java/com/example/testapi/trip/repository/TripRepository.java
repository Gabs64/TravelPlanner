package com.example.testapi.trip.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.testapi.trip.entity.Trip;

public interface TripRepository extends JpaRepository<Trip, String> {
    long countByUserId(String userId);
    long countByUserIdAndEndDateGreaterThanEqual(String userId, LocalDate date);
    long countByUserIdAndEndDateBefore(String userId, LocalDate date);
    List<Trip> findByUserIdOrderByStartDateAsc(String userId);
}
