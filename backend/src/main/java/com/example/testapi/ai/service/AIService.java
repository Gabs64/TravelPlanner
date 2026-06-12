package com.example.testapi.ai.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.testapi.ai.model.ChatMessage;
import com.example.testapi.trip.model.ItineraryItem;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service
public class AIService {

    @Value("${gemini.api.key:}")
    private String defaultApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public String generateChatResponse(List<ChatMessage> history, String userMessage, String apiKey) throws Exception {
        String resolvedKey = apiKey;
        if (resolvedKey == null || resolvedKey.isBlank()) {
            resolvedKey = defaultApiKey;
        }
        if (resolvedKey == null || resolvedKey.isBlank()) {
            resolvedKey = System.getenv("GEMINI_API_KEY");
        }

        if (resolvedKey == null || resolvedKey.isBlank()) {
            return generateMockResponse(userMessage);
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + resolvedKey;

        ObjectNode requestBody = objectMapper.createObjectNode();
        
        ObjectNode systemInstruction = objectMapper.createObjectNode();
        ArrayNode siParts = objectMapper.createArrayNode();
        siParts.add(objectMapper.createObjectNode().put("text", 
            "You are the Travel Planner AI Suggester, an interactive travel expert AI agent. " +
            "Your role is to help users plan trips, recommend popular spots, and suggest itineraries. " +
            "If you recommend a specific restaurant, hotel, attraction, or city that should be shown on the map, " +
            "you MUST append the tag '[MAP: Location Search Query]' (e.g. '[MAP: White Beach Boracay]' or '[MAP: Cafe by the Ruins Baguio]') at the end of your response. " +
            "Only include ONE map tag per response, corresponding to the primary recommended location. " +
            "Use bullet points and bold formatting for readability."));
        systemInstruction.set("parts", siParts);
        requestBody.set("systemInstruction", systemInstruction);

        ArrayNode contents = objectMapper.createArrayNode();
        if (history != null) {
            for (ChatMessage msg : history) {
                ObjectNode cObj = objectMapper.createObjectNode();
                cObj.put("role", msg.getRole());
                ArrayNode parts = objectMapper.createArrayNode();
                parts.add(objectMapper.createObjectNode().put("text", msg.getText()));
                cObj.set("parts", parts);
                contents.add(cObj);
            }
        }

        ObjectNode current = objectMapper.createObjectNode();
        current.put("role", "user");
        ArrayNode parts = objectMapper.createArrayNode();
        parts.add(objectMapper.createObjectNode().put("text", userMessage));
        current.set("parts", parts);
        contents.add(current);
        
        requestBody.set("contents", contents);

        String json = objectMapper.writeValueAsString(requestBody);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            System.err.println("Gemini Chat API error: " + response.body());
            return "[Error: Unable to connect to Gemini API. Fallback to Demo Mode] " + generateMockResponse(userMessage);
        }

        ObjectNode root = (ObjectNode) objectMapper.readTree(response.body());
        try {
            return root.get("candidates").get(0).get("content").get("parts").get(0).get("text").asText();
        } catch (Exception e) {
            return "[Error parsing response. Fallback to Demo Mode] " + generateMockResponse(userMessage);
        }
    }

