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

    private volatile boolean lastCallSuccessful = true;
    private volatile String lastErrorMessage = null;

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
            "If you recommend specific places (restaurants, hotels, attractions, or cities) that should be shown on the map, " +
            "you MUST append a map tag for EACH place at the end of your response in the format: [MAP: Location 1], [MAP: Location 2], [MAP: Location 3] etc. " +
            "(e.g. '[MAP: White Beach Boracay], [MAP: Puka Shell Beach Boracay]'). Always include as many MAP tags as there are suggested places in your text. " +
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
            lastCallSuccessful = false;
            lastErrorMessage = "Chat API status: " + response.statusCode();
            return "[Error: Unable to connect to Gemini API. Fallback to Demo Mode] " + generateMockResponse(userMessage);
        }

        lastCallSuccessful = true;
        lastErrorMessage = null;
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
            lastCallSuccessful = false;
            lastErrorMessage = "Itinerary API status: " + response.statusCode();
            return generateMockItinerary(destination, startDate, endDate);
        }

        lastCallSuccessful = true;
        lastErrorMessage = null;
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
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Boracay], [MAP: White Beach Boracay], [MAP: Puka Shell Beach Boracay], [MAP: Diniwid Beach Boracay]";
        } else if (msg.contains("baguio")) {
            return "🌲 **Baguio City** (the Summer Capital of the Philippines) offers cool weather, pine trees, and fresh mountain breezes.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Burnham Park:** Rent swan boats or bike around the lake.\n" +
                    "- **Mines View Park:** For panoramic views of Benguet gold mines.\n" +
                    "- **Camp John Hay:** Pine forests, hiking trails, and cozy cafes.\n\n" +
                    "**Suggested Activities:** Visit the Baguio Night Market for cheap thrift finds (ukay-ukay) and delicious street foods!\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Burnham Park Baguio], [MAP: Mines View Park Baguio], [MAP: Camp John Hay Baguio]";
        } else if (msg.contains("cebu")) {
            return "🏙️ **Cebu** combines a bustling metropolis with pristine white-sand beaches, waterfalls, and rich heritage sites.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Temple of Leah:** A massive Roman-style shrine dedicated to love.\n" +
                    "- **Sirao Flower Garden:** The 'Little Amsterdam' of Cebu.\n" +
                    "- **Basilica del Sto. Niño:** The oldest Catholic church in the country.\n\n" +
                    "**Suggested Activities:** Go on a food crawl to try authentic Cebu Lechon (roast pig) at House of Lechon!\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Temple of Leah Cebu], [MAP: Sirao Flower Garden Cebu], [MAP: Basilica del Sto. Niño Cebu], [MAP: House of Lechon Cebu]";
        } else if (msg.contains("palawan")) {
            return "🌊 **Palawan** is hailed as one of the most beautiful islands in the world, featuring towering limestone cliffs and crystal-clear lagoons.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **El Nido Big Lagoon:** Perfect for kayaking through turquoise waters.\n" +
                    "- **Puerto Princesa Underground River:** A UNESCO World Heritage site.\n" +
                    "- **Coron Kayangan Lake:** The cleanest lake in Asia.\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: El Nido Big Lagoon], [MAP: Puerto Princesa Underground River], [MAP: Coron Kayangan Lake]";
        } else if (msg.contains("siargao")) {
            return "🏄‍♂️ **Siargao** is the Surfing Capital of the Philippines, featuring a laid-back, palm-fringed island vibe.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Cloud 9 Boardwalk:** Watch surfers tackle the famous surf break.\n" +
                    "- **Sugba Lagoon:** Swim, dive, and paddle in a secluded lagoon.\n" +
                    "- **Maasin River Palm Tree Swing:** The iconic bent coconut tree rope swing.\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Cloud 9 Siargao], [MAP: Sugba Lagoon Siargao], [MAP: Maasin River]";
        } else if (msg.contains("vigan")) {
            return "🏛️ **Vigan City** is famous for its well-preserved Spanish-colonial streets, heritage sites, and cobblestone pathways.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Calle Crisologo:** Walk down the historic street lined with colonial-era houses.\n" +
                    "- **Syquia Mansion:** Museum highlighting historic presidential relics.\n" +
                    "- **Bantay Bell Tower:** Scenic view of the surrounding town.\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Calle Crisologo Vigan], [MAP: Syquia Mansion Vigan], [MAP: Bantay Bell Tower Vigan]";
        } else if (msg.contains("bohol")) {
            return "🍫 **Bohol** offers beautiful beaches in Panglao, standard countryside landscapes, and unique biodiversity.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Chocolate Hills:** Over 1,200 perfectly symmetrical dome-shaped hills.\n" +
                    "- **Tarsier Sanctuary:** Meet the world's smallest primates in their natural habitat.\n" +
                    "- **Loboc River Cruise:** Enjoy lunch on a floating restaurant.\n" +
                    "- **Panglao Island Beach:** Explore the caves and white beaches.\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Chocolate Hills Bohol], [MAP: Tarsier Sanctuary Bohol], [MAP: Loboc River Cruise Bohol], [MAP: Panglao Island]";
        } else if (msg.contains("tagaytay")) {
            return "🌋 **Tagaytay** is a popular weekend retreat near Manila, offering cool weather and stunning views of Taal Volcano and Lake.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Taal Lake Outlook:** Cozy restaurants offering bulalo with a view.\n" +
                    "- **Picnic Grove:** Great for family ziplines and picnics.\n" +
                    "- **Sky Ranch:** A theme park with a giant ferris wheel overlooking the ridge.\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Taal Lake Tagaytay], [MAP: Picnic Grove Tagaytay], [MAP: Sky Ranch Tagaytay]";
        } else if (msg.contains("tokyo")) {
            return "🗼 **Tokyo** is a dazzling metropolis combining futuristic skyscrapers, historic temples, and vibrant street life.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Senso-ji Temple:** Tokyo's oldest and most iconic Buddhist temple in Asakusa.\n" +
                    "- **Shibuya Crossing:** The world's busiest pedestrian crossing.\n" +
                    "- **Meiji Jingu Shrine:** A peaceful shrine situated in a lush forest park.\n\n" +
                    "**Suggested Food:** Try fresh sushi at Tsukiji Outer Market or ramen in Shinjuku!\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Sensoji Temple Tokyo], [MAP: Shibuya Crossing Tokyo], [MAP: Meiji Jingu Shrine Tokyo]";
        } else if (msg.contains("kyoto")) {
            return "⛩️ **Kyoto** is the cultural heart of Japan, famous for thousands of classical temples, gardens, and traditional wooden houses.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Fushimi Inari Shrine:** Famous for its path of thousands of vibrant red torii gates.\n" +
                    "- **Kinkaku-ji (Golden Pavilion):** A stunning Zen temple covered in gold leaf.\n" +
                    "- **Arashiyama Bamboo Grove:** Walk through towering green bamboo stalks.\n\n" +
                    "**Suggested Activities:** Stroll through Gion district for a chance to spot geishas!\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Fushimi Inari Shrine Kyoto], [MAP: Kinkaku-ji Kyoto], [MAP: Arashiyama Bamboo Grove Kyoto]";
        } else if (msg.contains("rome")) {
            return "🏛️ **Rome** is a city of historic ruins, monumental art, and vibrant street life.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Colosseum:** The world's largest ancient amphitheater.\n" +
                    "- **Trevi Fountain:** Throw a coin in to guarantee a return trip to Rome.\n" +
                    "- **Vatican Museums & St. Peter's:** Home to the Sistine Chapel and classic Renaissance art.\n\n" +
                    "**Suggested Food:** Try authentic Carbonara or cacio e pepe at a Trastevere tavern!\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Colosseum Rome], [MAP: Trevi Fountain Rome], [MAP: St. Peter's Basilica Rome]";
        } else if (msg.contains("bali")) {
            return "🏝️ **Bali** is Indonesia's holiday island, known for its forested volcanic mountains, beaches, and coral reefs.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Ubud Monkey Forest:** A sanctuary of long-tailed macaques among ancient temples.\n" +
                    "- **Tanah Lot Temple:** A majestic Hindu temple perched on an offshore rock formation.\n" +
                    "- **Tegallalang Rice Terraces:** Stunning terraced slopes offering signature swings.\n\n" +
                    "**Suggested Activities:** Catch a sunset surfing session in Uluwatu or Seminyak!\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Ubud Monkey Forest Bali], [MAP: Tanah Lot Temple Bali], [MAP: Tegallalang Rice Terraces Bali]";
        } else if (msg.contains("paris")) {
            return "🗼 **Paris** is a global center for art, fashion, gastronomy, and culture.\n\n" +
                    "**Recommended Spots:**\n" +
                    "- **Eiffel Tower:** The iconic iron lattice tower along the Seine River.\n" +
                    "- **Louvre Museum:** Home of the Mona Lisa and countless historic art treasures.\n" +
                    "- **Notre-Dame Cathedral:** A masterpiece of French Gothic architecture.\n\n" +
                    "**Suggested Food:** Enjoy fresh croissants at a Montmartre cafe or dine along the Seine!\n\n" +
                    "*Note: Since no API key is configured, I am running in local Demo Mode.* [MAP: Eiffel Tower Paris], [MAP: Louvre Museum Paris], [MAP: Notre-Dame Cathedral Paris]";
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

    private String getMockPopularDestinations(List<String> excludes, String country) {
        String c = (country != null) ? country.trim().toLowerCase() : "philippines";
        List<String> mockDestinations;
        
        if (c.contains("japan")) {
            mockDestinations = List.of(
                "{\"name\": \"Tokyo\", \"desc\": \"Vibrant metropolis with historic shrines, tech hubs, and neon-lit streets.\", \"imageKeyword\": \"tokyo\"}",
                "{\"name\": \"Kyoto\", \"desc\": \"Historic temples, traditional wooden houses, and beautiful bamboo forests.\", \"imageKeyword\": \"kyoto\"}",
                "{\"name\": \"Osaka\", \"desc\": \"Famous street food markets, modern towers, and historic castle parks.\", \"imageKeyword\": \"osaka\"}",
                "{\"name\": \"Hokkaido\", \"desc\": \"Stunning volcanic landscapes, hot springs, and world-class ski resorts.\", \"imageKeyword\": \"hokkaido\"}",
                "{\"name\": \"Okinawa\", \"desc\": \"Tropical beaches, beautiful coral reefs, and unique Ryukyu heritage.\", \"imageKeyword\": \"okinawa\"}",
                "{\"name\": \"Nara\", \"desc\": \"Ancient temples, historic parklands, and friendly roaming deer.\", \"imageKeyword\": \"nara\"}",
                "{\"name\": \"Hakone\", \"desc\": \"Hot spring resorts, views of Mt. Fuji, and peaceful forest shrines.\", \"imageKeyword\": \"hakone\"}"
            );
        } else if (c.contains("italy")) {
            mockDestinations = List.of(
                "{\"name\": \"Rome\", \"desc\": \"Ancient ruins like the Colosseum, historic fountains, and Vatican city.\", \"imageKeyword\": \"rome\"}",
                "{\"name\": \"Florence\", \"desc\": \"Birthplace of the Renaissance, historic art galleries, and scenic bridges.\", \"imageKeyword\": \"florence\"}",
                "{\"name\": \"Venice\", \"desc\": \"Scenic canals, historic gondolas, and beautiful gothic architecture.\", \"imageKeyword\": \"venice\"}",
                "{\"name\": \"Amalfi Coast\", \"desc\": \"Colorful cliffside villages overlooking the sparkling blue sea.\", \"imageKeyword\": \"amalfi\"}",
                "{\"name\": \"Milan\", \"desc\": \"High fashion, massive gothic cathedral, and historic art murals.\", \"imageKeyword\": \"milan\"}",
                "{\"name\": \"Tuscany\", \"desc\": \"Rolling vineyard hills, historic estates, and beautiful medieval towns.\", \"imageKeyword\": \"tuscany\"}"
            );
        } else if (c.contains("indonesia")) {
            mockDestinations = List.of(
                "{\"name\": \"Bali\", \"desc\": \"Tropical beaches, iconic temples, and beautiful rice terrace sweeps.\", \"imageKeyword\": \"bali\"}",
                "{\"name\": \"Yogyakarta\", \"desc\": \"Ancient temples of Borobudur and Prambanan, and rich Javanese art.\", \"imageKeyword\": \"temple\"}",
                "{\"name\": \"Komodo Island\", \"desc\": \"Unique komodo dragons, pink sand beaches, and crystal dive coves.\", \"imageKeyword\": \"island\"}",
                "{\"name\": \"Lombok\", \"desc\": \"Pristine beaches, mount Rinjani volcano hikes, and quiet surf spots.\", \"imageKeyword\": \"surf\"}",
                "{\"name\": \"Bandung\", \"desc\": \"Cool highland weather, volcanic craters, and tea plantation estates.\", \"imageKeyword\": \"plantation\"}",
                "{\"name\": \"Jakarta\", \"desc\": \"Vibrant capital city, historic old town, and massive shopping malls.\", \"imageKeyword\": \"jakarta\"}"
            );
        } else if (c.contains("france")) {
            mockDestinations = List.of(
                "{\"name\": \"Paris\", \"desc\": \"Eiffel Tower, world-class art museums, and romantic Seine cruises.\", \"imageKeyword\": \"paris\"}",
                "{\"name\": \"Nice\", \"desc\": \"Scenic French Riviera beaches, azure seas, and sunny promenades.\", \"imageKeyword\": \"nice\"}",
                "{\"name\": \"Provence\", \"desc\": \"Stunning purple lavender fields, olive groves, and quiet stone villages.\", \"imageKeyword\": \"lavender\"}",
                "{\"name\": \"Mont Saint-Michel\", \"desc\": \"Magical medieval abbey perched on a rocky tidal island.\", \"imageKeyword\": \"abbey\"}",
                "{\"name\": \"Bordeaux\", \"desc\": \"World-famous wine estates, historic plazas, and river walks.\", \"imageKeyword\": \"vineyard\"}"
            );
        } else if (c.contains("switzerland")) {
            mockDestinations = List.of(
                "{\"name\": \"Zurich\", \"desc\": \"Scenic lakeside city with historic streets and premium shopping.\", \"imageKeyword\": \"zurich\"}",
                "{\"name\": \"Zermatt\", \"desc\": \"Iconic pyramid peak Matterhorn, ski slopes, and alpine valleys.\", \"imageKeyword\": \"matterhorn\"}",
                "{\"name\": \"Interlaken\", \"desc\": \"Scenic valleys, sparkling lakes, and high-altitude hiking peaks.\", \"imageKeyword\": \"lake\"}",
                "{\"name\": \"Lucerne\", \"desc\": \"Preserved wooden bridge, medieval towers, and lake vistas.\", \"imageKeyword\": \"bridge\"}",
                "{\"name\": \"Geneva\", \"desc\": \"Cosmopolitan lakeside hub, historic old town, and diplomatic parks.\", \"imageKeyword\": \"geneva\"}"
            );
        } else if (c.contains("usa") || c.contains("united states") || c.contains("america")) {
            mockDestinations = List.of(
                "{\"name\": \"New York\", \"desc\": \"Times Square, Central Park, Broadway shows, and iconic skyline.\", \"imageKeyword\": \"nyc\"}",
                "{\"name\": \"Grand Canyon\", \"desc\": \"Stunning deep red rock formations and hiking canyon trails.\", \"imageKeyword\": \"canyon\"}",
                "{\"name\": \"Hawaii\", \"desc\": \"Tropical beaches, dynamic volcanic parks, and historic surf culture.\", \"imageKeyword\": \"hawaii\"}",
                "{\"name\": \"San Francisco\", \"desc\": \"Golden Gate Bridge, historic cable cars, and rolling street hills.\", \"imageKeyword\": \"bridge\"}",
                "{\"name\": \"Las Vegas\", \"desc\": \"Lively casinos, world-class entertainment, and glowing neon strips.\", \"imageKeyword\": \"vegas\"}",
                "{\"name\": \"Miami\", \"desc\": \"Art deco beach vibes, vibrant nightlife, and Latin food scenes.\", \"imageKeyword\": \"miami\"}"
            );
        } else {
            mockDestinations = List.of(
                "{\"name\": \"Palawan\", \"desc\": \"Stunning lagoons, limestone cliffs, and crystal clear water.\", \"imageKeyword\": \"palawan\"}",
                "{\"name\": \"Siargao\", \"desc\": \"World-class surfing waves, coconut trees, and tide pools.\", \"imageKeyword\": \"surf\"}",
                "{\"name\": \"Vigan\", \"desc\": \"Cobblestone streets and preserved Spanish-colonial architecture.\", \"imageKeyword\": \"vigan\"}",
                "{\"name\": \"Bohol\", \"desc\": \"Chocolate Hills, white sand beaches, and unique tarsiers.\", \"imageKeyword\": \"bohol\"}",
                "{\"name\": \"Tagaytay\", \"desc\": \"Cool breezes, scenic parks, and stunning views of Taal Volcano.\", \"imageKeyword\": \"lake\"}",
                "{\"name\": \"Coron\", \"desc\": \"World-class shipwreck diving sites and crystal clear volcanic lakes.\", \"imageKeyword\": \"coron\"}",
                "{\"name\": \"Batanes\", \"desc\": \"Dramatic emerald hills, traditional stone houses, and lighthouses.\", \"imageKeyword\": \"hills\"}",
                "{\"name\": \"Sagada\", \"desc\": \"Mysterious hanging coffins, pine-clad valleys, and cool caves.\", \"imageKeyword\": \"mountain\"}",
                "{\"name\": \"Camiguin\", \"desc\": \"Unique island of seven volcanoes, hot springs, and white sandbars.\", \"imageKeyword\": \"volcano\"}",
                "{\"name\": \"Siquijor\", \"desc\": \"Mystical waterfalls, centuries-old balete trees, and quiet coves.\", \"imageKeyword\": \"waterfall\"}",
                "{\"name\": \"Legazpi\", \"desc\": \"Majestic views of Mount Mayon's perfect cone and exciting ATV trails.\", \"imageKeyword\": \"volcano\"}",
                "{\"name\": \"Iloilo\", \"desc\": \"Stunning heritage churches, delicious batchoy, and local island groups.\", \"imageKeyword\": \"church\"}",
                "{\"name\": \"Davao\", \"desc\": \"Mount Apo, massive durian fruit stalls, and eagle conversation parks.\", \"imageKeyword\": \"mountain\"}",
                "{\"name\": \"Dumaguete\", \"desc\": \"Apo Island sea turtles, clean bayside boulevards, and quiet university vibe.\", \"imageKeyword\": \"turtle\"}",
                "{\"name\": \"Puerto Galera\", \"desc\": \"Beautiful pocket beaches, lively marine diving reefs, and water sports.\", \"imageKeyword\": \"beach\"}"
            );
        }
        
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
        return "[" + String.join(",", filtered.subList(0, Math.min(3, filtered.size()))) + "]";
    }

    public String getPopularDestinations(String exclude, String country, String apiKey) throws Exception {
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
            return getMockPopularDestinations(excludesList, country);
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + resolvedKey;

        String excludeInstructions = "";
        if (!excludesList.isEmpty()) {
            excludeInstructions = "You MUST NOT suggest any of the following destinations (or sub-regions/places within them): " + String.join(", ", excludesList) + ". " +
                    "Also, do not suggest any spelling variations, cities, or sub-destinations inside these excluded spots. ";
        }

        String targetCountry = (country != null && !country.isBlank()) ? country : "Philippines";
        String prompt = "Suggest exactly 3 popular travel destinations in " + targetCountry + ". " +
                excludeInstructions +
                "You must return ONLY a valid JSON array of objects. Do NOT wrap it in ```json or ``` markdown blocks. " +
                "Each object MUST have exactly these fields:\n" +
                "1. \"name\": the name of the destination (e.g. \"Tokyo\", \"Siargao\").\n" +
                "2. \"desc\": a short catchy description (e.g. \"Historic temples and traditional wooden houses\", \"World-class surfing and coconut forest\").\n" +
                "3. \"imageKeyword\": a single word tag for image search (e.g. \"tokyo\", \"surf\", \"beach\", \"mountain\").\n";

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
            lastCallSuccessful = false;
            lastErrorMessage = "Popular Destinations API status: " + response.statusCode();
            return getMockPopularDestinations(excludesList, country);
        }

        lastCallSuccessful = true;
        lastErrorMessage = null;
        ObjectNode root = (ObjectNode) objectMapper.readTree(response.body());
        try {
            String text = root.get("candidates").get(0).get("content").get("parts").get(0).get("text").asText();
            return cleanJsonResponse(text);
        } catch (Exception e) {
            System.err.println("Error parsing popular destinations: " + e.getMessage());
            return getMockPopularDestinations(excludesList, country);
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
            lastCallSuccessful = false;
            lastErrorMessage = "Destination Details API status: " + response.statusCode();
            return generateMockDetails(slug);
        }

        lastCallSuccessful = true;
        lastErrorMessage = null;
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

    public boolean isAiActive() {
        String resolvedKey = defaultApiKey;
        if (resolvedKey == null || resolvedKey.isBlank()) {
            resolvedKey = System.getenv("GEMINI_API_KEY");
        }
        if (resolvedKey == null || resolvedKey.isBlank()) {
            return false;
        }
        return lastCallSuccessful;
    }

    public String getLastErrorMessage() {
        return lastErrorMessage;
    }
}
