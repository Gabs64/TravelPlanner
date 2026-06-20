package com.example.testapi.trip.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.testapi.common.model.MessageResponse;
import com.example.testapi.trip.model.TripRequest;
import com.example.testapi.trip.model.TripResponse;
import com.example.testapi.trip.model.TripStatsResponse;
import com.example.testapi.trip.model.ItineraryItem;
import com.example.testapi.trip.service.TripService;

@RestController
@RequestMapping("/trips")
public class TripController {

    private final TripService service;

    public TripController(TripService service) {
        this.service = service;
    }

    @PostMapping("/{userId}")
    public ResponseEntity<?> createTrip(@PathVariable String userId, @RequestBody TripRequest request) {
        try {
            TripResponse response = service.createTrip(userId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(new MessageResponse(ex.getMessage()));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(ex.getMessage()));
        }
    }

    @GetMapping("/{userId}/stats")
    public ResponseEntity<?> getTripStats(@PathVariable String userId) {
        try {
            TripStatsResponse stats = service.getStats(userId);
            return ResponseEntity.ok(stats);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(ex.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getTrips(@PathVariable String userId) {
        try {
            List<TripResponse> trips = service.getTrips(userId);
            return ResponseEntity.ok(trips);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(ex.getMessage()));
        }
    }

    @PutMapping("/{tripId}/itinerary")
    public ResponseEntity<?> updateItinerary(@PathVariable String tripId, @RequestBody List<ItineraryItem> itinerary) {
        try {
            TripResponse response = service.updateItinerary(tripId, itinerary);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(ex.getMessage()));
        }
    }

    @PutMapping("/{tripId}/status")
    public ResponseEntity<?> updateTripStatus(@PathVariable String tripId, @RequestBody java.util.Map<String, String> body) {
        try {
            String status = body.get("status");
            TripResponse response = service.updateTripStatus(tripId, status);
            return ResponseEntity.ok(response);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(ex.getMessage()));
        }
    }

    @DeleteMapping("/{tripId}")
    public ResponseEntity<?> deleteTrip(@PathVariable String tripId) {
        try {
            service.deleteTrip(tripId);
            return ResponseEntity.ok(new MessageResponse("Trip deleted successfully"));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(ex.getMessage()));
        }
    }

    @GetMapping("/public/{tripId}")
    public ResponseEntity<?> getPublicTrip(@PathVariable String tripId) {
        try {
            TripResponse trip = service.getTrip(tripId);
            return ResponseEntity.ok(trip);
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new MessageResponse(ex.getMessage()));
        }
    }
}
