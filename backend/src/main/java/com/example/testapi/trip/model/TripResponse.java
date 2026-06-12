package com.example.testapi.trip.model;

import java.util.List;
import com.example.testapi.trip.entity.Trip;

public class TripResponse {
    private String id;
    private String destinationSlug;
    private String destinationName;
    private String startDate;
    private String endDate;
    private String status;
    private List<ItineraryItem> itinerary;

    public TripResponse() {}

    public TripResponse(Trip trip, String status) {
        this.id = trip.getId();
        this.destinationSlug = trip.getDestinationSlug();
        this.destinationName = trip.getDestinationName();
        this.startDate = trip.getStartDate().toString();
        this.endDate = trip.getEndDate().toString();
        this.status = status;
        this.itinerary = List.of();
    }

    public TripResponse(Trip trip, String status, List<ItineraryItem> itinerary) {
        this.id = trip.getId();
        this.destinationSlug = trip.getDestinationSlug();
        this.destinationName = trip.getDestinationName();
        this.startDate = trip.getStartDate().toString();
        this.endDate = trip.getEndDate().toString();
        this.status = status;
        this.itinerary = itinerary;
    }

    public String getId() {
        return id;
    }

    public String getDestinationSlug() {
        return destinationSlug;
    }

    public String getDestinationName() {
        return destinationName;
    }

    public String getStartDate() {
        return startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public String getStatus() {
        return status;
    }

    public List<ItineraryItem> getItinerary() {
        return itinerary;
    }
}
