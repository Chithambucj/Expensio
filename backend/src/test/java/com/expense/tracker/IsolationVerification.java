package com.expense.tracker;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

public class IsolationVerification {

    private final String BASE_URL = "http://localhost:8080/api";
    private final HttpClient client = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    public void verifyProfileIsolation() throws Exception {
        long ts = System.currentTimeMillis();
        String user1 = "prof_user1_" + ts + "@test.com";
        String user2 = "prof_user2_" + ts + "@test.com";
        String pass = "password";

        // 1. Register User 1 & 2
        String token1 = register(user1, pass);
        String token2 = register(user2, pass);

        // 2. Update Profile for User 1
        updateProfile("User One", "data:image/png;base64,user1image", token1);

        // 3. Update Profile for User 2
        updateProfile("User Two", "data:image/png;base64,user2image", token2);

        // 4. Verify User 1 sees their profile
        JsonNode profile1 = getProfile(token1);
        assertEquals("User One", profile1.get("fullName").asText());
        assertEquals("data:image/png;base64,user1image", profile1.get("profileImage").asText());

        // 5. Verify User 2 sees their profile (and NOT User 1's)
        JsonNode profile2 = getProfile(token2);
        assertEquals("User Two", profile2.get("fullName").asText());
        assertEquals("data:image/png;base64,user2image", profile2.get("profileImage").asText());

        System.out.println("SUCCESS: Profile isolation verified!");
    }

    private void updateProfile(String name, String image, String token) throws Exception {
        Map<String, String> body = Map.of("fullName", name, "profileImage", image);
        String jsonBody = mapper.writeValueAsString(body);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/profile"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + token)
                .PUT(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private JsonNode getProfile(String token) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/profile"))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return mapper.readTree(response.body());
    }

    @Test
    public void verifyMultiUserIsolation() throws Exception {
        long ts = System.currentTimeMillis();
        String user1 = "java_user1_" + ts + "@test.com";
        String user2 = "java_user2_" + ts + "@test.com";
        String pass = "password";

        // 1. Register User 1
        String token1 = register(user1, pass);
        assertNotNull(token1, "Token for User 1 should not be null");

        // 2. Create Payment Mode for User 1
        createPaymentMode("Visa_1", token1);

        // 3. Register User 2
        String token2 = register(user2, pass);
        assertNotNull(token2, "Token for User 2 should not be null");

        // 4. Verify User 2 sees 0 payment modes
        int count2 = getPaymentModeCount(token2);
        assertEquals(0, count2, "User 2 should see 0 payment modes initially");

        // 5. Create Payment Mode for User 2
        createPaymentMode("Master_2", token2);

        // 6. Verify User 1 still sees only 1 payment mode
        int count1 = getPaymentModeCount(token1);
        assertEquals(1, count1, "User 1 should only see their 1 payment mode");

        // 7. Verify User 2 sees their 1 payment mode
        count2 = getPaymentModeCount(token2);
        assertEquals(1, count2, "User 2 should only see their 1 payment mode");

        System.out.println("SUCCESS: Multi-user isolation verified via Java!");
    }

    private String register(String email, String password) throws Exception {
        Map<String, String> body = Map.of("email", email, "password", password);
        String jsonBody = mapper.writeValueAsString(body);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/auth/register"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode node = mapper.readTree(response.body());
        return node.get("token").asText();
    }

    private void createPaymentMode(String name, String token) throws Exception {
        Map<String, String> body = Map.of("name", name, "type", "cash");
        String jsonBody = mapper.writeValueAsString(body);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/payment-modes"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + token)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private int getPaymentModeCount(String token) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/payment-modes"))
                .header("Authorization", "Bearer " + token)
                .GET()
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        JsonNode node = mapper.readTree(response.body());
        return node.size();
    }
}