    public List<ItineraryItem> generateItinerary(String destination, String startDate, String endDate, String apiKey) throws Exception {
        String resolvedKey = apiKey;
        if (resolvedKey == null || resolvedKey.isBlank()) {
            resolvedKey = defaultApiKey;
        }
        if (resolvedKey == null || resolvedKey.isBlank()) {
            resolvedKey = System.getenv("GEMINI_API_KEY");
        }

        if (resolvedKey == null || resolvedKey.isBlank()) {
            return generateMockItinerary(destination, startDate, endDate);
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + resolvedKey;

        String prompt = "Create a custom day-by-day travel itinerary for destination '" + destination + "' starting on " + startDate + " and ending on " + endDate + ".\n" +
                "You must return ONLY a valid JSON array of objects. Do NOT wrap it in ```json or ``` markdown blocks. Return a raw JSON array.\n" +
                "Each object in the array MUST have exactly these fields:\n" +
                "1. \"id\": a unique sequential integer starting at 1.\n" +
                "2. \"time\": a string indicating the time frame, e.g. \"Day 1\", \"Day 2\", etc.\n" +
                "3. \"title\": a brief description of recommended activities for that day, including landmarks.\n" +
                "Example response:\n" +
                "[\n" +
                "  {\"id\": 1, \"time\": \"Day 1\", \"title\": \"Arrive in Boracay, check in at hotel, and watch the sunset at White Beach.\"},\n" +
                "  {\"id\": 2, \"time\": \"Day 2\", \"title\": \"Go on an island hopping tour to Puka Beach and Magic Island for cliff jumping.\"}\n" +
                "]";

        ObjectNode requestBody = objectMapper.createObjectNode();
        ArrayNode contents = objectMapper.createArrayNode();
        ObjectNode userContent = objectMapper.createObjectNode();
        userContent.put("role", "user");
        ArrayNode parts = objectMapper.createArrayNode();
        parts.add(objectMapper.createObjectNode().put("text", prompt));
        userContent.set("parts", parts);
        contents.add(userContent);
        requestBody.set("contents", contents);

        String json = objectMapper.writeValueAsString(requestBody);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            System.err.println("Gemini Itinerary API error: " + response.body());
            return generateMockItinerary(destination, startDate, endDate);
        }

        ObjectNode root = (ObjectNode) objectMapper.readTree(response.body());
        try {
            String text = root.get("candidates").get(0).get("content").get("parts").get(0).get("text").asText();
            String clean = cleanJsonResponse(text);
            return objectMapper.readValue(clean, new TypeReference<List<ItineraryItem>>() {});
        } catch (Exception e) {
            System.err.println("Error parsing itinerary JSON from Gemini: " + e.getMessage());
            return generateMockItinerary(destination, startDate, endDate);
        }
    }

    private String cleanJsonResponse(String text) {
        if (text == null) return "[]";
        String clean = text.trim();
        if (clean.startsWith("```")) {
            int firstNewline = clean.indexOf('\n');
            if (firstNewline != -1) {
                clean = clean.substring(firstNewline + 1);
            }
            if (clean.endsWith("```")) {
                clean = clean.substring(0, clean.length() - 3);
            }
        }
        return clean.trim();
    }

