package com.example.testapi.profile.model;

public class UploadPhotoResponse {
    public String message;
    public String mime;
    public long size;

    public UploadPhotoResponse(String message, String mime, long size) {
        this.message = message;
        this.mime = mime;
        this.size = size;
    }
}