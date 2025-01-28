package com.example.poc

import okhttp3.MultipartBody
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path

interface ApiService {
    @POST("interventions")
    suspend fun createIntervention(@Body intervention: Intervention): Response<Void>

    @Multipart
    @POST("interventions/{interventionId}/media")
    suspend fun uploadMedia(
        @Path("interventionId") interventionId: String,
        @Part file: MultipartBody.Part
    ): Response<Void>
}