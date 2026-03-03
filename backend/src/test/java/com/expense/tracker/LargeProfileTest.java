package com.expense.tracker;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

public class LargeProfileTest {
    private static final String BASE_URL = "http://localhost:8080/api";
    private static final HttpClient client = HttpClient.newHttpClient();
    private static final ObjectMapper mapper = new ObjectMapper();

    public static void main(String[] args) throws Exception {
        String email = "test_large_" + System.currentTimeMillis() + "@test.com";
        String pass = "password";

        // Register
        Map<String, String> regBody = Map.of("email", email, "password", pass);
        HttpRequest regReq = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/auth/register"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(regBody)))
                .build();
        HttpResponse<String> regRes = client.send(regReq, HttpResponse.BodyHandlers.ofString());
        System.out.println("Registration Status: " + regRes.statusCode());
        System.out.println("Registration Body: " + regRes.body());

        JsonNode regNode = mapper.readTree(regRes.body());
        if (!regNode.has("token")) {
            System.err.println("Registration failed, no token returned.");
            return;
        }
        String token = regNode.get("token").asText();

        // Create large string (~1MB)
        StringBuilder sb = new StringBuilder("data:image/png;base64,");
        for (int i = 0; i < 1000000; i++) {
            sb.append("A");
        }
        String largeImage = sb.toString();

        // Update Profile
        Map<String, String> profBody = Map.of("fullName", "Large User", "profileImage", largeImage);
        HttpRequest profReq = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/profile"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + token)
                .PUT(HttpRequest.BodyPublishers.ofString(mapper.writeValueAsString(profBody)))
                .build();

        HttpResponse<String> profRes = client.send(profReq, HttpResponse.BodyHandlers.ofString());
        System.out.println("Status: " + profRes.statusCode());
        System.out.println("Body: " + profRes.body());
    }
}