    private String generateMockResponse(String userMessage) {
        String msg = userMessage.toLowerCase();
        if (msg.contains("boracay")) {
            return "🏝️ **Boracay** is world-famous for its powdery white sand beaches and incredible sunset views.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **White Beach:** Divided into Station 1 (luxury/quiet), Station 2 (commercial hub), and Station 3 (budget/peaceful).\n" +
                    "- **Puka Shell Beach:** A rustic beach with coarser shell-rich sands.\n" +
                    "- **Diniwid Beach:** A cozy cove ideal for relaxing cocktails.\n\n" +
                    "**Suggested Food:** Try the famous mango shakes at Jonah's Fruit Shake or calamares at Coco Mama!\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Boracay White Beach]";
        } else if (msg.contains("baguio")) {
            return "🌲 **Baguio City** (the Summer Capital of the Philippines) offers cool weather, pine trees, and fresh mountain breezes.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Burnham Park:** Rent swan boats or bike around the lake.\n" +
                    "- **Mines View Park:** For panoramic views of Benguet gold mines.\n" +
                    "- **Camp John Hay:** Pine forests, hiking trails, and cozy cafes.\n\n" +
                    "**Suggested Activities:** Visit the Baguio Night Market for cheap thrift finds (ukay-ukay) and delicious street foods!\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Burnham Park Baguio]";
        } else if (msg.contains("cebu")) {
            return "🏙️ **Cebu** combines a bustling metropolis with pristine white-sand beaches, waterfalls, and rich heritage sites.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Temple of Leah:** A massive Roman-style shrine dedicated to love.\n" +
                    "- **Sirao Flower Garden:** The 'Little Amsterdam' of Cebu.\n" +
                    "- **Basilica del Sto. Niño:** The oldest Catholic church in the country.\n\n" +
                    "**Suggested Activities:** Go on a food crawl to try authentic Cebu Lechon (roast pig) at House of Lechon!\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Temple of Leah Cebu]";
        } else if (msg.contains("palawan")) {
            return "🌊 **Palawan** is hailed as one of the most beautiful islands in the world, featuring towering limestone cliffs and crystal-clear lagoons.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **El Nido Big Lagoon:** Perfect for kayaking through turquoise waters.\n" +
                    "- **Puerto Princesa Underground River:** A UNESCO World Heritage site.\n" +
                    "- **Coron Kayangan Lake:** The cleanest lake in Asia.\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: El Nido Palawan]";
        } else if (msg.contains("siargao")) {
            return "🏄‍♂️ **Siargao** is the Surfing Capital of the Philippines, featuring a laid-back, palm-fringed island vibe.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Cloud 9 Boardwalk:** Watch surfers tackle the famous surf break.\n" +
                    "- **Sugba Lagoon:** Swim, dive, and paddle in a secluded lagoon.\n" +
                    "- **Maasin River Palm Tree Swing:** The iconic bent coconut tree rope swing.\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Cloud 9 Siargao]";
        } else if (msg.contains("vigan")) {
            return "🏛️ **Vigan City** is famous for its well-preserved Spanish-colonial streets, heritage sites, and cobblestone pathways.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Calle Crisologo:** Walk down the historic street lined with colonial-era houses.\n" +
                    "- **Syquia Mansion:** Museum highlighting historic presidential relics.\n" +
                    "- **Bantay Bell Tower:** Scenic view of the surrounding town.\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Calle Crisologo Vigan]";
        } else if (msg.contains("bohol")) {
            return "🍫 **Bohol** offers beautiful beaches in Panglao, standard countryside landscapes, and unique biodiversity.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Chocolate Hills:** Over 1,200 perfectly symmetrical dome-shaped hills.\n" +
                    "- **Tarsier Sanctuary:** Meet the world's smallest primates in their natural habitat.\n" +
                    "- **Loboc River Cruise:** Enjoy lunch on a floating restaurant.\n" +
                    "- **Panglao Island Beach:** Explore the caves and white beaches.\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Chocolate Hills Bohol]";
        } else if (msg.contains("tagaytay")) {
            return "🌋 **Tagaytay** is a popular weekend retreat near Manila, offering cool weather and stunning views of Taal Volcano and Lake.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Taal Lake Outlook:** Cozy restaurants offering bulalo with a view.\n" +
                    "- **Picnic Grove:** Great for family ziplines and picnics.\n" +
                    "- **Sky Ranch:** A theme park with a giant ferris wheel overlooking the ridge.\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Tagaytay Picnic Grove]";
        } else {
            return "✈️ **Hello! I am your AI Travel Agent Suggester.**\n\n" +
                    "I can recommend the best destinations, must-see sights, local dining, and organize travel itineraries for you. Ask me things like:\n" +
                    "- *'Suggest a relaxing beach trip to Boracay'*\n" +
                    "- *'Tell me about things to do in cool Baguio'*\n" +
                    "- *'Plan a food and heritage tour in Cebu'*\n\n" +
                    "*Note: No Gemini API Key is configured yet, so I am running in Demo Mode. You can configure your actual API Key in the Settings page!* [MAP: Philippines]";
        }
    }

    private List<ItineraryItem> generateMockItinerary(String destination, String startDate, String endDate) {
        String dest = destination != null ? destination : "Destination";
        return List.of(
                new ItineraryItem(1, "Day 1", "Arrive in " + dest + ", transfer to your hotel/resort, check in, and spend the evening enjoying local cuisine and beach walks."),
                new ItineraryItem(2, "Day 2", "Embark on an island hopping or signature city tour. Visit key local landmarks and try popular outdoor activities."),
                new ItineraryItem(3, "Day 3", "Souvenir shopping (pasalubong), check out cafe hopping spots, and head back to the airport for departure.")
        );
    }

    private String getDestinationNameFromJson(String json) {
        try {
            int nameIndex = json.indexOf("\"name\": \"");
            if (nameIndex != -1) {
                int start = nameIndex + 9;
                int end = json.indexOf("\"", start);
                if (end != -1) {
                    return json.substring(start, end);
                }
            }
        } catch (Exception e) {}
        return "";
    }

