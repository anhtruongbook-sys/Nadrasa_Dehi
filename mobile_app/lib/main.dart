import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'package:webview_flutter_android/webview_flutter_android.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Color(0xFF1A0003),
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF1A0003),
    systemNavigationBarIconBrightness: Brightness.light,
  ));
  runApp(const NetaLightApp());
}

class NetaLightApp extends StatelessWidget {
  const NetaLightApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Neta Light',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        scaffoldBackgroundColor: const Color(0xFF120104),
      ),
      home: const NetaLightWebViewScreen(),
    );
  }
}

class NetaLightWebViewScreen extends StatefulWidget {
  const NetaLightWebViewScreen({super.key});

  @override
  State<NetaLightWebViewScreen> createState() => _NetaLightWebViewScreenState();
}

class _NetaLightWebViewScreenState extends State<NetaLightWebViewScreen> {
  late final WebViewController _controller;
  static const MethodChannel _platform = MethodChannel('com.nadrasadehi.netalight/save_image');
  static const EventChannel _compassChannel = EventChannel('com.nadrasadehi.netalight/compass_stream');
  StreamSubscription? _compassSub;
  final Map<String, List<String?>> _imageChunks = {};

  void _startCompass() {
    _compassSub?.cancel();
    _compassSub = _compassChannel.receiveBroadcastStream().listen((dynamic event) {
      if (event is Map) {
        final heading = event['heading'];
        final accuracy = event['accuracy'] ?? 3;
        _controller.runJavaScript("if (typeof window._onNativeCompassHeading === 'function') window._onNativeCompassHeading($heading, $accuracy);");
      }
    }, onError: (err) {
      debugPrint('Compass stream error: $err');
      _controller.runJavaScript("if (typeof window._onNativeCompassError === 'function') window._onNativeCompassError('$err');");
    });
  }

  void _stopCompass() {
    _compassSub?.cancel();
    _compassSub = null;
  }

