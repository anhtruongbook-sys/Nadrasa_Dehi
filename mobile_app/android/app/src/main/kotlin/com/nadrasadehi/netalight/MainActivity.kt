package com.nadrasadehi.netalight

import android.app.Activity
import android.graphics.Bitmap
import android.graphics.BitmapFactory
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
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.nadrasadehi.netalight/save_image"
    private val COMPASS_CHANNEL = "com.nadrasadehi.netalight/compass_stream"
    private val LOCATION_REQ_CODE = 2001
    private val PICK_IMAGE_REQ = 4001
    private val TAKE_PHOTO_REQ = 4002
    private val PICK_DATA_FILE_REQ = 4003
    private var pendingImageResult: MethodChannel.Result? = null
    private var pendingDataFileResult: MethodChannel.Result? = null
    private var pendingLocationResult: MethodChannel.Result? = null

    // Native Hardware Compass Sensors
    private var sensorManager: SensorManager? = null
    private var compassEventSink: EventChannel.EventSink? = null
    private var rotationSensor: Sensor? = null
    private var accelerometerSensor: Sensor? = null
    private var magnetometerSensor: Sensor? = null
    private val lastAccelerometer = FloatArray(3)
    private val lastMagnetometer = FloatArray(3)
    private var hasAccelerometer = false
    private var hasMagnetometer = false
    private var smoothedHeading = -1.0
    private var lastCompassEmittedTime = 0L

    private val compassListener = object : SensorEventListener {
        override fun onSensorChanged(event: SensorEvent) {
            val now = System.currentTimeMillis()
            if (now - lastCompassEmittedTime < 33) return // Cap at ~30 FPS

            val rMatrix = FloatArray(9)
            var hasMatrix = false

            if (event.sensor.type == Sensor.TYPE_ROTATION_VECTOR ||
                event.sensor.type == Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR) {
                SensorManager.getRotationMatrixFromVector(rMatrix, event.values)
                hasMatrix = true
            } else if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
                System.arraycopy(event.values, 0, lastAccelerometer, 0, 3)
                hasAccelerometer = true
                if (hasMagnetometer) {
                    hasMatrix = SensorManager.getRotationMatrix(rMatrix, null, lastAccelerometer, lastMagnetometer)
                }
            } else if (event.sensor.type == Sensor.TYPE_MAGNETIC_FIELD) {
                System.arraycopy(event.values, 0, lastMagnetometer, 0, 3)
                hasMagnetometer = true
                if (hasAccelerometer) {
                    hasMatrix = SensorManager.getRotationMatrix(rMatrix, null, lastAccelerometer, lastMagnetometer)
                }
            }

            if (hasMatrix) {
                // R[1] = East component of top of phone (Y-axis)
                // R[4] = North component of top of phone (Y-axis)
                // R[7] = Up component of top of phone (Y-axis)
                val east = rMatrix[1].toDouble()
                val north = rMatrix[4].toDouble()
                val up = rMatrix[7].toDouble()

                var azimuthRad = Math.atan2(east, north)

                // If held upright (> 60 deg pitch, up > 0.85):
                // Aiming through back camera (-Z axis):
                if (up > 0.85) {
                    val eastCam = -rMatrix[2].toDouble()
                    val northCam = -rMatrix[5].toDouble()
                    val azCam = Math.atan2(eastCam, northCam)
                    val factor = ((up - 0.85) / 0.15).coerceIn(0.0, 1.0)
                    var diff = azCam - azimuthRad
                    while (diff < -Math.PI) diff += 2 * Math.PI
                    while (diff > Math.PI) diff -= 2 * Math.PI
                    azimuthRad += factor * diff
                }

                var headingDeg = Math.toDegrees(azimuthRad)
                headingDeg = (headingDeg % 360.0 + 360.0) % 360.0

                // Exponential Moving Average filter across 0/360 boundary
                if (smoothedHeading < 0) {
                    smoothedHeading = headingDeg
                } else {
                    var diff = headingDeg - smoothedHeading
                    while (diff < -180.0) diff += 360.0
                    while (diff > 180.0) diff -= 360.0
                    if (Math.abs(diff) > 0.1) {
                        val filterFactor = if (Math.abs(diff) > 15.0) 0.50 else 0.25
                        smoothedHeading = (smoothedHeading + filterFactor * diff + 360.0) % 360.0
                    }
                }

                lastCompassEmittedTime = now
                val rounded = Math.round(smoothedHeading * 10.0) / 10.0
                val res = mapOf(
                    "heading" to rounded,
                    "accuracy" to event.accuracy
                )
                runOnUiThread {
                    compassEventSink?.success(res)
                }
            }
        }

        override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        EventChannel(flutterEngine.dartExecutor.binaryMessenger, COMPASS_CHANNEL).setStreamHandler(object : EventChannel.StreamHandler {
            override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
                compassEventSink = events
                startCompassSensors()
            }
            override fun onCancel(arguments: Any?) {
                stopCompassSensors()
                compassEventSink = null
            }
        })

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
                "saveImageFileToGallery" -> {
                    val filePath = call.argument<String>("filePath")
                    val filename = call.argument<String>("filename") ?: "NetaLight_${System.currentTimeMillis()}.png"

                    if (filePath == null) {
                        result.error("INVALID_DATA", "File path is null", null)
                        return@setMethodCallHandler
                    }
                    val file = File(filePath)
                    if (!file.exists()) {
                        result.error("NOT_FOUND", "File does not exist", null)
                        return@setMethodCallHandler
                    }

                    try {
                        val saved = saveImageFileToPictures(file, filename)
                        try { file.delete() } catch (e: Exception) {}
                        if (saved) {
                            result.success("OK")
                        } else {
                            result.error("SAVE_FAILED", "Failed to save image to Pictures", null)
                        }
                    } catch (e: Exception) {
                        try { file.delete() } catch (ex: Exception) {}
                        result.error("ERROR", e.localizedMessage, null)
                    }
                }
                "saveFilePathToDownloads" -> {
                    val filePath = call.argument<String>("filePath")
                    val filename = call.argument<String>("filename") ?: "NetaLight_${System.currentTimeMillis()}.bin"
                    val mimeType = call.argument<String>("mimeType") ?: "application/octet-stream"

                    if (filePath == null) {
                        result.error("INVALID_DATA", "File path is null", null)
                        return@setMethodCallHandler
                    }
                    val file = File(filePath)
                    if (!file.exists()) {
                        result.error("NOT_FOUND", "File does not exist", null)
                        return@setMethodCallHandler
                    }

                    try {
                        val saved = saveFilePathToDownloadsFolder(file, filename, mimeType)
                        try { file.delete() } catch (e: Exception) {}
                        if (saved) {
                            result.success("OK")
                        } else {
                            result.error("SAVE_FAILED", "Failed to save file to Downloads", null)
                        }
                    } catch (e: Exception) {
                        try { file.delete() } catch (ex: Exception) {}
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
                "pickDataFile" -> {
                    pendingDataFileResult = result
                    try {
                        val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                            type = "*/*"
                            val mimeTypes = arrayOf(
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                "application/vnd.ms-excel",
                                "text/csv",
                                "text/plain",
                                "application/octet-stream"
                            )
                            putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes)
                            addCategory(Intent.CATEGORY_OPENABLE)
                        }
                        startActivityForResult(Intent.createChooser(intent, "Chọn tệp tọa độ (Excel, CSV, TXT)"), PICK_DATA_FILE_REQ)
                    } catch (e: Exception) {
                        result.error("ERROR", e.localizedMessage, null)
                        pendingDataFileResult = null
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
                "openExternalUrl" -> {
                    val urlStr = call.argument<String>("url")
                    if (urlStr.isNullOrEmpty()) {
                        result.error("INVALID_URL", "URL is null or empty", null)
                        return@setMethodCallHandler
                    }
                    try {
                        val intent: Intent
                        if (urlStr.startsWith("intent:")) {
                            intent = Intent.parseUri(urlStr, Intent.URI_INTENT_SCHEME)
                        } else {
                            intent = Intent(Intent.ACTION_VIEW, Uri.parse(urlStr))
                        }
                        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                        startActivity(intent)
                        result.success("OK")
                    } catch (e: Exception) {
                        try {
                            if (urlStr.startsWith("intent:")) {
                                val parsed = Intent.parseUri(urlStr, Intent.URI_INTENT_SCHEME)
                                val fallbackUrl = parsed.getStringExtra("browser_fallback_url")
                                if (!fallbackUrl.isNullOrEmpty()) {
                                    val fallbackIntent = Intent(Intent.ACTION_VIEW, Uri.parse(fallbackUrl)).apply {
                                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                    }
                                    startActivity(fallbackIntent)
                                    result.success("OK")
                                    return@setMethodCallHandler
                                }
                            }
                            // Clean fallback if intent: was parsed from https URL
                            val cleanUrl = if (urlStr.startsWith("intent:")) {
                                val parsed = Intent.parseUri(urlStr, Intent.URI_INTENT_SCHEME)
                                val scheme = parsed.scheme ?: "https"
                                val dataUri = parsed.data
                                if (dataUri != null) {
                                    dataUri.toString()
                                } else {
                                    val host = "www.google.com"
                                    val q = parsed.getStringExtra("q") ?: ""
                                    "$scheme://$host/maps?q=$q"
                                }
                            } else {
                                urlStr
                            }
                            val fallbackIntent = Intent(Intent.ACTION_VIEW, Uri.parse(cleanUrl)).apply {
                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            }
                            startActivity(fallbackIntent)
                            result.success("OK")
                        } catch (ex: Exception) {
                            result.error("ERROR", ex.localizedMessage, null)
                        }
                    }
                }
                "vibrate" -> {
                    val duration = (call.argument<Int>("duration") ?: 20).toLong()
                    try {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                            val vibratorManager = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? android.os.VibratorManager
                            val vibrator = vibratorManager?.defaultVibrator
                            vibrator?.vibrate(android.os.VibrationEffect.createOneShot(duration, android.os.VibrationEffect.DEFAULT_AMPLITUDE))
                        } else {
                            @Suppress("DEPRECATION")
                            val vibrator = getSystemService(Context.VIBRATOR_SERVICE) as? android.os.Vibrator
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                vibrator?.vibrate(android.os.VibrationEffect.createOneShot(duration, android.os.VibrationEffect.DEFAULT_AMPLITUDE))
                            } else {
                                @Suppress("DEPRECATION")
                                vibrator?.vibrate(duration)
                            }
                        }
                        result.success(true)
                    } catch (e: Exception) {
                        result.success(false)
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
        } else if (requestCode == PICK_DATA_FILE_REQ) {
            val cb = pendingDataFileResult
            pendingDataFileResult = null
            if (cb == null) return

            if (resultCode != Activity.RESULT_OK || data == null) {
                cb.success("")
                return
            }

            try {
                val uri = data.data
                if (uri == null) {
                    cb.success("")
                    return
                }

                var fileName = "tap_tin_toa_do"
                val cursor = contentResolver.query(uri, null, null, null, null)
                cursor?.use {
                    if (it.moveToFirst()) {
                        val nameIndex = it.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME)
                        if (nameIndex != -1) {
                            fileName = it.getString(nameIndex) ?: "tap_tin_toa_do"
                        }
                    }
                }

                val inputStream = contentResolver.openInputStream(uri)
                val bytes = inputStream?.readBytes() ?: ByteArray(0)
                inputStream?.close()

                val b64 = Base64.encodeToString(bytes, Base64.NO_WRAP)
                val obj = org.json.JSONObject().apply {
                    put("filename", fileName)
                    put("base64", b64)
                }
                cb.success(obj.toString())
            } catch (e: Exception) {
                cb.error("ERROR", e.localizedMessage, null)
            }
        }
    }

    private fun uriToBase64(uri: Uri): String? {
        return try {
            var inputStream = contentResolver.openInputStream(uri) ?: return null
            val options = BitmapFactory.Options().apply {
                inJustDecodeBounds = true
            }
            BitmapFactory.decodeStream(inputStream, null, options)
            inputStream.close()

            val origW = options.outWidth
            val origH = options.outHeight
            if (origW <= 0 || origH <= 0) return null

            val maxDim = 1600
            var sampleSize = 1
            while (origW / (sampleSize * 2) >= maxDim || origH / (sampleSize * 2) >= maxDim) {
                sampleSize *= 2
            }

            inputStream = contentResolver.openInputStream(uri) ?: return null
            val decodeOptions = BitmapFactory.Options().apply {
                inSampleSize = sampleSize
                inPreferredConfig = Bitmap.Config.ARGB_8888
            }
            val bitmap = BitmapFactory.decodeStream(inputStream, null, decodeOptions)
            inputStream.close()

            if (bitmap != null) {
                val currentMax = Math.max(bitmap.width, bitmap.height)
                val finalBitmap = if (currentMax > maxDim) {
                    val scale = maxDim.toFloat() / currentMax
                    val targetW = Math.max(1, (bitmap.width * scale).toInt())
                    val targetH = Math.max(1, (bitmap.height * scale).toInt())
                    val scaled = Bitmap.createScaledBitmap(bitmap, targetW, targetH, true)
                    if (scaled != bitmap) {
                        bitmap.recycle()
                    }
                    scaled
                } else {
                    bitmap
                }

                val stream = ByteArrayOutputStream()
                finalBitmap.compress(Bitmap.CompressFormat.JPEG, 85, stream)
                finalBitmap.recycle()
                val bytes = stream.toByteArray()
                "data:image/jpeg;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP)
            } else {
                null
            }
        } catch (e: Exception) {
            e.printStackTrace()
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

    private fun saveImageFileToPictures(file: File, filename: String): Boolean {
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
                    val outputStream = contentResolver.openOutputStream(uri)
                    if (outputStream != null) {
                        file.inputStream().use { input ->
                            outputStream.use { output ->
                                input.copyTo(output)
                            }
                        }

                        values.clear()
                        values.put(MediaStore.Images.Media.IS_PENDING, 0)
                        contentResolver.update(uri, values, null, null)
                        return true
                    }
                }
            } else {
                val picturesDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES)
                val appDir = File(picturesDir, "NetaLight")
                if (!appDir.exists()) {
                    appDir.mkdirs()
                }
                val imageFile = File(appDir, filename)
                file.inputStream().use { input ->
                    FileOutputStream(imageFile).use { output ->
                        input.copyTo(output)
                    }
                }

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
        }
        return false
    }

    private fun saveFilePathToDownloadsFolder(file: File, filename: String, mimeType: String): Boolean {
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
                    val outputStream = contentResolver.openOutputStream(uri)
                    if (outputStream != null) {
                        file.inputStream().use { input ->
                            outputStream.use { output ->
                                input.copyTo(output)
                            }
                        }

                        values.clear()
                        values.put(MediaStore.Downloads.IS_PENDING, 0)
                        contentResolver.update(uri, values, null, null)
                        return true
                    }
                }
            } else {
                val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                val appDir = File(downloadsDir, "NetaLight")
                if (!appDir.exists()) {
                    appDir.mkdirs()
                }
                val destFile = File(appDir, filename)
                file.inputStream().use { input ->
                    FileOutputStream(destFile).use { output ->
                        input.copyTo(output)
                    }
                }

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
        }
        return false
    }

    private fun startCompassSensors() {
        if (sensorManager == null) {
            sensorManager = getSystemService(Context.SENSOR_SERVICE) as? SensorManager
        }
        val sm = sensorManager ?: return

        // 1. Ưu tiên TYPE_ROTATION_VECTOR (Hợp nhất Con quay hồi chuyển + Từ kế + Gia tốc kế với bộ lọc Kalman phần cứng)
        val rot = sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
            ?: sm.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR)

        if (rot != null) {
            rotationSensor = rot
            sm.registerListener(compassListener, rot, SensorManager.SENSOR_DELAY_UI)
        } else {
            // 2. Dự phòng: Gia tốc kế + Từ kế (SensorManager.getRotationMatrix)
            val acc = sm.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
            val mag = sm.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)
            if (acc != null && mag != null) {
                accelerometerSensor = acc
                magnetometerSensor = mag
                sm.registerListener(compassListener, acc, SensorManager.SENSOR_DELAY_UI)
                sm.registerListener(compassListener, mag, SensorManager.SENSOR_DELAY_UI)
            }
        }
    }

    private fun stopCompassSensors() {
        sensorManager?.unregisterListener(compassListener)
        rotationSensor = null
        accelerometerSensor = null
        magnetometerSensor = null
        hasAccelerometer = false
        hasMagnetometer = false
        smoothedHeading = -1.0
    }

    override fun onDestroy() {
        stopCompassSensors()
        super.onDestroy()
    }
}
