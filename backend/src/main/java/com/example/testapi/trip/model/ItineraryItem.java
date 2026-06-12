package com.example.testapi.trip.model;

public class ItineraryItem {
    private Integer id;
    private String time;
    private String title;

    public ItineraryItem() {}

    public ItineraryItem(Integer id, String time, String title) {
        this.id = id;
        this.time = time;
        this.title = title;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
