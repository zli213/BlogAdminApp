package ictgradschool.BlogAdminApp.swingclient.web;

import com.fasterxml.jackson.databind.JsonNode;
import ictgradschool.BlogAdminApp.swingclient.pojos.LoginResponse;
import ictgradschool.BlogAdminApp.swingclient.pojos.User;
import ictgradschool.BlogAdminApp.swingclient.util.JSONUtils;

import java.io.IOException;
import java.net.CookieManager;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

public class API {
    private static API instance;
    private static final String BASE_URL = "http://localhost:3000/api";
    private String authToken;
    private final CookieManager cookieManager;
    private final HttpClient client;

    private API() {
        this.cookieManager = new CookieManager();
        this.client = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .followRedirects(HttpClient.Redirect.NEVER)
                .connectTimeout(Duration.ofSeconds(10))
                .cookieHandler(this.cookieManager)
                .build();
    }

    public static API getInstance() {
        if (instance == null) {
            instance = new API();
        }
        return instance;
    }

    // Login method, takes a User object as parameter
    public LoginResponse login(User user) throws IOException, InterruptedException {
        // Convert the user object to JSON
        String json = JSONUtils.toJSON(user);
        // Build the HTTP POST request
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/login"))
                .setHeader("Content-Type", "application/json")
                .setHeader("Accept", "application/json")
                .method("POST", HttpRequest.BodyPublishers.ofString(json));
        // Send the request and get the response
        HttpRequest request = builder.build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        // Check the response status
        if (response.statusCode() == 204) {
            LoginResponse loginResponse = new LoginResponse();
            loginResponse.setSuccess(true);
            return loginResponse;
        } else {
            // handle failure...
            throw new RuntimeException("Login failed with status code: " + response.statusCode());
        }
    }

    // Logout method
    public void logout() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/logout"))
                .setHeader("Content-Type", "application/json")
                .setHeader("Accept", "application/json")
                .GET()
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        // Check the response status
        if (response.statusCode() != 204) {
            throw new RuntimeException("Logout failed with status code: " + response.statusCode());
        }
    }

    // Method to get all users
    public List<User> getAllUsers() throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/users"))
                .GET()
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        // Check the response status
        if (response.statusCode() == 200) {
            String responseBody = response.body();
            // First, convert the response body to a JSON object
            JsonNode jsonNode = JSONUtils.toObject(responseBody, JsonNode.class);
            // Then get the "users" field from the JsonNode
            JsonNode usersNode = jsonNode.get("users");
            // Convert the "users" field to a JSON string
            String usersJson = usersNode.toString();
            // Finally, convert the JSON string to a list of users
            return JSONUtils.toList(usersJson, User.class);
        } else {
            throw new RuntimeException("You are not an Admin, code status: " + response.statusCode());
        }
    }

    public boolean deleteUser(int userId) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/users/" + userId))
                .DELETE()
                .build();
        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        // Check the response status
        if (response.statusCode() == 204) {
            return true;
        } else {
            // handle failure...
            return false;
        }
    }

}
