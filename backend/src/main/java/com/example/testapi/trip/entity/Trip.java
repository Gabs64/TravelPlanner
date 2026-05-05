package com.example.testapi.trip.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "trips")
public class Trip {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "user_id", length = 36, nullable = false)
    private String userId;

    @Column(name = "destination_slug", nullable = false)
    private String destinationSlug;

    @Column(name = "destination_name", nullable = false)
    private String destinationName;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    public Trip() {}

    public Trip(String id, String userId, String destinationSlug, String destinationName, LocalDate startDate, LocalDate endDate) {
        this.id = id;
        this.userId = userId;
        this.destinationSlug = destinationSlug;
        this.destinationName = destinationName;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

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

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
}