  @override
  void dispose() {
    _stopCompass();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF120104))
      ..addJavaScriptChannel(
        'NativeBridge',
        onMessageReceived: (JavaScriptMessage message) {
          _handleJavaScriptMessage(message.message);
        },
      )
      ..setNavigationDelegate(
        NavigationDelegate(
          onWebResourceError: (error) {
            debugPrint('WebResourceError: ${error.description}');
          },
        ),
      );

    if (controller.platform is AndroidWebViewController) {
      final androidController = controller.platform as AndroidWebViewController;
      androidController.setGeolocationPermissionsPromptCallbacks(
        onShowPrompt: (request) async {
          return const GeolocationPermissionsResponse(allow: true, retain: true);
        },
      );
    }

    controller.loadFlutterAsset('assets/www/index.html');
    _controller = controller;

    // Proactively request location permission on launch
    _platform.invokeMethod('requestLocationPermission');
  }

  Future<void> _processAndSaveImage(String base64Str, String filename) async {
    try {
      final cleanBase64 = base64Str.contains(',')
          ? base64Str.split(',')[1]
          : base64Str;
      final bytes = base64Decode(cleanBase64);

      // Write bytes directly to temp file in system cache to avoid Flutter MethodChannel Binder IPC size limit (1MB)
      final tempFile = File('${Directory.systemTemp.path}/$filename');
      await tempFile.writeAsBytes(bytes, flush: true);

      final result = await _platform.invokeMethod<String>('saveImageFileToGallery', {
        'filePath': tempFile.path,
        'filename': filename,
      });

      if (result == 'OK') {
        _controller.runJavaScript("if (typeof showToast === 'function') showToast('✨ Đã lưu ảnh vào Thư viện ảnh (Bộ sưu tập) của máy!');");
      } else {
        _controller.runJavaScript("if (typeof showToast === 'function') showToast('⚠️ Không thể lưu ảnh vào máy: $result');");
      }
    } catch (e) {
      debugPrint('Error saving image: $e');
      _controller.runJavaScript("if (typeof showToast === 'function') showToast('⚠️ Lỗi lưu ảnh: $e');");
    }
  }

  Future<void> _processAndSaveFile(String base64Str, String filename, String mimeType) async {
    try {
      final cleanBase64 = base64Str.contains(',')
          ? base64Str.split(',')[1]
          : base64Str;
      final bytes = base64Decode(cleanBase64);

      final tempFile = File('${Directory.systemTemp.path}/$filename');
      await tempFile.writeAsBytes(bytes, flush: true);

      final result = await _platform.invokeMethod<String>('saveFilePathToDownloads', {
        'filePath': tempFile.path,
        'filename': filename,
        'mimeType': mimeType,
      });

      if (result == 'OK') {
        _controller.runJavaScript("if (typeof showToast === 'function') showToast('✅ Đã lưu tệp vào thư mục Tải về (Download/NetaLight) của máy!');");
      } else {
        _controller.runJavaScript("if (typeof showToast === 'function') showToast('⚠️ Không thể lưu tệp vào máy: $result');");
      }
    } catch (e) {
      debugPrint('Error saving file: $e');
      _controller.runJavaScript("if (typeof showToast === 'function') showToast('⚠️ Lỗi lưu tệp: $e');");
    }
  }

  Future<void> _handleJavaScriptMessage(String messageText) async {
    try {
      final data = jsonDecode(messageText);
      if (data is Map) {
        final action = data['action'];
        if (action == 'saveImageChunk') {
          final transferId = data['transferId'] as String? ?? 'default';
          final index = data['index'] as int? ?? 0;
          final total = data['total'] as int? ?? 1;
          final chunk = data['chunk'] as String? ?? '';
          final filename = data['filename'] as String? ?? 'NetaLight_${DateTime.now().millisecondsSinceEpoch}.png';

          if (!_imageChunks.containsKey(transferId)) {
            _imageChunks[transferId] = List.filled(total, null);
          }
          _imageChunks[transferId]![index] = chunk;

          if (_imageChunks[transferId]!.every((c) => c != null)) {
            final fullBase64 = _imageChunks[transferId]!.join('');
            _imageChunks.remove(transferId);
            await _processAndSaveImage(fullBase64, filename);
          }
        } else if (action == 'saveImage') {
          final String base64Str = data['base64'] ?? '';
          final String filename = data['filename'] ?? 'NetaLight_${DateTime.now().millisecondsSinceEpoch}.png';

          if (base64Str.isNotEmpty) {
            await _processAndSaveImage(base64Str, filename);
          }
        } else if (action == 'saveFile') {
          final String base64Str = data['base64'] ?? '';
          final String filename = data['filename'] ?? 'NetaLight_${DateTime.now().millisecondsSinceEpoch}.bin';
          final String mimeType = data['mimeType'] ?? 'application/octet-stream';

          if (base64Str.isNotEmpty) {
            await _processAndSaveFile(base64Str, filename, mimeType);
          }
        } else if (action == 'pickImage' || action == 'takePhoto') {
          try {
            final String? res = await _platform.invokeMethod<String>(action);
            if (res != null && res.isNotEmpty) {
              _controller.runJavaScript("if (typeof window._onNativeImagesReceived === 'function') window._onNativeImagesReceived($res);");
            }
          } catch (e) {
            debugPrint('Error in $action: $e');
            _controller.runJavaScript("if (typeof showToast === 'function') showToast('⚠️ Lỗi chọn ảnh: $e');");
          }
        } else if (action == 'pickFloorPlan') {
          try {
            final String? res = await _platform.invokeMethod<String>('pickImage');
            if (res != null && res.isNotEmpty) {
              _controller.runJavaScript("if (typeof window._onNativeFloorPlanReceived === 'function') window._onNativeFloorPlanReceived($res);");
            }
          } catch (e) {
            debugPrint('Error in pickFloorPlan: $e');
            _controller.runJavaScript("if (typeof showToast === 'function') showToast('⚠️ Lỗi chọn ảnh mặt bằng: $e');");
          }
        } else if (action == 'getLocation') {
          try {
            final locResult = await _platform.invokeMethod('getLocation');
            if (locResult is Map) {
              final lat = locResult['lat'];
              final lng = locResult['lng'];
              final accuracy = locResult['accuracy'] ?? 10;
              _controller.runJavaScript("if (typeof window._onNativeLocationReceived === 'function') window._onNativeLocationReceived($lat, $lng, $accuracy);");
            } else {
              _controller.runJavaScript("if (typeof window._onNativeLocationError === 'function') window._onNativeLocationError('Tọa độ không hợp lệ');");
            }
          } catch (e) {
            final errMsg = e.toString();
            _controller.runJavaScript("if (typeof window._onNativeLocationError === 'function') window._onNativeLocationError('$errMsg');");
          }
        } else if (action == 'openLocationSettings') {
          await _platform.invokeMethod('openLocationSettings');
        } else if (action == 'openAppSettings') {
          await _platform.invokeMethod('openAppSettings');
        } else if (action == 'startCompass') {
          _startCompass();
        } else if (action == 'stopCompass') {
          _stopCompass();
        } else if (action == 'haptic' || action == 'vibrate') {
          final int duration = data['duration'] ?? 20;
          try {
            if (duration <= 25) {
              HapticFeedback.lightImpact();
            } else if (duration <= 45) {
              HapticFeedback.mediumImpact();
            } else {
              HapticFeedback.heavyImpact();
            }
          } catch (_) {}
          try {
            _platform.invokeMethod('vibrate', {'duration': duration});
          } catch (_) {}
        }
      }
    } catch (e) {
      debugPrint('Error in NativeBridge: $e');
      _controller.runJavaScript("if (typeof showToast === 'function') showToast('⚠️ Lỗi: $e');");
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        if (await _controller.canGoBack()) {
          await _controller.goBack();
        } else {
          SystemNavigator.pop();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF120104),
        body: SafeArea(
          child: WebViewWidget(controller: _controller),
        ),
      ),
    );
  }
}
