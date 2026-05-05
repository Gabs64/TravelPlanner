package com.example.testapi.trip.model;

import com.example.testapi.trip.entity.Trip;

public class TripResponse {
    private String id;
    private String destinationSlug;
    private String destinationName;
    private String startDate;
    private String endDate;
    private String status;

    public TripResponse() {}

    public TripResponse(Trip trip, String status) {
        this.id = trip.getId();
        this.destinationSlug = trip.getDestinationSlug();
        this.destinationName = trip.getDestinationName();
        this.startDate = trip.getStartDate().toString();
        this.endDate = trip.getEndDate().toString();
        this.status = status;
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
}
