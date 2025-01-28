package com.example.poc

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.app.ActivityCompat
import com.journeyapps.barcodescanner.BarcodeCallback
import com.journeyapps.barcodescanner.BarcodeResult
import com.journeyapps.barcodescanner.DecoratedBarcodeView
import androidx.compose.material3.Text
import org.json.JSONObject

class MainActivity : AppCompatActivity() {
    private val requestCameraPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            setContent {
                QRCodeScannerScreen() // Compose UI setup
            }
        } else {
            Toast.makeText(this, "Camera permission is required to scan QR codes", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            setContent {
                QRCodeScannerScreen() // Compose UI setup
            }
        } else {
            requestCameraPermissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    @Composable
    fun QRCodeScannerScreen() {
        val context = LocalContext.current
        var qrCodeResult by remember { mutableStateOf<String?>(null) }

        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            // Vue pour scanner les QR codes
            AndroidView(
                factory = { ctx ->
                    val barcodeView = DecoratedBarcodeView(ctx)
                    barcodeView.decodeContinuous(object : BarcodeCallback {
                        override fun barcodeResult(result: BarcodeResult?) {
                            result?.let {
                                qrCodeResult = it.text
                                val jsonObject = JSONObject(it.text)
                                val roomNumber = jsonObject.optString("roomNumber", "Unknown")
                                val intent = Intent(context, FormActivity::class.java)
                                intent.putExtra("roomNumber", roomNumber)
                                context.startActivity(intent)
                            }
                        }

                        override fun possibleResultPoints(resultPoints: MutableList<com.google.zxing.ResultPoint>?) {}
                    })
                    barcodeView.resume() // Ensure the camera is resumed
                    barcodeView
                },
                update = { view ->
                    view.resume() // Ensure the camera is resumed
                }
            )
        }
    }

    override fun onResume() {
        super.onResume()
        // No need to manually resume the camera, handled in Compose
    }

    override fun onPause() {
        super.onPause()
        // No need to manually pause the camera, handled in Compose
    }
}