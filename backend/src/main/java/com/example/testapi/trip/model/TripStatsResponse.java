package com.example.testapi.trip.model;

public class TripStatsResponse {
    private long tripsPlanned;
    private long upcomingTrips;
    private long visitedPlaces;

    public TripStatsResponse(long tripsPlanned, long upcomingTrips, long visitedPlaces) {
        this.tripsPlanned = tripsPlanned;
        this.upcomingTrips = upcomingTrips;
        this.visitedPlaces = visitedPlaces;
    }

    public long getTripsPlanned() {
        return tripsPlanned;
    }

    public long getUpcomingTrips() {
        return upcomingTrips;
    }

    public long getVisitedPlaces() {
        return visitedPlaces;
    }
}
