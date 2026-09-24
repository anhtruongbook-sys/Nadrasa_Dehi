package com.nadrasadehi.netalight

import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStream

class MainActivity: FlutterActivity() {
    private val CHANNEL = "com.nadrasadehi.netalight/save_image"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            if (call.method == "saveImageToGallery") {
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
            } else if (call.method == "saveFileToDownloads") {
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
            } else {
                result.notImplemented()
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
