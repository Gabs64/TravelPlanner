package com.example.android

import org.json.JSONArray
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

object BackendApi {
    private const val BASE_URL = "http://10.0.2.2:8080"

    fun login(email: String, password: String): String {
        val body = JSONObject()
            .put("email", email)
            .put("password", password)
            .toString()
        return request("/auth/login", "POST", body)
    }

    fun getTrips(userId: String): List<Trip> {
        val response = request("/trips/$userId", "GET", null)
        val jsonArray = JSONArray(response)
        return List(jsonArray.length()) { index ->
            jsonArray.getJSONObject(index).toTrip()
        }
    }

    fun createTrip(userId: String, tripRequest: TripRequest): Trip {
        val body = JSONObject()
            .put("destinationSlug", tripRequest.destinationSlug)
            .put("destinationName", tripRequest.destinationName)
            .put("startDate", tripRequest.startDate)
            .put("endDate", tripRequest.endDate)
            .toString()
        val response = request("/trips/$userId", "POST", body)
        return JSONObject(response).toTrip()
    }

    private fun request(path: String, method: String, body: String?): String {
        val url = URL("$BASE_URL$path")
        val connection = (url.openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 10000
            readTimeout = 10000
            setRequestProperty("Content-Type", "application/json")
            doInput = true
            if (body != null) {
                doOutput = true
            }
        }

        if (body != null) {
            OutputStreamWriter(connection.outputStream).use { it.write(body) }
        }

        val responseCode = connection.responseCode
        val inputStream = if (responseCode in 200..299) connection.inputStream else connection.errorStream
        val responseText = inputStream.bufferedReader().use { it.readText() }

        if (responseCode !in 200..299) {
            throw RuntimeException("HTTP $responseCode: $responseText")
        }

        return responseText
    }

    private fun JSONObject.toTrip(): Trip {
        return Trip(
            id = optString("id", ""),
            destinationSlug = optString("destinationSlug", ""),
            destinationName = optString("destinationName", ""),
            startDate = optString("startDate", ""),
            endDate = optString("endDate", ""),
            status = optString("status", "")
        )
    }
}

data class TripRequest(
    val destinationSlug: String,
    val destinationName: String,
    val startDate: String,
    val endDate: String,
)

data class Trip(
    val id: String,
    val destinationSlug: String,
    val destinationName: String,
    val startDate: String,
    val endDate: String,
    val status: String,
)
