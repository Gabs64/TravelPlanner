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
import com.example.testapi.trip.model.ItineraryItem;
import com.example.testapi.trip.repository.TripRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final UserProfileRepo userProfileRepo;
    private final ObjectMapper objectMapper = new ObjectMapper();

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
        List<Trip> trips = tripRepository.findByUserIdOrderByStartDateAsc(userId);
        long planned = trips.size();
        long upcoming = 0;
        long visited = 0;
        LocalDate today = LocalDate.now();
        for (Trip trip : trips) {
            String status = trip.getStatus();
            if (status == null || status.isBlank()) {
                if (trip.getEndDate().isBefore(today)) {
                    status = "Completed";
                } else if (trip.getStartDate().isAfter(today)) {
                    status = "Upcoming";
                } else {
                    status = "Ongoing";
                }
            }
            if ("Completed".equalsIgnoreCase(status)) {
                visited++;
            } else {
                upcoming++;
            }
        }
        return new TripStatsResponse(planned, upcoming, visited);
    }

    public List<TripResponse> getTrips(String userId) {
        return tripRepository.findByUserIdOrderByStartDateAsc(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TripResponse updateItinerary(String tripId, List<ItineraryItem> itinerary) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        trip.setItinerary(serializeItinerary(itinerary));
        Trip saved = tripRepository.save(trip);
        return toResponse(saved);
    }

    public TripResponse updateTripStatus(String tripId, String status) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trip not found"));
        trip.setStatus(status);
        Trip saved = tripRepository.save(trip);
        return toResponse(saved);
    }

    public void deleteTrip(String tripId) {
        if (!tripRepository.existsById(tripId)) {
            throw new RuntimeException("Trip not found");
        }
        tripRepository.deleteById(tripId);
    }

    private List<ItineraryItem> parseItinerary(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<ItineraryItem>>() {});
        } catch (Exception e) {
            System.err.println("Error parsing itinerary JSON: " + e.getMessage());
            return List.of();
        }
    }

    private String serializeItinerary(List<ItineraryItem> items) {
        if (items == null) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(items);
        } catch (Exception e) {
            System.err.println("Error serializing itinerary list: " + e.getMessage());
            return "[]";
        }
    }

    private TripResponse toResponse(Trip trip) {
        String status = trip.getStatus();
        if (status == null || status.isBlank()) {
            LocalDate today = LocalDate.now();
            if (trip.getEndDate().isBefore(today)) {
                status = "Completed";
            } else if (trip.getStartDate().isAfter(today)) {
                status = "Upcoming";
            } else {
                status = "Ongoing";
            }
        }

        List<ItineraryItem> itinerary = parseItinerary(trip.getItinerary());
        return new TripResponse(trip, status, itinerary);
    }
}