    private String getMockPopularDestinations(List<String> excludes) {
        List<String> mockDestinations = List.of(
            "{\"name\": \"Palawan\", \"desc\": \"Stunning lagoons, limestone cliffs, and crystal clear water.\", \"imageKeyword\": \"palawan\"}",
            "{\"name\": \"Siargao\", \"desc\": \"World-class surfing waves, coconut trees, and tide pools.\", \"imageKeyword\": \"surf\"}",
            "{\"name\": \"Vigan\", \"desc\": \"Cobblestone streets and preserved Spanish-colonial architecture.\", \"imageKeyword\": \"vigan\"}",
            "{\"name\": \"Bohol\", \"desc\": \"Chocolate Hills, white sand beaches, and unique tarsiers.\", \"imageKeyword\": \"bohol\"}",
            "{\"name\": \"Tagaytay\", \"desc\": \"Cool breezes, scenic parks, and stunning views of Taal Volcano.\", \"imageKeyword\": \"lake\"}",
            "{\"name\": \"Coron\", \"desc\": \"World-class shipwreck diving sites and crystal clear volcanic lakes.\", \"imageKeyword\": \"coron\"}"
        );
        java.util.Set<String> activeExcludes = new java.util.HashSet<>();
        if (excludes != null && !excludes.isEmpty()) {
            for (int i = excludes.size() - 1; i >= 0; i--) {
                String ex = excludes.get(i).trim().toLowerCase();
                if (ex.isEmpty()) continue;
                int matchCount = 0;
                for (String destJson : mockDestinations) {
                    String name = getDestinationNameFromJson(destJson).toLowerCase();
                    if (name.equals(ex) || activeExcludes.contains(name)) {
                        matchCount++;
                    }
                }
                if (mockDestinations.size() - matchCount >= 3) {
                    for (String destJson : mockDestinations) {
                        String name = getDestinationNameFromJson(destJson).toLowerCase();
                        if (name.equals(ex)) {
                            activeExcludes.add(name);
                        }
                    }
                } else {
                    break;
                }
            }
        }
        java.util.ArrayList<String> filtered = new java.util.ArrayList<>();
        for (String destJson : mockDestinations) {
            String name = getDestinationNameFromJson(destJson).toLowerCase();
            if (!activeExcludes.contains(name)) {
                filtered.add(destJson);
            }
        }
        java.util.Collections.shuffle(filtered);
        return "[" + String.join(",", filtered.subList(0, 3)) + "]";
    }

    public String getPopularDestinations(String exclude, String apiKey) throws Exception {
        String resolvedKey = apiKey;
        if (resolvedKey == null || resolvedKey.isBlank()) {
            resolvedKey = defaultApiKey;
        }
        if (resolvedKey == null || resolvedKey.isBlank()) {
            resolvedKey = System.getenv("GEMINI_API_KEY");
        }

        List<String> excludesList = List.of();
        if (exclude != null && !exclude.isBlank()) {
            excludesList = List.of(exclude.split(","));
        }

        if (resolvedKey == null || resolvedKey.isBlank()) {
            return getMockPopularDestinations(excludesList);
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + resolvedKey;

        String excludeInstructions = "";
        if (!excludesList.isEmpty()) {
            excludeInstructions = "You MUST NOT suggest any of the following destinations: " + String.join(", ", excludesList) + ". ";
        }

        String prompt = "Suggest exactly 3 popular travel destinations in the Philippines (other than Boracay, Baguio, Cebu). " +
                excludeInstructions +
                "You must return ONLY a valid JSON array of objects. Do NOT wrap it in ```json or ``` markdown blocks. " +
                "Each object MUST have exactly these fields:\n" +
                "1. \"name\": the name of the destination (e.g. \"Siargao\").\n" +
                "2. \"desc\": a short catchy description (e.g. \"World-class surfing and coconut forest\").\n" +
                "3. \"imageKeyword\": a single word tag for image search (e.g. \"surf\", \"beach\", \"mountain\").\n";

        ObjectNode requestBody = objectMapper.createObjectNode();
        ArrayNode contents = objectMapper.createArrayNode();
        ObjectNode userContent = objectMapper.createObjectNode();
        userContent.put("role", "user");
        ArrayNode parts = objectMapper.createArrayNode();
        parts.add(objectMapper.createObjectNode().put("text", prompt));
        userContent.set("parts", parts);
        contents.add(userContent);
        requestBody.set("contents", contents);

        String json = objectMapper.writeValueAsString(requestBody);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            System.err.println("Gemini Popular Destinations API error: " + response.body());
            return getMockPopularDestinations(excludesList);
        }

        ObjectNode root = (ObjectNode) objectMapper.readTree(response.body());
        try {
            String text = root.get("candidates").get(0).get("content").get("parts").get(0).get("text").asText();
            return cleanJsonResponse(text);
        } catch (Exception e) {
            System.err.println("Error parsing popular destinations: " + e.getMessage());
            return getMockPopularDestinations(excludesList);
        }
    }

