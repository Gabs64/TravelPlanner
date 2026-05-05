package com.example.testapi.trip.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.testapi.profile.repository.UserProfileRepo;
import com.example.testapi.trip.entity.Trip;
import com.example.testapi.trip.model.TripRequest;
import com.example.testapi.trip.model.TripResponse;
import com.example.testapi.trip.model.TripStatsResponse;
import com.example.testapi.trip.repository.TripRepository;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final UserProfileRepo userProfileRepo;

    public TripService(TripRepository tripRepository, UserProfileRepo userProfileRepo) {
        this.tripRepository = tripRepository;
        this.userProfileRepo = userProfileRepo;
    }

    public TripResponse createTrip(String userId, TripRequest request) {
        if (userId == null || userId.isEmpty()) {
            throw new IllegalArgumentException("User Id is required");
        }

        if (!userProfileRepo.existsById(userId)) {
            throw new RuntimeException("User not found");
        }

        if (request.getDestinationSlug() == null || request.getDestinationSlug().isBlank()) {
            throw new IllegalArgumentException("Destination is required");
        }

        if (request.getDestinationName() == null || request.getDestinationName().isBlank()) {
            throw new IllegalArgumentException("Destination name is required");
        }

        LocalDate startDate;
        LocalDate endDate;
        try {
            startDate = LocalDate.parse(request.getStartDate());
            endDate = LocalDate.parse(request.getEndDate());
        } catch (Exception ex) {
            throw new IllegalArgumentException("Start date and end date must be valid ISO dates");
        }

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date must be the same as or after the start date");
        }

        Trip trip = new Trip(
                UUID.randomUUID().toString(),
                userId,
                request.getDestinationSlug(),
                request.getDestinationName(),
                startDate,
                endDate
        );

        Trip saved = tripRepository.save(trip);
        return toResponse(saved);
    }

    public TripStatsResponse getStats(String userId) {
        LocalDate today = LocalDate.now();
        long planned = tripRepository.countByUserId(userId);
        long upcoming = tripRepository.countByUserIdAndEndDateGreaterThanEqual(userId, today);
        long visited = tripRepository.countByUserIdAndEndDateBefore(userId, today);
        return new TripStatsResponse(planned, upcoming, visited);
    }

    public List<TripResponse> getTrips(String userId) {
        return tripRepository.findByUserIdOrderByStartDateAsc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private TripResponse toResponse(Trip trip) {
        LocalDate today = LocalDate.now();
        String status;

        if (trip.getEndDate().isBefore(today)) {
            status = "Completed";
        } else if (trip.getStartDate().isAfter(today)) {
            status = "Upcoming";
        } else {
            status = "Ongoing";
        }

        return new TripResponse(trip, status);
    }
}
