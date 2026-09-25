import os

def update_view():
    for proj in [r'c:\Books\Neta Light', r'c:\Books\Neta Trio']:
        fpath = os.path.join(proj, 'modules', 'phap_hanh_view.js')
        with open(fpath, 'r', encoding='utf-8') as f:
            code = f.read()

        # 1. Update saveNewLesson
        old_save = '''    const title = titleInput.value.trim();
    if (!title) {
      alert('Vui lòng nhập tên bài học');
      titleInput.focus();
      return;
    }

    if (selectedImagesBase64.length === 0) {
      alert('Vui lòng chọn ít nhất 1 ảnh cho bài học');
      return;
    }'''

        new_save = '''    let title = titleInput.value.trim();
    if (!title) {
      const catName = catSelect.options[catSelect.selectedIndex].text;
      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      title = `[${catName}] Bài học ${timeStr}`;
    }

    if (selectedImagesBase64.length === 0) {
      showToast('⚠️ Vui lòng chụp hoặc chọn ít nhất 1 ảnh');
      return;
    }'''
        code = code.replace(old_save, new_save)

        # 2. Replace alerts with showToast in export/import/save
        code = code.replace("alert('Bạn chưa có bài học tự thêm nào để sao lưu.');", "showToast('ℹ️ Bạn chưa có bài học tự thêm nào để sao lưu');")
        code = code.replace("alert('Tệp sao lưu không hợp lệ.');", "showToast('⚠️ Tệp sao lưu không hợp lệ');")
        code = code.replace("alert('Lỗi lưu bài học: ' + err.message);", "showToast('⚠️ Lỗi: ' + err.message);")

        # 3. Add NativeBridge & Camera/Gallery handlers in bindEvents
        old_bind_input = '''    // Chọn ảnh
    const fileInput = document.getElementById('ph-input-file');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        handleFilesSelected(e.target.files);
      });
    }

    // Drag and drop ảnh
    const dropZone = document.getElementById('ph-drop-zone');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
      });
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFilesSelected(e.dataTransfer.files);
      });
    }'''

        new_bind_input = '''    // Cụm nút chọn ảnh thông minh (Mobile First: Camera & Thư viện ảnh)
    const btnCam = document.getElementById('ph-btn-trigger-cam');
    if (btnCam) {
      btnCam.addEventListener('click', (e) => {
        if (window.NativeBridge && typeof window.NativeBridge.postMessage === 'function') {
          e.preventDefault();
          window.NativeBridge.postMessage(JSON.stringify({ action: 'takePhoto' }));
        }
      });
    }

    const btnGal = document.getElementById('ph-btn-trigger-gal');
    if (btnGal) {
      btnGal.addEventListener('click', (e) => {
        if (window.NativeBridge && typeof window.NativeBridge.postMessage === 'function') {
          e.preventDefault();
          window.NativeBridge.postMessage(JSON.stringify({ action: 'pickImage' }));
        }
      });
    }

    // Lắng nghe kết quả từ Native Android Kotlin
    window._onNativeImagesReceived = function(images) {
      if (Array.isArray(images) && images.length > 0) {
        images.forEach(b64 => {
          if (b64 && b64.startsWith('data:image')) {
            selectedImagesBase64.push(b64);
          }
        });
        renderImagePreviews();
        showToast(`Đã thêm ${images.length} ảnh`);
      }
    };

    // Web Fallback: Input file lắng nghe sự kiện thay đổi
    const inputCam = document.getElementById('ph-input-cam');
    if (inputCam) {
      inputCam.addEventListener('change', (e) => {
        handleFilesSelected(e.target.files);
        inputCam.value = '';
      });
    }

    const fileInput = document.getElementById('ph-input-file');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        handleFilesSelected(e.target.files);
        fileInput.value = '';
      });
    }'''
        code = code.replace(old_bind_input, new_bind_input)

        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f'Updated {fpath}')

if __name__ == '__main__':
    update_view()
