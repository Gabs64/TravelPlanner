package com.example.testapi.trip.model;

public class TripRequest {
    private String destinationSlug;
    private String destinationName;
    private String startDate;
    private String endDate;

    public TripRequest() {}

    public String getDestinationSlug() {
        return destinationSlug;
    }

    public void setDestinationSlug(String destinationSlug) {
        this.destinationSlug = destinationSlug;
    }

    public String getDestinationName() {
        return destinationName;
    }

    public void setDestinationName(String destinationName) {
        this.destinationName = destinationName;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }
}
