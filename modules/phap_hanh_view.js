/**
 * MODULE PHÁP HÀNH NADRASA DEHI
 * Quản lý kho bài học, 18 Nơi Tại Phủ và tính năng thêm bài học/ảnh động (IndexedDB)
 */

const PhapHanhModule = (function() {
  const DB_NAME = 'NetaPhapHanhDB';
  const DB_VERSION = 1;
  const STORE_NAME = 'custom_lessons';

  let db = null;
  let customLessons = [];
  let currentFilter = 'all';
  let currentSearchQuery = '';
  let activeViewerIndex = 0;
  let currentFilteredList = [];

  // Viewer Zoom & Pan state
  let viewerScale = 1;
  let viewerTranslateX = 0;
  let viewerTranslateY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let initialPinchDistance = null;

  // 1. Khởi tạo IndexedDB
  function initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = function(e) {
        const database = e.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = function(e) {
        db = e.target.result;
        loadCustomLessons().then(resolve);
      };
      request.onerror = function(e) {
        console.error('Lỗi khởi tạo IndexedDB:', e);
        resolve(); // Vẫn tiếp tục nếu lỗi DB
      };
    });
  }

  // 2. Tải danh sách bài học tự thêm
  function loadCustomLessons() {
    return new Promise((resolve) => {
      if (!db) {
        customLessons = [];
        return resolve([]);
      }
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();
        req.onsuccess = function() {
          customLessons = req.result || [];
          resolve(customLessons);
        };
        req.onerror = function() {
          customLessons = [];
          resolve([]);
        };
      } catch (err) {
        console.error('Lỗi đọc custom lessons:', err);
        customLessons = [];
        resolve([]);
      }
    });
  }

  // 3. Lưu bài học mới hoặc cập nhật bài học tự thêm
  function saveCustomLesson(lesson) {
    return new Promise((resolve, reject) => {
      if (!db) return reject(new Error('Chưa mở CSDL'));
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(lesson);
      req.onsuccess = function() {
        loadCustomLessons().then(() => {
          renderLessons();
          resolve(lesson);
        });
      };
      req.onerror = function(err) {
        reject(err);
      };
    });
  }

  // 4. Xóa bài học tự thêm
  function deleteCustomLesson(id) {
    return new Promise((resolve, reject) => {
      if (!db) return reject(new Error('Chưa mở CSDL'));
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = function() {
        loadCustomLessons().then(() => {
          renderLessons();
          resolve();
        });
      };
      req.onerror = function(err) {
        reject(err);
      };
    });
  }

  // 5. Lấy danh sách hợp nhất (Builtin + Custom)
  function getAllLessons() {
    const builtins = (typeof PHAP_HANH_BUILTIN_LESSONS !== 'undefined') ? PHAP_HANH_BUILTIN_LESSONS : [];
    // Custom lessons xếp lên đầu để người dùng dễ theo dõi bài mới
    return [...customLessons, ...builtins];
  }

  // 5b. Widget Tọa Thiền Định Tâm Kỳ Môn (Real-Time Spiritual Qi Men Compass)
  function renderMeditationCompassWidget() {
    const container = document.getElementById('ph-meditation-widget');
    if (!container) return;

    if (!window.JoeyYapQMDJEngine || !window.JoeyYapQMDJEngine.getSpiritualMeditationGuide) {
      container.style.display = 'none';
      return;
    }

    const guide = window.JoeyYapQMDJEngine.getSpiritualMeditationGuide(new Date());
    if (!guide || !guide.sectors || guide.sectors.length === 0) {
      container.style.display = 'none';
      return;
    }

    const isCollapsed = localStorage.getItem('neta_ph_meditation_collapsed') === 'true';

    container.innerHTML = `
      <div class="ph-meditation-card ${isCollapsed ? 'collapsed' : ''}">
        <div class="ph-mc-header" id="ph-mc-header">
          <div class="ph-mc-title-wrap">
            <span class="ph-mc-icon">🧘</span>
            <div class="ph-mc-titles">
              <span class="ph-mc-title">TỌA THIỀN ĐỊNH TÂM KỲ MÔN</span>
              <span class="ph-mc-subtitle">Phương vị nạp khí tâm linh thời gian thực (Joey Yap Spiritual Qi Men)</span>
            </div>
          </div>
          <div class="ph-mc-meta">
            <span class="ph-mc-time-badge">⏰ ${guide.hourCanChi ? 'Giờ ' + guide.hourCanChi : ''} • Tiết ${guide.solarTerm || 'Chính'}</span>
            <button type="button" class="ph-mc-btn-toggle" id="btn-ph-mc-toggle" title="Thu gọn / Mở rộng bảng tọa thiền">
              ${isCollapsed ? '▼ Mở rộng' : '▲ Thu gọn'}
            </button>
          </div>
        </div>

        <div class="ph-mc-body" id="ph-mc-body" style="${isCollapsed ? 'display: none;' : ''}">
          <div class="ph-mc-sectors-grid">
            ${guide.sectors.map(s => `
              <div class="ph-mc-sector-card tag-${s.key}" data-deg="${s.center_deg}" data-dir="${s.direction}">
                <div class="ph-sc-top">
                  <span class="ph-sc-icon">${s.icon}</span>
                  <div class="ph-sc-naming">
                    <strong class="ph-sc-deity">${s.deity}</strong>
                    <span class="ph-sc-en">(${s.deity_en})</span>
                  </div>
                  <span class="ph-sc-tag">${s.tag}</span>
                </div>
                <div class="ph-sc-purpose">${s.purpose}</div>
                <div class="ph-sc-location">
                  Tọa Lưng (Back To): <strong>${s.direction}</strong> (${s.palace_name} • ${s.degrees})
                </div>
                <blockquote class="ph-sc-affirmation">"${s.affirmation}"</blockquote>
              </div>
            `).join('')}
          </div>

          <!-- Bottom Action Bar & 3-Step Practice Guide -->
          <div class="ph-mc-footer">
            <div class="ph-mc-steps">
              <div class="ph-step-item">
                <span class="ph-step-num">1</span>
                <span class="ph-step-txt"><strong>Định Vị (Align):</strong> Ngồi tĩnh tọa, xoay lưng tựa về phương vị của Thần bạn chọn.</span>
              </div>
              <div class="ph-step-item">
                <span class="ph-step-num">2</span>
                <span class="ph-step-txt"><strong>Phát Nguyện (Command):</strong> Khép nhẹ mi mắt, hít sâu 3 nhịp, khởi niệm khẩu quyết tâm thức.</span>
              </div>
              <div class="ph-step-item">
                <span class="ph-step-num">3</span>
                <span class="ph-step-txt"><strong>Kết Nối (Connect):</strong> Giữ tâm trí rỗng rang 15 - 30 phút, cảm nhận luồng sinh khí thanh tịnh.</span>
              </div>
            </div>

            <div class="ph-mc-action">
              <button type="button" class="ph-btn-open-lakinh" id="btn-ph-open-lakinh" title="Mở La Kinh xoay điện thoại canh góc tọa thiền chính xác">
                🧭 Mở La Kinh Xoay Hướng Tọa Thiền
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Gắn sự kiện Toggle Collapse
    const btnToggle = container.querySelector('#btn-ph-mc-toggle');
    const mcBody = container.querySelector('#ph-mc-body');
    const mcCard = container.querySelector('.ph-meditation-card');
    if (btnToggle && mcBody && mcCard) {
      btnToggle.onclick = (e) => {
        e.stopPropagation();
        const currentlyHidden = mcBody.style.display === 'none';
        if (currentlyHidden) {
          mcBody.style.display = '';
          mcCard.classList.remove('collapsed');
          btnToggle.textContent = '▲ Thu gọn';
          localStorage.setItem('neta_ph_meditation_collapsed', 'false');
        } else {
          mcBody.style.display = 'none';
          mcCard.classList.add('collapsed');
          btnToggle.textContent = '▼ Mở rộng';
          localStorage.setItem('neta_ph_meditation_collapsed', 'true');
        }
      };
    }

    // Gắn sự kiện click mở La Kinh
    const btnLakinh = container.querySelector('#btn-ph-open-lakinh');
    if (btnLakinh) {
      btnLakinh.onclick = () => {
        if (typeof window.switchAppMode === 'function') {
          window.switchAppMode('lakinh');
        } else {
          const tabLakinh = document.getElementById('tab-mode-lakinh');
          if (tabLakinh) tabLakinh.click();
        }
      };
    }
  }

  // 6. Render giao diện bộ lọc danh mục
  function renderCategoryChips() {
    const container = document.getElementById('ph-category-chips');
    if (!container) return;

    const categories = (typeof PHAP_HANH_CATEGORIES !== 'undefined') ? PHAP_HANH_CATEGORIES : [
      { id: 'all', name: 'Tất cả' }
    ];

    container.innerHTML = categories.map(cat => {
      const activeClass = (cat.id === currentFilter) ? 'active' : '';
      return `<button class="ph-chip-btn ${activeClass}" data-cat="${cat.id}">${cat.name}</button>`;
    }).join('');

    container.querySelectorAll('.ph-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.cat;
        container.querySelectorAll('.ph-chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderLessons();
      });
    });
  }

  // 7. Lọc và hiển thị danh sách bài học
  function renderLessons() {
    const grid = document.getElementById('ph-lessons-grid');
    const emptyState = document.getElementById('ph-empty-state');
    const countBadge = document.getElementById('ph-lessons-count');
    if (!grid) return;

    renderMeditationCompassWidget();

    const all = getAllLessons();
    const query = currentSearchQuery.trim().toLowerCase();

    currentFilteredList = all.filter(item => {
      // Lọc danh mục
      if (currentFilter !== 'all') {
        if (currentFilter === 'custom') {
          if (!item.isCustom) return false;
        } else if (item.category !== currentFilter) {
          return false;
        }
      }
      // Lọc từ khóa tìm kiếm
      if (query) {
        const titleMatch = item.title && item.title.toLowerCase().includes(query);
        const catMatch = item.categoryName && item.categoryName.toLowerCase().includes(query);
        const notesMatch = item.notes && item.notes.toLowerCase().includes(query);
        if (!titleMatch && !catMatch && !notesMatch) return false;
      }
      return true;
    });

    if (countBadge) {
      countBadge.textContent = `${currentFilteredList.length} bài học`;
    }

    if (currentFilteredList.length === 0) {
      grid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    grid.style.display = 'grid';

    grid.innerHTML = currentFilteredList.map((item, idx) => {
      const isCustom = !!item.isCustom;
      let displayImg = item.image;
      if (isCustom) {
        displayImg = (item.images && item.images[0]) ? item.images[0] : item.image;
      } else if (typeof window !== 'undefined' && window.PHAP_HANH_BASE64_DATA) {
        const fname = item.image ? item.image.split('/').pop() : '';
        displayImg = window.PHAP_HANH_BASE64_DATA[item.image] || window.PHAP_HANH_BASE64_DATA[fname] || item.image;
      }
      const multipleBadge = (isCustom && item.images && item.images.length > 1) 
        ? `<span class="ph-multiple-badge">📷 ${item.images.length} ảnh</span>` 
        : '';

      return `
        <div class="ph-card" data-index="${idx}">
          <div class="ph-card-thumb-wrap">
            <img src="${displayImg}" alt="${item.title}" class="ph-card-img" />
            <span class="ph-category-badge ${isCustom ? 'badge-custom' : ''}">${item.categoryName || 'Bài học'}</span>
            ${multipleBadge}
          </div>
          <div class="ph-card-content">
            <h3 class="ph-card-title">${item.title}</h3>
            ${item.notes ? `<p class="ph-card-notes">${escapeHtml(item.notes)}</p>` : ''}
          </div>
          ${isCustom ? `
            <div class="ph-card-actions" onclick="event.stopPropagation()">
              <button class="ph-btn-card-del" data-id="${item.id}" title="Xóa bài học">🗑️</button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Bắt sự kiện click vào card để mở Fullscreen Viewer
    grid.querySelectorAll('.ph-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.index, 10);
        openViewer(idx);
      });
    });

    // Bắt sự kiện xóa bài học tự thêm
    grid.querySelectorAll('.ph-btn-card-del').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (confirm('Bạn có chắc chắn muốn xóa bài học này khỏi ứng dụng không?')) {
          deleteCustomLesson(id).then(() => {
            showToast('Đã xóa bài học thành công');
          });
        }
      });
    });
  }

  // 8. Trình xem ảnh toàn màn hình HD (Viewer Lightbox)
  function openViewer(index) {
    if (!currentFilteredList || currentFilteredList.length === 0) return;
    if (index < 0) index = 0;
    if (index >= currentFilteredList.length) index = currentFilteredList.length - 1;

    activeViewerIndex = index;
    const item = currentFilteredList[activeViewerIndex];
    const modal = document.getElementById('ph-viewer-modal');
    if (!modal) return;

    resetZoom();
    updateViewerContent(item);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function updateViewerContent(item) {
    const titleEl = document.getElementById('ph-viewer-title');
    const catEl = document.getElementById('ph-viewer-cat');
    const counterEl = document.getElementById('ph-viewer-counter');
    const imgEl = document.getElementById('ph-viewer-img');
    const notesEl = document.getElementById('ph-viewer-notes');

    const displayImg = item.isCustom ? (item.images && item.images[0] ? item.images[0] : item.image) : item.image;

    if (titleEl) titleEl.textContent = item.title;
    if (catEl) catEl.textContent = item.categoryName || '';
    if (counterEl) counterEl.textContent = `${activeViewerIndex + 1} / ${currentFilteredList.length}`;
    if (imgEl) {
      imgEl.src = displayImg;
      imgEl.alt = item.title;
    }
    if (notesEl) {
      if (item.notes) {
        notesEl.textContent = item.notes;
        notesEl.style.display = 'block';
      } else {
        notesEl.style.display = 'none';
      }
    }
  }

  function closeViewer() {
    const modal = document.getElementById('ph-viewer-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
    resetZoom();
  }

  function prevViewer() {
    if (activeViewerIndex > 0) {
      resetZoom();
      activeViewerIndex--;
      updateViewerContent(currentFilteredList[activeViewerIndex]);
    }
  }

  function nextViewer() {
    if (activeViewerIndex < currentFilteredList.length - 1) {
      resetZoom();
      activeViewerIndex++;
      updateViewerContent(currentFilteredList[activeViewerIndex]);
    }
  }

  function resetZoom() {
    viewerScale = 1;
    viewerTranslateX = 0;
    viewerTranslateY = 0;
    applyViewerTransform();
  }

  function zoomIn() {
    viewerScale = Math.min(viewerScale + 0.3, 4.0);
    applyViewerTransform();
  }

  function zoomOut() {
    viewerScale = Math.max(viewerScale - 0.3, 0.8);
    if (viewerScale <= 1) {
      viewerTranslateX = 0;
      viewerTranslateY = 0;
    }
    applyViewerTransform();
  }

  function applyViewerTransform() {
    const img = document.getElementById('ph-viewer-img');
    if (img) {
      img.style.transform = `translate(${viewerTranslateX}px, ${viewerTranslateY}px) scale(${viewerScale})`;
      img.style.cursor = (viewerScale > 1) ? 'grab' : 'zoom-in';
    }
  }

  // 9. Modal Thêm bài học mới
  let selectedImagesBase64 = [];

  function openAddModal() {
    const modal = document.getElementById('ph-add-modal');
    if (!modal) return;

    selectedImagesBase64 = [];
    document.getElementById('ph-input-title').value = '';
    document.getElementById('ph-input-notes').value = '';
    document.getElementById('ph-input-file').value = '';
    document.getElementById('ph-selected-cat').value = 'thu_phap';
    document.getElementById('ph-input-custom-cat').value = '';
    document.getElementById('ph-custom-cat-wrap').style.display = 'none';
    renderImagePreviews();

    modal.classList.add('active');
  }

  function closeAddModal() {
    const modal = document.getElementById('ph-add-modal');
    if (modal) modal.classList.remove('active');
    selectedImagesBase64 = [];
  }

  function renderImagePreviews() {
    const previewContainer = document.getElementById('ph-image-previews');
    if (!previewContainer) return;

    if (selectedImagesBase64.length === 0) {
      previewContainer.innerHTML = '<span class="ph-no-image-text">Chưa chọn ảnh nào</span>';
      return;
    }

    previewContainer.innerHTML = selectedImagesBase64.map((src, idx) => `
      <div class="ph-preview-thumb-wrap">
        <img src="${src}" alt="Ảnh xem trước ${idx+1}" class="ph-preview-thumb" />
        <button type="button" class="ph-btn-del-thumb" data-index="${idx}">×</button>
      </div>
    `).join('');

    previewContainer.querySelectorAll('.ph-btn-del-thumb').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        selectedImagesBase64.splice(idx, 1);
        renderImagePreviews();
      });
    });
  }

  // Xử lý nạp ảnh từ File Input
  function handleFilesSelected(files) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        selectedImagesBase64.push(e.target.result);
        renderImagePreviews();
      };
      reader.readAsDataURL(file);
    });
  }

  function saveNewLesson() {
    const titleInput = document.getElementById('ph-input-title');
    const notesInput = document.getElementById('ph-input-notes');
    const catSelect = document.getElementById('ph-selected-cat');
    const customCatInput = document.getElementById('ph-input-custom-cat');

    let title = titleInput.value.trim();
    if (!title) {
      const catName = catSelect.options[catSelect.selectedIndex].text;
      const now = new Date();
      const timeStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      title = `[${catName}] Bài học ${timeStr}`;
    }

    if (selectedImagesBase64.length === 0) {
      showToast('⚠️ Vui lòng chụp hoặc chọn ít nhất 1 ảnh');
      return;
    }

    let category = catSelect.value;
    let categoryName = catSelect.options[catSelect.selectedIndex].text;

    if (category === 'other') {
      const customName = customCatInput.value.trim();
      category = 'custom_' + Date.now();
      categoryName = customName || 'Khác';
    }

    const newLesson = {
      id: 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      title: title,
      category: category,
      categoryName: categoryName,
      images: selectedImagesBase64,
      image: selectedImagesBase64[0],
      notes: notesInput.value.trim(),
      createdAt: new Date().toISOString(),
      isCustom: true
    };

    saveCustomLesson(newLesson).then(() => {
      closeAddModal();
      showToast('Đã lưu bài học mới thành công!');
    }).catch(err => {
      console.error(err);
      showToast('⚠️ Lỗi: ' + err.message);
    });
  }

  // 10. Sao lưu & Phục hồi dữ liệu cá nhân (Backup & Restore)
  function exportBackup() {
    if (customLessons.length === 0) {
      showToast('ℹ️ Bạn chưa có bài học tự thêm nào để sao lưu');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(customLessons, null, 2));
    const dlAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `phap_hanh_backup_${dateStr}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    showToast('Đã xuất file sao lưu bài học');
  }

  function importBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) {
          showToast('⚠️ Tệp sao lưu không hợp lệ');
          return;
        }
        let count = 0;
        const promises = imported.map(item => {
          if (item && item.id && item.title) {
            count++;
            return saveCustomLesson(item);
          }
          return Promise.resolve();
        });

        Promise.all(promises).then(() => {
          showToast(`Đã phục hồi thành công ${count} bài học!`);
        });
      } catch (err) {
        alert('Lỗi giải mã tệp JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // Tiện ích hiển thị Toast
  function showToast(msg) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  }

  // 11. Khởi tạo toàn bộ sự kiện của Module
  function init() {
    renderMeditationCompassWidget();

    initDB().then(() => {
      renderCategoryChips();
      renderLessons();
    });

    // Ô tìm kiếm với Debounce tối ưu hiệu năng (tránh re-render dồn dập khi gõ phím)
    const searchInput = document.getElementById('ph-search-input');
    if (searchInput) {
      let debounceTimer = null;
      searchInput.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          renderLessons();
        }, 120);
      });
    }

    // Nút mở modal thêm bài học
    const btnAdd = document.getElementById('btn-ph-add-lesson');
    if (btnAdd) btnAdd.addEventListener('click', openAddModal);

    const btnCloseAdd = document.getElementById('ph-modal-close-add');
    if (btnCloseAdd) btnCloseAdd.addEventListener('click', closeAddModal);

    const btnCancelAdd = document.getElementById('ph-modal-cancel-add');
    if (btnCancelAdd) btnCancelAdd.addEventListener('click', closeAddModal);

    const btnSaveAdd = document.getElementById('ph-modal-save-add');
    if (btnSaveAdd) btnSaveAdd.addEventListener('click', saveNewLesson);

    // Xử lý chọn danh mục có thêm tùy chọn "Khác"
    const catSelect = document.getElementById('ph-selected-cat');
    const customCatWrap = document.getElementById('ph-custom-cat-wrap');
    if (catSelect && customCatWrap) {
      catSelect.addEventListener('change', () => {
        customCatWrap.style.display = (catSelect.value === 'other') ? 'block' : 'none';
      });
    }

    // Cụm nút chọn ảnh thông minh (Mobile First: Camera & Thư viện ảnh)
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
    }

    // Nút sao lưu & phục hồi
    const btnExport = document.getElementById('btn-ph-export');
    if (btnExport) btnExport.addEventListener('click', exportBackup);

    const btnImport = document.getElementById('btn-ph-import');
    const importFileInput = document.getElementById('ph-input-import-file');
    if (btnImport && importFileInput) {
      btnImport.addEventListener('click', () => importFileInput.click());
      importFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importBackup(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    // Sự kiện trong Fullscreen Viewer
    const btnViewerClose = document.getElementById('ph-viewer-close');
    if (btnViewerClose) btnViewerClose.addEventListener('click', closeViewer);

    const btnViewerPrev = document.getElementById('ph-viewer-prev');
    if (btnViewerPrev) btnViewerPrev.addEventListener('click', prevViewer);

    const btnViewerNext = document.getElementById('ph-viewer-next');
    if (btnViewerNext) btnViewerNext.addEventListener('click', nextViewer);

    const btnZoomIn = document.getElementById('ph-viewer-zoom-in');
    if (btnZoomIn) btnZoomIn.addEventListener('click', zoomIn);

    const btnZoomOut = document.getElementById('ph-viewer-zoom-out');
    if (btnZoomOut) btnZoomOut.addEventListener('click', zoomOut);

    const btnZoomReset = document.getElementById('ph-viewer-zoom-reset');
    if (btnZoomReset) btnZoomReset.addEventListener('click', resetZoom);

    // Kéo thả ảnh khi đã phóng to
    const viewerStage = document.getElementById('ph-viewer-stage');
    if (viewerStage) {
      viewerStage.addEventListener('mousedown', (e) => {
        if (viewerScale <= 1) return;
        isDragging = true;
        dragStartX = e.clientX - viewerTranslateX;
        dragStartY = e.clientY - viewerTranslateY;
        const img = document.getElementById('ph-viewer-img');
        if (img) img.style.cursor = 'grabbing';
      });

      window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        viewerTranslateX = e.clientX - dragStartX;
        viewerTranslateY = e.clientY - dragStartY;
        applyViewerTransform();
      });

      window.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          const img = document.getElementById('ph-viewer-img');
          if (img) img.style.cursor = (viewerScale > 1) ? 'grab' : 'zoom-in';
        }
      });

      // Lăn chuột phóng to/thu nhỏ
      viewerStage.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
          zoomIn();
        } else {
          zoomOut();
        }
      }, { passive: false });

      // Double click phóng to / trở lại
      viewerStage.addEventListener('dblclick', () => {
        if (viewerScale > 1) {
          resetZoom();
        } else {
          viewerScale = 2.0;
          applyViewerTransform();
        }
      });

      // Hỗ trợ Touch trên thiết bị di động (Pinch-to-zoom & Drag)
      viewerStage.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          initialPinchDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
        } else if (e.touches.length === 1 && viewerScale > 1) {
          isDragging = true;
          dragStartX = e.touches[0].clientX - viewerTranslateX;
          dragStartY = e.touches[0].clientY - viewerTranslateY;
        }
      });

      viewerStage.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialPinchDistance) {
          if (e.cancelable) e.preventDefault();
          const currentDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          const ratio = currentDistance / initialPinchDistance;
          viewerScale = Math.min(Math.max(viewerScale * ratio, 0.8), 4.0);
          initialPinchDistance = currentDistance;
          applyViewerTransform();
        } else if (e.touches.length === 1 && isDragging) {
          if (e.cancelable) e.preventDefault();
          viewerTranslateX = e.touches[0].clientX - dragStartX;
          viewerTranslateY = e.touches[0].clientY - dragStartY;
          applyViewerTransform();
        }
      }, { passive: false });

      viewerStage.addEventListener('touchend', (e) => {
        if (e.touches.length < 2) initialPinchDistance = null;
        if (e.touches.length === 0) isDragging = false;
      });
    }

    // Điều hướng bàn phím (Mũi tên trái/phải/Escape)
    window.addEventListener('keydown', (e) => {
      const modal = document.getElementById('ph-viewer-modal');
      if (modal && modal.classList.contains('active')) {
        if (e.key === 'Escape') closeViewer();
        if (e.key === 'ArrowLeft') prevViewer();
        if (e.key === 'ArrowRight') nextViewer();
      }
    });
  }

  return {
    init: init,
    openViewer: openViewer,
    renderLessons: renderLessons,
    getAllLessons: getAllLessons,
    renderMeditationCompassWidget: renderMeditationCompassWidget
  };
})();

if (typeof window !== 'undefined') {
  window.PhapHanhModule = PhapHanhModule;
}

