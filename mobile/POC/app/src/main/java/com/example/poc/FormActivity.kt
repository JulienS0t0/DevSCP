package com.example.poc

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.RecognitionListener
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.Image
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.PhotoCamera
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import androidx.lifecycle.lifecycleScope
import coil.compose.rememberImagePainter
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import android.util.Log
import android.widget.Toast
import okhttp3.MultipartBody
import java.util.UUID
import okhttp3.OkHttpClient
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.io.File
import java.text.SimpleDateFormat
import java.util.*

class FormActivity : AppCompatActivity() {
    private lateinit var apiService: ApiService
    private lateinit var photoUri: Uri
    private val photos = mutableStateListOf<Uri>()
    private lateinit var speechRecognizer: SpeechRecognizer
    private lateinit var currentPhotoPath: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val roomNumber = intent.getStringExtra("roomNumber") ?: "Unknown"
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this)

        // Request RECORD_AUDIO permission
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.RECORD_AUDIO), REQUEST_RECORD_AUDIO_PERMISSION)
        }

        // Initialize Retrofit with logging
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        val client = OkHttpClient.Builder()
            .addInterceptor(logging)
            .build()

        // Initialize Retrofit
        val retrofit = Retrofit.Builder()
            .baseUrl("http://192.168.43.194:3000/api/")
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        apiService = retrofit.create(ApiService::class.java)

        setContent {
            FormScreen(roomNumber)
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_RECORD_AUDIO_PERMISSION) {
            if ((grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED)) {
                // Permission granted
            } else {
                // Permission denied
            }
        }
    }

    @Composable
    fun FormScreen(roomNumber: String) {
        var textFieldValue by remember { mutableStateOf(TextFieldValue("")) }
        val context = LocalContext.current
        var isRecording by remember { mutableStateOf(false) }
        var showDialog by remember { mutableStateOf(false) }

        if (showDialog) {
            AlertDialog(
                onDismissRequest = { showDialog = false },
                title = { Text("Form Submitted") },
                text = { Text("Your report has been submitted successfully.") },
                confirmButton = {
                    Button(onClick = {
                        showDialog = false
                        (context as? FormActivity)?.finish()
                    }) {
                        Text("OK")
                    }
                }
            )
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Top
        ) {
            item {
                Text(text = "RoomNumber: $roomNumber", style = MaterialTheme.typography.headlineSmall)
                Spacer(modifier = Modifier.height(16.dp))
                TextField(
                    value = textFieldValue,
                    onValueChange = { textFieldValue = it },
                    label = { Text("Enter text") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(200.dp),
                    maxLines = 10
                )
                Spacer(modifier = Modifier.height(16.dp))
                Icon(
                    imageVector = Icons.Filled.Mic,
                    contentDescription = "Microphone",
                    tint = if (isRecording) Color.Red else Color.Black,
                    modifier = Modifier
                        .size(48.dp)
                        .pointerInput(Unit) {
                            detectTapGestures(
                                onLongPress = {
                                    isRecording = true
                                    startListening(context) { result ->
                                        textFieldValue = textFieldValue.copy(text = textFieldValue.text + " " + result)
                                    }
                                },
                                onPress = {
                                    tryAwaitRelease()
                                    isRecording = false
                                    stopListening()
                                }
                            )
                        }
                )
                Spacer(modifier = Modifier.height(16.dp))
                Button(onClick = { takePhoto(context) }) {
                    Icon(imageVector = Icons.Filled.PhotoCamera, contentDescription = "Camera")
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Take Photo")
                }
                Spacer(modifier = Modifier.height(16.dp))
            }
            items(photos) { photo ->
                Box(modifier = Modifier.fillMaxWidth()) {
                    Image(
                        painter = rememberImagePainter(photo),
                        contentDescription = null,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(200.dp),
                        contentScale = ContentScale.Crop
                    )
                    IconButton(
                        onClick = { photos.remove(photo) },
                        modifier = Modifier.align(Alignment.TopEnd)
                    ) {
                        Icon(imageVector = Icons.Filled.Delete, contentDescription = "Delete", tint = Color.Red)
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }
            item {
                Spacer(modifier = Modifier.height(16.dp))
                Button(onClick = {
                    submitReport(roomNumber, textFieldValue.text)
                    showDialog = true
                }) {
                    Text("Submit Report")
                }
            }
        }
    }

    private fun startListening(context: Context, onResult: (String) -> Unit) {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "fr-FR")
        }
        speechRecognizer.setRecognitionListener(object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                Log.d("SpeechRecognizer", "Ready for speech")
            }
            override fun onBeginningOfSpeech() {
                Log.d("SpeechRecognizer", "Beginning of speech")
            }
            override fun onRmsChanged(rmsdB: Float) {
                Log.d("SpeechRecognizer", "RMS changed: $rmsdB")
            }
            override fun onBufferReceived(buffer: ByteArray?) {
                Log.d("SpeechRecognizer", "Buffer received")
            }
            override fun onEndOfSpeech() {
                Log.d("SpeechRecognizer", "End of speech")
            }
            override fun onError(error: Int) {
                Log.e("SpeechRecognizer", "Error: $error")
            }
            override fun onResults(results: Bundle?) {
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    Log.d("SpeechRecognizer", "Results: ${matches[0]}")
                    onResult(matches[0])
                } else {
                    Log.d("SpeechRecognizer", "No results")
                }
            }
            override fun onPartialResults(partialResults: Bundle?) {
                Log.d("SpeechRecognizer", "Partial results")
            }
            override fun onEvent(eventType: Int, params: Bundle?) {
                Log.d("SpeechRecognizer", "Event: $eventType")
            }
        })
        speechRecognizer.startListening(intent)
    }

    private fun stopListening() {
        speechRecognizer.stopListening()
    }

    override fun onDestroy() {
        super.onDestroy()
        speechRecognizer.destroy()
    }

    private fun takePhoto(context: Context) {
        val photoFile = createImageFile()
        photoUri = FileProvider.getUriForFile(
            context,
            "com.example.poc.fileprovider",
            photoFile
        )
        val intent = Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE).apply {
            putExtra(android.provider.MediaStore.EXTRA_OUTPUT, photoUri)
        }
        startActivityForResult(intent, REQUEST_IMAGE_CAPTURE)
    }

    private fun createImageFile(): File {
        val timeStamp: String = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val storageDir: File = getExternalFilesDir(Environment.DIRECTORY_PICTURES)!!
        return File.createTempFile(
            "JPEG_${timeStamp}_",
            ".jpg",
            storageDir
        ).apply {
            // Save a file: path for use with ACTION_VIEW intents
            currentPhotoPath = absolutePath
        }
    }

    private fun submitReport(roomNumber: String, notes: String) {
        val finalNotes = if (notes.isBlank()) "No notes provided" else notes

        val interventionId = UUID.randomUUID().toString()
        val intervention = Intervention(
            interventionId = interventionId,
            roomId = roomNumber,
            notes = finalNotes
        )
        lifecycleScope.launch {
            try {
                Log.d("FormActivity", "Submitting report: $intervention")
                val response = apiService.createIntervention(intervention)
                if (response.isSuccessful) {
                    Log.d("FormActivity", "Report submitted successfully")
                    // Upload photos
                    photos.forEach { uri ->
                        val file = File(uri.path!!)
                        val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
                        val body = MultipartBody.Part.createFormData("file", file.name, requestFile)
                        val uploadResponse = apiService.uploadMedia(intervention.interventionId, body)
                        if (uploadResponse.isSuccessful) {
                            Log.d("FormActivity", "Photo uploaded successfully: $uri")
                        } else {
                            Log.e("FormActivity", "Failed to upload photo: $uri")
                        }
                    }
                } else {
                    Log.e("FormActivity", "Failed to submit report: ${response.errorBody()?.string()}")
                }
            } catch (e: Exception) {
                Log.e("FormActivity", "Network error: ${e.message}", e)
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == REQUEST_IMAGE_CAPTURE && resultCode == RESULT_OK) {
            photos.add(Uri.fromFile(File(currentPhotoPath)))
        }
    }

    companion object {
        private const val REQUEST_RECORD_AUDIO_PERMISSION = 200
        private const val REQUEST_IMAGE_CAPTURE = 1
    }
}