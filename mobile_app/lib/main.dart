import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

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

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0xFF120104))
      ..clearCache()
      ..clearLocalStorage()
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
      )
      ..loadFlutterAsset('assets/www/index.html');
  }

  Future<void> _handleJavaScriptMessage(String messageText) async {
    try {
      final data = jsonDecode(messageText);
      if (data is Map && data['action'] == 'saveImage') {
        final String base64Str = data['base64'] ?? '';
        final String filename = data['filename'] ?? 'NetaLight_${DateTime.now().millisecondsSinceEpoch}.png';

        if (base64Str.isNotEmpty) {
          final cleanBase64 = base64Str.contains(',')
              ? base64Str.split(',')[1]
              : base64Str;
          final bytes = base64Decode(cleanBase64);

          final result = await _platform.invokeMethod<String>('saveImageToGallery', {
            'bytes': bytes,
            'filename': filename,
          });

          if (result == 'OK') {
            _controller.runJavaScript("if (typeof showToast === 'function') showToast('✨ Đã lưu ảnh vào Thư viện ảnh (Bộ sưu tập) của máy!');");
          } else {
            _controller.runJavaScript("if (typeof showToast === 'function') showToast('⚠️ Không thể lưu ảnh vào máy: $result');");
          }
        }
      }
    } catch (e) {
      debugPrint('Error saving image in NativeBridge: $e');
      _controller.runJavaScript("if (typeof showToast === 'function') showToast('⚠️ Lỗi khi lưu ảnh: $e');");
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
