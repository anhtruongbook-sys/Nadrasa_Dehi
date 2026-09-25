import os

fpath = r'c:\Books\Neta Light\mobile_app\android\app\src\main\kotlin\com\nadrasadehi\netalight\MainActivity.kt'
with open(fpath, 'r', encoding='utf-8') as f:
    code = f.read()

# Add imports
if 'import android.app.Activity' not in code:
    code = code.replace(
        'import android.Manifest',
        'import android.app.Activity\nimport android.graphics.Bitmap\nimport android.util.Base64\nimport org.json.JSONArray\nimport java.io.ByteArrayOutputStream\nimport android.Manifest'
    )

# Add constants
if 'PICK_IMAGE_REQ' not in code:
    code = code.replace(
        'private val LOCATION_REQ_CODE = 2001',
        'private val LOCATION_REQ_CODE = 2001\n    private val PICK_IMAGE_REQ = 4001\n    private val TAKE_PHOTO_REQ = 4002\n    private var pendingImageResult: MethodChannel.Result? = null'
    )

# Add method handlers
handlers = '''                "pickImage" -> {
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
                "checkLocationPermission" -> {'''

code = code.replace('"checkLocationPermission" -> {', handlers)

# Add onActivityResult & uriToBase64
act_result = '''    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
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

    override fun onRequestPermissionsResult'''

code = code.replace('    override fun onRequestPermissionsResult', act_result)

with open(fpath, 'w', encoding='utf-8') as f:
    f.write(code)

print('Updated Neta Light MainActivity.kt successfully!')
