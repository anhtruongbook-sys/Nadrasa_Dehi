package com.nadrasadehi.netalight

import android.app.Activity
import android.graphics.Bitmap
import android.util.Base64
import org.json.JSONArray
import java.io.ByteArrayOutputStream
import android.Manifest
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.provider.MediaStore
import android.provider.Settings
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.nadrasadehi.netalight/save_image"
    private val LOCATION_REQ_CODE = 2001
    private val PICK_IMAGE_REQ = 4001
    private val TAKE_PHOTO_REQ = 4002
    private var pendingImageResult: MethodChannel.Result? = null
    private var pendingLocationResult: MethodChannel.Result? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "saveImageToGallery" -> {
                    val bytes = call.argument<ByteArray>("bytes")
                    val filename = call.argument<String>("filename") ?: "NetaLight_${System.currentTimeMillis()}.png"

                    if (bytes == null || bytes.isEmpty()) {
                        result.error("INVALID_DATA", "Image bytes are empty", null)
                        return@setMethodCallHandler
                    }

                    try {
                        val saved = saveImageToPictures(bytes, filename)
                        if (saved) {
                            result.success("OK")
                        } else {
                            result.error("SAVE_FAILED", "Failed to save image to Pictures", null)
                        }
                    } catch (e: Exception) {
                        result.error("ERROR", e.localizedMessage, null)
                    }
                }
                "saveFileToDownloads" -> {
                    val bytes = call.argument<ByteArray>("bytes")
                    val filename = call.argument<String>("filename") ?: "NetaLight_${System.currentTimeMillis()}.bin"
                    val mimeType = call.argument<String>("mimeType") ?: "application/octet-stream"

                    if (bytes == null || bytes.isEmpty()) {
                        result.error("INVALID_DATA", "File bytes are empty", null)
                        return@setMethodCallHandler
                    }

                    try {
                        val saved = saveFileToDownloadsFolder(bytes, filename, mimeType)
                        if (saved) {
                            result.success("OK")
                        } else {
                            result.error("SAVE_FAILED", "Failed to save file to Downloads", null)
                        }
                    } catch (e: Exception) {
                        result.error("ERROR", e.localizedMessage, null)
                    }
                }
                                "pickImage" -> {
                    pendingImageResult = result
                    try {
                        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                            type = "image/*"
                            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                        }
                        startActivityForResult(Intent.createChooser(intent, "Chọn ảnh bài học"), PICK_IMAGE_REQ)
                    } catch (e: Exception) {
                        result.error("ERROR", e.localizedMessage, null)
                        pendingImageResult = null
                    }
                }
                "takePhoto" -> {
                    pendingImageResult = result
                    try {
                        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                        startActivityForResult(intent, TAKE_PHOTO_REQ)
                    } catch (e: Exception) {
                        result.error("ERROR", e.localizedMessage, null)
                        pendingImageResult = null
                    }
                }
                "checkLocationPermission" -> {
                    val hasPerm = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
                    result.success(hasPerm)
                }
                "requestLocationPermission" -> {
                    val hasPerm = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
                    if (hasPerm) {
                        result.success(true)
                    } else {
                        pendingLocationResult = result
                        ActivityCompat.requestPermissions(
                            this,
                            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION),
                            LOCATION_REQ_CODE
                        )
                    }
                }
                "getLocation" -> {
                    val hasPerm = ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
                    if (!hasPerm) {
                        pendingLocationResult = result
                        ActivityCompat.requestPermissions(
                            this,
                            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION),
                            LOCATION_REQ_CODE
                        )
                    } else {
                        fetchNativeLocation(result)
                    }
                }
                "openLocationSettings" -> {
                    try {
                        val intent = Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)
                        startActivity(intent)
                        result.success("OK")
                    } catch (e: Exception) {
                        result.error("ERROR", e.localizedMessage, null)
                    }
                }
                "openAppSettings" -> {
                    try {
                        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                            data = Uri.fromParts("package", packageName, null)
                        }
                        startActivity(intent)
                        result.success("OK")
                    } catch (e: Exception) {
                        result.error("ERROR", e.localizedMessage, null)
                    }
                }
                else -> {
                    result.notImplemented()
                }
            }
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == PICK_IMAGE_REQ || requestCode == TAKE_PHOTO_REQ) {
            val cb = pendingImageResult
            pendingImageResult = null
            if (cb == null) return

            if (resultCode != Activity.RESULT_OK || data == null) {
                cb.success("[]")
                return
            }

            try {
                val results = mutableListOf<String>()
                if (requestCode == PICK_IMAGE_REQ) {
                    val clipData = data.clipData
                    if (clipData != null && clipData.itemCount > 0) {
                        for (i in 0 until clipData.itemCount) {
                            val uri = clipData.getItemAt(i).uri
                            val b64 = uriToBase64(uri)
                            if (b64 != null) results.add(b64)
                        }
                    } else if (data.data != null) {
                        val b64 = uriToBase64(data.data!!)
                        if (b64 != null) results.add(b64)
                    }
                } else if (requestCode == TAKE_PHOTO_REQ) {
                    val bitmap = data.extras?.get("data") as? Bitmap
                    if (bitmap != null) {
                        val stream = ByteArrayOutputStream()
                        bitmap.compress(Bitmap.CompressFormat.JPEG, 85, stream)
                        val bytes = stream.toByteArray()
                        val b64 = "data:image/jpeg;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP)
                        results.add(b64)
                    } else if (data.data != null) {
                        val b64 = uriToBase64(data.data!!)
                        if (b64 != null) results.add(b64)
                    }
                }

                val json = JSONArray(results).toString()
                cb.success(json)
            } catch (e: Exception) {
                cb.error("ERROR", e.localizedMessage, null)
            }
        }
    }

    private fun uriToBase64(uri: Uri): String? {
        return try {
            val inputStream = contentResolver.openInputStream(uri)
            val bytes = inputStream?.readBytes()
            inputStream?.close()
            if (bytes != null) {
                val mime = contentResolver.getType(uri) ?: "image/jpeg"
                "data:$mime;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP)
            } else null
        } catch (e: Exception) {
            null
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == LOCATION_REQ_CODE) {
            val granted = grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
            val cb = pendingLocationResult
            pendingLocationResult = null
            if (cb != null) {
                if (granted) {
                    fetchNativeLocation(cb)
                } else {
                    cb.error("PERMISSION_DENIED", "Quyền truy cập vị trí bị từ chối", null)
                }
            }
        }
    }

    private fun fetchNativeLocation(result: MethodChannel.Result) {
        val lm = getSystemService(Context.LOCATION_SERVICE) as? LocationManager
        if (lm == null) {
            result.error("NO_LOCATION_MANAGER", "Thiết bị không có LocationManager", null)
            return
        }

        val gpsEnabled = lm.isProviderEnabled(LocationManager.GPS_PROVIDER)
        val networkEnabled = lm.isProviderEnabled(LocationManager.NETWORK_PROVIDER)

        if (!gpsEnabled && !networkEnabled) {
            result.error("GPS_DISABLED", "GPS và Định vị mạng đang bị tắt", null)
            return
        }

        // 1. Kiểm tra vị trí đã lưu gần nhất (Last Known Location)
        var bestLocation: Location? = null
        if (gpsEnabled) {
            try {
                val loc = lm.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                if (loc != null) bestLocation = loc
            } catch (e: SecurityException) {}
        }
        if (networkEnabled) {
            try {
                val loc = lm.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
                if (loc != null && (bestLocation == null || loc.time > bestLocation.time)) {
                    bestLocation = loc
                }
            } catch (e: SecurityException) {}
        }

        // Nếu có vị trí trong vòng 5 phút, trả về ngay lập tức
        if (bestLocation != null && (System.currentTimeMillis() - bestLocation.time < 300000)) {
            val resMap = mapOf(
                "lat" to bestLocation.latitude,
                "lng" to bestLocation.longitude,
                "accuracy" to bestLocation.accuracy
            )
            result.success(resMap)
            return
        }

        // 2. Yêu cầu cập nhật tọa độ tươi từ phần cứng GPS / Network
        var answered = false
        val handler = Handler(Looper.getMainLooper())

        val listener = object : LocationListener {
            override fun onLocationChanged(loc: Location) {
                if (answered) return
                answered = true
                try { lm.removeUpdates(this) } catch (e: Exception) {}
                val resMap = mapOf(
                    "lat" to loc.latitude,
                    "lng" to loc.longitude,
                    "accuracy" to loc.accuracy
                )
                result.success(resMap)
            }
            override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
            override fun onProviderEnabled(provider: String) {}
            override fun onProviderDisabled(provider: String) {}
        }

        val timeoutRunnable = Runnable {
            if (answered) return@Runnable
            answered = true
            try { lm.removeUpdates(listener) } catch (e: Exception) {}
            if (bestLocation != null) {
                val resMap = mapOf(
                    "lat" to bestLocation.latitude,
                    "lng" to bestLocation.longitude,
                    "accuracy" to bestLocation.accuracy
                )
                result.success(resMap)
            } else {
                result.error("TIMEOUT", "Không nhận được tín hiệu GPS kịp thời", null)
            }
        }
        handler.postDelayed(timeoutRunnable, 10000)

        try {
            if (gpsEnabled) {
                lm.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000L, 1f, listener, Looper.getMainLooper())
            }
            if (networkEnabled) {
                lm.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 1000L, 1f, listener, Looper.getMainLooper())
            }
        } catch (e: SecurityException) {
            handler.removeCallbacks(timeoutRunnable)
            if (!answered) {
                answered = true
                result.error("SECURITY_EXCEPTION", e.localizedMessage, null)
            }
        }
    }

    private fun saveImageToPictures(bytes: ByteArray, filename: String): Boolean {
        var outputStream: OutputStream? = null
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val values = ContentValues().apply {
                    put(MediaStore.Images.Media.DISPLAY_NAME, filename)
                    put(MediaStore.Images.Media.MIME_TYPE, "image/png")
                    put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/NetaLight")
                    put(MediaStore.Images.Media.IS_PENDING, 1)
                }

                val uri: Uri? = contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
                if (uri != null) {
                    outputStream = contentResolver.openOutputStream(uri)
                    outputStream?.write(bytes)
                    outputStream?.flush()

                    values.clear()
                    values.put(MediaStore.Images.Media.IS_PENDING, 0)
                    contentResolver.update(uri, values, null, null)
                    return true
                }
            } else {
                val picturesDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES)
                val appDir = File(picturesDir, "NetaLight")
                if (!appDir.exists()) {
                    appDir.mkdirs()
                }
                val imageFile = File(appDir, filename)
                outputStream = FileOutputStream(imageFile)
                outputStream.write(bytes)
                outputStream.flush()

                // Trigger media scanner on Android 9 and below
                android.media.MediaScannerConnection.scanFile(
                    this,
                    arrayOf(imageFile.absolutePath),
                    arrayOf("image/png"),
                    null
                )
                return true
            }
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        } finally {
            outputStream?.close()
        }
        return false
    }

    private fun saveFileToDownloadsFolder(bytes: ByteArray, filename: String, mimeType: String): Boolean {
        var outputStream: OutputStream? = null
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val values = ContentValues().apply {
                    put(MediaStore.Downloads.DISPLAY_NAME, filename)
                    put(MediaStore.Downloads.MIME_TYPE, mimeType)
                    put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/NetaLight")
                    put(MediaStore.Downloads.IS_PENDING, 1)
                }

                val uri: Uri? = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                if (uri != null) {
                    outputStream = contentResolver.openOutputStream(uri)
                    outputStream?.write(bytes)
                    outputStream?.flush()

                    values.clear()
                    values.put(MediaStore.Downloads.IS_PENDING, 0)
                    contentResolver.update(uri, values, null, null)
                    return true
                }
            } else {
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                val appDir = File(downloadsDir, "NetaLight")
                if (!appDir.exists()) {
                    appDir.mkdirs()
                }
                val destFile = File(appDir, filename)
                outputStream = FileOutputStream(destFile)
                outputStream.write(bytes)
                outputStream.flush()

                // Trigger media scanner on Android 9 and below
                android.media.MediaScannerConnection.scanFile(
                    this,
                    arrayOf(destFile.absolutePath),
                    arrayOf(mimeType),
                    null
                )
                return true
            }
        } catch (e: Exception) {
            e.printStackTrace()
            return false
        } finally {
            outputStream?.close()
        }
        return false
    }
}
