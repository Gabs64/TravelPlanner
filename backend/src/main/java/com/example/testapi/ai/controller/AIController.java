package com.example.testapi.ai.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.testapi.ai.model.AIChatRequest;
import com.example.testapi.ai.model.AIItineraryRequest;
import com.example.testapi.ai.service.AIService;
import com.example.testapi.common.model.MessageResponse;
import com.example.testapi.trip.model.ItineraryItem;

@RestController
@RequestMapping("/ai")
public class AIController {

    private final AIService aiService;

    public AIController(AIService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody AIChatRequest request) {
        try {
            String response = aiService.generateChatResponse(
                    request.getHistory(),
                    request.getMessage(),
                    request.getApiKey()
            );
            return ResponseEntity.ok(new MessageResponse(response));
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error communicating with AI Suggester: " + ex.getMessage()));
        }
    }

    @PostMapping("/generate-itinerary")
    public ResponseEntity<?> generateItinerary(@RequestBody AIItineraryRequest request) {
        try {
            List<ItineraryItem> itinerary = aiService.generateItinerary(
                    request.getDestination(),
                    request.getStartDate(),
                    request.getEndDate(),
                    request.getApiKey()
            );
            return ResponseEntity.ok(itinerary);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error generating itinerary: " + ex.getMessage()));
        }
    }

    @GetMapping(value = "/popular-destinations", produces = "application/json")
    public ResponseEntity<?> getPopularDestinations(
            @RequestParam(value = "exclude", required = false) String exclude,
            @RequestParam(value = "country", required = false, defaultValue = "Philippines") String country,
            @RequestHeader(value = "X-Api-Key", required = false) String headerApiKey,
            @RequestParam(value = "apiKey", required = false) String paramApiKey) {
        try {
            String apiKey = (headerApiKey != null && !headerApiKey.isBlank()) ? headerApiKey : paramApiKey;
            String result = aiService.getPopularDestinations(exclude, country, apiKey);
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching popular destinations: " + ex.getMessage()));
        }
    }

    @GetMapping(value = "/destination-details/{slug}", produces = "application/json")
    public ResponseEntity<?> getDestinationDetails(
            @PathVariable("slug") String slug,
            @RequestHeader(value = "X-Api-Key", required = false) String headerApiKey,
            @RequestParam(value = "apiKey", required = false) String paramApiKey) {
        try {
            String apiKey = (headerApiKey != null && !headerApiKey.isBlank()) ? headerApiKey : paramApiKey;
            String result = aiService.getDestinationDetails(slug, apiKey);
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            ex.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error fetching destination details: " + ex.getMessage()));
        }
    }
}