    public String getDestinationDetails(String slug, String apiKey) throws Exception {
        String resolvedKey = apiKey;
        if (resolvedKey == null || resolvedKey.isBlank()) {
            resolvedKey = defaultApiKey;
        }
        if (resolvedKey == null || resolvedKey.isBlank()) {
            resolvedKey = System.getenv("GEMINI_API_KEY");
        }

        if (resolvedKey == null || resolvedKey.isBlank()) {
            return generateMockDetails(slug);
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + resolvedKey;

        String prompt = "Create travel details for the destination slug '" + slug + "'.\n" +
                "You must return ONLY a valid JSON object. Do NOT wrap it in ```json or ``` markdown blocks.\n" +
                "The object MUST have exactly these fields:\n" +
                "1. \"name\": Capitalized name (e.g. \"El Nido\").\n" +
                "2. \"desc\": Description of the place.\n" +
                "3. \"location\": Exact location string (e.g. \"El Nido, Palawan, Philippines\").\n" +
                "4. \"bestFor\": Best activities/highlights (e.g. \"Lagoons, island hopping, snorkeling\").\n" +
                "5. \"budget\": Estimated budget range in PHP (e.g. \"PHP 8,000 - PHP 15,000\").\n" +
                "6. \"duration\": Recommended duration (e.g. \"3 - 5 days\").\n" +
                "7. \"activities\": A JSON array of exactly 4 strings containing popular spots or activities (e.g. [\"Big Lagoon\", \"Nacpan Beach\", \"Small Lagoon\", \"Las Cabanas Beach\"]).\n";

        ObjectNode requestBody = objectMapper.createObjectNode();
        ArrayNode contents = objectMapper.createArrayNode();
        ObjectNode userContent = objectMapper.createObjectNode();
        userContent.put("role", "user");
        ArrayNode parts = objectMapper.createArrayNode();
        parts.add(objectMapper.createObjectNode().put("text", prompt));
        userContent.set("parts", parts);
        contents.add(userContent);
        requestBody.set("contents", contents);

        String json = objectMapper.writeValueAsString(requestBody);

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(json))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            System.err.println("Gemini Destination Details API error: " + response.body());
            return generateMockDetails(slug);
        }

        ObjectNode root = (ObjectNode) objectMapper.readTree(response.body());
        try {
            String text = root.get("candidates").get(0).get("content").get("parts").get(0).get("text").asText();
            return cleanJsonResponse(text);
        } catch (Exception e) {
            System.err.println("Error parsing destination details: " + e.getMessage());
            return generateMockDetails(slug);
        }
    }

    private String generateMockDetails(String slug) {
        String name = slug.substring(0, 1).toUpperCase() + slug.substring(1);
        if (name.contains("-")) {
            name = name.replace("-", " ");
        }
        return "{\n" +
                "  \"name\": \"" + name + "\",\n" +
                "  \"desc\": \"A beautiful travel destination offering scenic views and unique local culture.\",\n" +
                "  \"location\": \"" + name + ", Philippines\",\n" +
                "  \"bestFor\": \"Sightseeing, local food, and relaxation\",\n" +
                "  \"budget\": \"PHP 5,000 - PHP 10,000\",\n" +
                "  \"duration\": \"2 - 4 days\",\n" +
                "  \"activities\": [\"Local sightseeing\", \"Food crawl\", \"Nature walk\", \"Souvenir shopping\"]\n" +
                "}";
    }
}
