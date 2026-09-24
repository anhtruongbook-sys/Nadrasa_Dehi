import os
import re

print("Starting Phase 3 Step 2: Templates & Modals & Event Bindings...")

tarot_view_path = r"c:\Books\Neta Light\modules\tarot_view.js"
with open(tarot_view_path, "r", encoding="utf-8") as f:
    code = f.read()

# 1. Replace renderEncyclopediaSubView
ency_pattern = r"(function renderEncyclopediaSubView\(\) \{[\s\S]*?function renderJournalSubView\(\) \{)"

new_ency = """function renderEncyclopediaSubView() {
    const engine = global.NetaTarotEngine;
    if (!engine) return '';
    const allCards = engine.getAllCardsList();

    const filtered = allCards.filter(c => {
      // Suit / Arcana Filter
      if (encyFilter === 'Major' && c.arcana !== 'Major') return false;
      if (encyFilter === 'Cups' && !c.id.startsWith('Cups')) return false;
      if (encyFilter === 'Pentacles' && !c.id.startsWith('Pentacles')) return false;
      if (encyFilter === 'Swords' && !c.id.startsWith('Swords')) return false;
      if (encyFilter === 'Wands' && !c.id.startsWith('Wands')) return false;

      // Class Filter (Court vs Pips)
      if (encyClassFilter === 'court') {
        const isCourt = c.id.includes('Page') || c.id.includes('Knight') || c.id.includes('Queen') || c.id.includes('King');
        if (!isCourt) return false;
      } else if (encyClassFilter === 'pips') {
        const isCourt = c.id.includes('Page') || c.id.includes('Knight') || c.id.includes('Queen') || c.id.includes('King');
        if (c.arcana === 'Major' || isCourt) return false;
      }

      // Search query
      if (encySearchQuery) {
        const q = encySearchQuery.toLowerCase().trim();
        const matchNameVi = c.name_vi.toLowerCase().includes(q);
        const matchNameEn = c.name_en.toLowerCase().includes(q);
        const matchKeywords = (c.keywords_up + ' ' + c.keywords_rev).toLowerCase().includes(q);
        return matchNameVi || matchNameEn || matchKeywords;
      }
      return true;
    });

    return `
      <div class="tarot-encyclopedia-workspace">
        <div class="tarot-ency-filter-bar">
          <div class="tarot-ency-search">
            <input type="text" id="tarot-ency-search-input" placeholder="🔍 Tìm theo tên hoặc từ khóa (ví dụ: Kẻ Khờ, The Fool, Cups, Ách, Tình cảm...)" value="${escapeHTML(encySearchQuery)}">
          </div>
          <div class="tarot-ency-tabs">
            <button class="ency-filter-btn ${encyFilter === 'all' ? 'active' : ''}" data-filter="all">Tất cả (78)</button>
            <button class="ency-filter-btn ${encyFilter === 'Major' ? 'active' : ''}" data-filter="Major">Ẩn chính (22)</button>
            <button class="ency-filter-btn ${encyFilter === 'Cups' ? 'active' : ''}" data-filter="Cups">Cốc (Cups - 14)</button>
            <button class="ency-filter-btn ${encyFilter === 'Pentacles' ? 'active' : ''}" data-filter="Pentacles">Tiền (Pentacles - 14)</button>
            <button class="ency-filter-btn ${encyFilter === 'Swords' ? 'active' : ''}" data-filter="Swords">Kiếm (Swords - 14)</button>
            <button class="ency-filter-btn ${encyFilter === 'Wands' ? 'active' : ''}" data-filter="Wands">Gậy (Wands - 14)</button>
          </div>
          <div class="tarot-ency-subfilters">
            <span class="subfilter-label">Phân cấp:</span>
            <button class="ency-class-btn ${encyClassFilter === 'all' ? 'active' : ''}" data-class="all">Toàn bộ</button>
            <button class="ency-class-btn ${encyClassFilter === 'court' ? 'active' : ''}" data-class="court">👑 Hoàng gia (Court - 16)</button>
            <button class="ency-class-btn ${encyClassFilter === 'pips' ? 'active' : ''}" data-class="pips">🔢 Lá số (Pips 1-10 - 40)</button>
            <span class="ency-count-badge">Hiển thị: <strong>${filtered.length}</strong> lá</span>
          </div>
        </div>

        <div class="tarot-ency-grid">
          ${filtered.map(c => {
            const meta = getCardMetadata(c);
            return `
              <div class="tarot-ency-card-item" data-id="${c.id}">
                <div class="ency-card-img-wrap">
                  <img src="assets/tarot/${c.id}.webp" alt="${c.name_vi}" loading="lazy">
                </div>
                <div class="ency-card-info">
                  <div class="ency-card-name-vi">${c.name_vi}</div>
                  <div class="ency-card-name-en">${c.name_en}</div>
                  <div class="ency-card-tags">
                    <span class="ency-tag">${c.arcana}</span>
                    <span class="ency-tag">${c.element}</span>
                  </div>
                  <div class="ency-card-astro-hint">${meta ? meta.astro : ''}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderJournalSubView() {"""

code = re.sub(ency_pattern, new_ency, code, count=1)
print("[1] Updated renderEncyclopediaSubView.")

# 2. Replace renderJournalSubView
journal_pattern = r"(function renderJournalSubView\(\) \{[\s\S]*?function bindTarotEvents\(container\) \{)"

new_journal = """function renderJournalSubView() {
    const list = getJournal();
    const stats = computeJournalStats();

    if (list.length === 0) {
      return `
        <div class="tarot-journal-empty">
          <div class="journal-empty-icon">📔</div>
          <h3>Chưa có bản ghi nhật ký nào</h3>
          <p>Khi bạn thực hiện trải bài và bấm <strong>💾 Lưu Vào Nhật Ký</strong>, kết quả chiêm nghiệm sẽ được lưu trữ cục bộ bảo mật 100% tại đây.</p>
          <div class="journal-empty-actions">
            <button id="btn-tarot-import-json-empty" class="tarot-btn-secondary">📥 Khôi Phục Từ Tệp JSON</button>
            <input type="file" id="tarot-journal-file-input" accept=".json" style="display: none;">
          </div>
        </div>
      `;
    }

    // Filter list by domain & search
    const filteredList = list.filter(entry => {
      if (journalFilterDomain !== 'all' && entry.domain !== journalFilterDomain) return false;
      if (journalSearchQuery) {
        const q = journalSearchQuery.toLowerCase().trim();
        const matchQ = (entry.question || '').toLowerCase().includes(q);
        const matchNote = (entry.reflectionNote || '').toLowerCase().includes(q);
        const matchSpread = (entry.spreadName || '').toLowerCase().includes(q);
        return matchQ || matchNote || matchSpread;
      }
      return true;
    });

    const statusMap = {
      studying: { label: '⏳ Đang chiêm nghiệm', color: '#f59e0b' },
      manifested: { label: '✅ Đã ứng nghiệm', color: '#10b981' },
      lesson: { label: '💡 Bài học sâu sắc', color: '#8b5cf6' }
    };

    return `
      <div class="tarot-journal-workspace">
        <!-- STATS & INSIGHTS CARD (PHASE 3) -->
        ${stats ? `
          <div class="tarot-journal-stats-card">
            <div class="stats-card-header">
              <span class="stats-icon">📊</span>
              <h4>Thống Kê Tần Suất & Năng Lượng Tâm Thức</h4>
            </div>
            <div class="stats-summary-grid">
              <div class="stat-box">
                <div class="stat-number">${stats.totalReadings}</div>
                <div class="stat-label">Lần trải bài</div>
              </div>
              <div class="stat-box dominant-energy-box">
                <div class="stat-subhead">Dòng năng lượng chủ đạo:</div>
                <div class="stat-dominant-title">${stats.dominantSuitDesc}</div>
              </div>
            </div>
            ${stats.topCards.length > 0 ? `
              <div class="stats-top-cards-row">
                <span class="top-cards-label">Lá bài xuất hiện nhiều nhất:</span>
                <div class="top-cards-pills">
                  ${stats.topCards.map(tc => `
                    <div class="top-card-pill" data-id="${tc.cardId}">
                      <img src="assets/tarot/${tc.cardId}.webp" alt="${tc.nameVi}">
                      <span>${tc.nameVi} (<strong>${tc.count}</strong> lần)</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Top Tools & Filter Bar -->
        <div class="tarot-journal-header">
          <div class="journal-title-box">
            <h3>Nhật Ký Chiêm Nghiệm (${filteredList.length}/${list.length} bản ghi)</h3>
            <span class="journal-subtitle">Lưu trữ cục bộ bảo mật 100% trên thiết bị</span>
          </div>
          <div class="journal-tools-bar">
            <button id="btn-tarot-export-json" class="tarot-btn-subtle" title="Tải tệp sao lưu JSON về máy">
              📤 Sao Lưu JSON
            </button>
            <button id="btn-tarot-import-json" class="tarot-btn-subtle" title="Khôi phục nhật ký từ tệp JSON">
              📥 Khôi Phục
            </button>
            <input type="file" id="tarot-journal-file-input" accept=".json" style="display: none;">
            <button id="btn-tarot-clear-journal" class="tarot-btn-ghost danger" title="Xóa toàn bộ nhật ký">
              🗑️ Xóa Hết
            </button>
          </div>
        </div>

        <div class="tarot-journal-filters-row">
          <div class="journal-search-wrap">
            <input type="text" id="tarot-journal-search-input" placeholder="🔍 Tìm theo câu hỏi hoặc ghi chú..." value="${escapeHTML(journalSearchQuery)}">
          </div>
          <div class="journal-domain-tabs">
            <button class="journal-domain-btn ${journalFilterDomain === 'all' ? 'active' : ''}" data-domain="all">Tất cả</button>
            <button class="journal-domain-btn ${journalFilterDomain === 'general' ? 'active' : ''}" data-domain="general">🌟 Tổng quan</button>
            <button class="journal-domain-btn ${journalFilterDomain === 'career' ? 'active' : ''}" data-domain="career">💼 Công việc</button>
            <button class="journal-domain-btn ${journalFilterDomain === 'love' ? 'active' : ''}" data-domain="love">❤️ Tình cảm</button>
          </div>
        </div>

        <!-- Journal Entries List -->
        <div class="tarot-journal-list">
          ${filteredList.map(entry => {
            const currentRating = entry.rating || 0;
            const currentStatus = entry.manifestStatus || 'studying';
            const statusInfo = statusMap[currentStatus] || statusMap.studying;

            return `
              <div class="tarot-journal-item" data-id="${entry.id}">
                <div class="journal-item-head">
                  <div class="journal-item-date">📅 ${entry.timestamp}</div>
                  <div class="journal-item-badges">
                    <span class="journal-badge">${entry.spreadName}</span>
                    <span class="journal-badge domain-${entry.domain}">${entry.domain.toUpperCase()}</span>
                    <span class="journal-badge status-tag" style="border-color: ${statusInfo.color}; color: ${statusInfo.color};">${statusInfo.label}</span>
                  </div>
                  <button class="btn-delete-entry" data-id="${entry.id}" title="Xóa bản ghi này">✕</button>
                </div>

                <div class="journal-item-question">
                  <strong>Hỏi:</strong> ${escapeHTML(entry.question || 'Chiêm nghiệm tổng quan')}
                </div>

                <div class="journal-item-cards-row">
                  ${(entry.drawnCards || []).map(c => {
                    const cardData = global.NetaTarotEngine.getCard(c.cardId);
                    return `
                      <div class="journal-mini-card" data-id="${c.cardId}">
                        <img src="assets/tarot/${c.cardId}.webp" alt="${cardData ? cardData.name_vi : ''}" class="${c.isUpright ? '' : 'is-reversed'}">
                        <div class="mini-name">${cardData ? cardData.name_vi : c.cardId}</div>
                        <div class="mini-orient">${c.isUpright ? 'Xuôi' : 'Ngược'}</div>
                      </div>
                    `;
                  }).join('')}
                </div>

                <div class="journal-item-advice">
                  <strong>Lời khuyên:</strong> ${entry.finalAdvice}
                </div>

                <!-- PERSONAL REFLECTION SECTION (PHASE 3) -->
                <div class="journal-reflection-container" id="reflection-wrap-${entry.id}">
                  <div class="reflection-meta-row">
                    <div class="reflection-stars" data-id="${entry.id}">
                      <span class="stars-label">Độ ứng nghiệm:</span>
                      ${[1, 2, 3, 4, 5].map(star => `
                        <button class="star-btn ${star <= currentRating ? 'filled' : ''}" data-star="${star}" data-id="${entry.id}">⭐</button>
                      `).join('')}
                    </div>
                    <button class="btn-toggle-edit-reflection" data-id="${entry.id}">
                      ✏️ ${entry.reflectionNote ? 'Sửa Ghi Chú' : 'Viết Phản Tư'}
                    </button>
                  </div>

                  <div class="reflection-display-box" id="reflection-display-${entry.id}">
                    ${entry.reflectionNote ? `
                      <div class="reflection-note-quote">
                        <strong>📝 Phản tư cá nhân:</strong>
                        <p>${escapeHTML(entry.reflectionNote)}</p>
                      </div>
                    ` : `
                      <div class="reflection-note-empty">
                        <em>Chưa có ghi chú phản tư. Chạm "Viết Phản Tư" để ghi lại diễn biến thực tế sau khi sự việc xảy ra...</em>
                      </div>
                    `}
                  </div>

                  <div class="reflection-edit-box" id="reflection-edit-${entry.id}" style="display: none;">
                    <textarea class="journal-reflection-textarea" id="textarea-${entry.id}" placeholder="Ghi lại diễn biến thực tế, cảm xúc hoặc bài học nhận được sau lần trải bài này...">${escapeHTML(entry.reflectionNote || '')}</textarea>
                    <div class="reflection-edit-footer">
                      <select class="journal-status-dropdown" id="status-select-${entry.id}">
                        <option value="studying" ${currentStatus === 'studying' ? 'selected' : ''}>⏳ Đang chiêm nghiệm</option>
                        <option value="manifested" ${currentStatus === 'manifested' ? 'selected' : ''}>✅ Đã ứng nghiệm chuẩn xác</option>
                        <option value="lesson" ${currentStatus === 'lesson' ? 'selected' : ''}>💡 Bài học quý giá</option>
                      </select>
                      <div class="reflection-btn-group">
                        <button class="tarot-btn-primary btn-save-note" data-id="${entry.id}">Lưu</button>
                        <button class="tarot-btn-ghost btn-cancel-note" data-id="${entry.id}">Hủy</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="journal-item-actions">
                  <button class="tarot-btn-secondary btn-view-journal-detail" data-id="${entry.id}">
                    👁️ Xem Lại Toàn Văn Báo Cáo
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function bindTarotEvents(container) {"""

code = re.sub(journal_pattern, new_journal, code, count=1)
print("[2] Updated renderJournalSubView.")

# 3. Replace openTarotCardDetailModal with 3D Flip & Astrological details
modal_pattern = r"(function openTarotCardDetailModal\(cardId\) \{[\s\S]*?const NetaTarotView = \{)"

new_modal = """function openTarotCardDetailModal(cardId, initialReversed = false) {
    const engine = global.NetaTarotEngine;
    if (!engine) return;
    const c = engine.getCard(cardId);
    if (!c) return;
    const meta = getCardMetadata(c);

    let isModalReversed = initialReversed;

    let modal = document.getElementById('tarot-detail-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'tarot-detail-modal';
      modal.className = 'modal-overlay tarot-detail-modal';
      document.body.appendChild(modal);
    }

    function renderModalBody() {
      modal.innerHTML = `
        <div class="modal-dialog tarot-modal-dialog">
          <button class="modal-close" id="tarot-modal-close-btn">&times;</button>
          <div class="tarot-modal-content">
            <!-- Left Col: 3D Flip Card & Attributes -->
            <div class="tarot-modal-img-col">
              <div class="modal-card-3d-scene">
                <img src="assets/tarot/${c.id}.webp" alt="${c.name_vi}" 
                  class="tarot-modal-img ${isModalReversed ? 'is-reversed-view' : ''}" 
                  id="modal-card-img"
                  title="Chạm vào nút bên dưới để đổi chiều bài">
              </div>

              <!-- Orientation Toggle Buttons -->
              <div class="modal-orientation-switcher">
                <button class="modal-orient-btn ${!isModalReversed ? 'active' : ''}" id="btn-orient-upright">
                  🔼 Chiều Xuôi
                </button>
                <button class="modal-orient-btn ${isModalReversed ? 'active' : ''}" id="btn-orient-reversed">
                  🔽 Chiều Ngược
                </button>
              </div>

              <div class="tarot-modal-tags">
                <span class="tarot-tag">${c.arcana} Arcana</span>
                <span class="tarot-tag">Nguyên tố ${c.element}</span>
                ${c.number !== undefined ? `<span class="tarot-tag">Số ${c.number}</span>` : ''}
              </div>

              ${meta ? `
                <div class="modal-astro-box">
                  <div class="astro-label">🪐 Chiêm Tinh & Thiên Thể:</div>
                  <div class="astro-val">${meta.astro}</div>
                  <div class="astro-label">🔢 Số Học Huyền Bí:</div>
                  <div class="astro-val">${meta.num}</div>
                </div>
              ` : ''}
            </div>

            <!-- Right Col: Meaning, Symbolism & Advice -->
            <div class="tarot-modal-info-col">
              <h2 class="tarot-modal-title">${c.name_vi}</h2>
              <div class="tarot-modal-sub">${c.name_en}</div>

              <!-- Symbolism Breakdown -->
              ${meta && meta.symbols ? `
                <div class="tarot-info-block symbolism-block">
                  <h4>🎨 Biểu Tượng Học Rider-Waite (Symbolism):</h4>
                  <p>${meta.symbols}</p>
                </div>
              ` : ''}

              <!-- Active Orientation Keywords -->
              <div class="tarot-info-block ${!isModalReversed ? 'highlight-block' : ''}">
                <h4>🔑 Từ khóa Xuôi (Upright):</h4>
                <p>${c.keywords_up}</p>
              </div>

              <div class="tarot-info-block ${isModalReversed ? 'highlight-block' : ''}">
                <h4>🔄 Từ khóa Ngược (Reversed):</h4>
                <p>${c.keywords_rev}</p>
              </div>

              <div class="tarot-info-block">
                <h4>🌟 Ý nghĩa Tổng quan (${!isModalReversed ? 'Chiều Xuôi' : 'Chiều Ngược'}):</h4>
                <p>${!isModalReversed ? (c.meanings ? c.meanings.general : '') : 'Năng lượng bị trì hoãn, xung đột nội tâm hoặc cần soi xét lại góc nhìn.'}</p>
              </div>

              <div class="tarot-info-block">
                <h4>💼 Công việc & Tài chính:</h4>
                <p>${c.meanings ? c.meanings.career : ''}</p>
              </div>

              <div class="tarot-info-block">
                <h4>❤️ Tình cảm & Mối quan hệ:</h4>
                <p>${c.meanings ? c.meanings.love : ''}</p>
              </div>

              <div class="tarot-info-block tarot-advice-block">
                <h4>💡 Lời khuyên cốt lõi:</h4>
                <p><em>${c.advice}</em></p>
              </div>
            </div>
          </div>
        </div>
      `;

      modal.style.display = 'flex';

      // Event bindings inside modal
      const closeBtn = modal.querySelector('#tarot-modal-close-btn');
      if (closeBtn) closeBtn.onclick = () => { modal.style.display = 'none'; };
      modal.onclick = (e) => {
        if (e.target === modal) modal.style.display = 'none';
      };

      const btnUp = modal.querySelector('#btn-orient-upright');
      const btnRev = modal.querySelector('#btn-orient-reversed');
      if (btnUp) btnUp.onclick = () => {
        if (isModalReversed) {
          isModalReversed = false;
          playCardFlipSound();
          triggerHaptic(15);
          renderModalBody();
        }
      };
      if (btnRev) btnRev.onclick = () => {
        if (!isModalReversed) {
          isModalReversed = true;
          playCardFlipSound();
          triggerHaptic(15);
          renderModalBody();
        }
      };
    }

    renderModalBody();
  }

  const NetaTarotView = {"""

code = re.sub(modal_pattern, new_modal, code, count=1)
print("[3] Updated openTarotCardDetailModal with 3D Flip & Astrological symbols.")

# 4. Now update bindTarotEvents to handle:
# - Encyclopedia subfilters (.ency-class-btn)
# - Journal domain filter (.journal-domain-btn)
# - Journal search input (#tarot-journal-search-input)
# - Star rating clicks (.star-btn)
# - Toggle reflection note editor (.btn-toggle-edit-reflection)
# - Save note (.btn-save-note) & Cancel (.btn-cancel-note)
# - Export JSON & Import JSON
event_insert_marker = "    // 10. Journal Actions"
new_event_handlers = """    // Phase 3: Encyclopedia Class Sub-Filters
    container.querySelectorAll('.ency-class-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        encyClassFilter = btn.getAttribute('data-class') || 'all';
        renderTarot();
      });
    });

    // Phase 3: Journal Domain Filters & Search
    container.querySelectorAll('.journal-domain-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        journalFilterDomain = btn.getAttribute('data-domain') || 'all';
        renderTarot();
      });
    });

    const journalSearchInput = container.querySelector('#tarot-journal-search-input');
    if (journalSearchInput) {
      journalSearchInput.addEventListener('input', (e) => {
        journalSearchQuery = e.target.value;
        const subview = container.querySelector('#tarot-subview-container');
        if (subview) {
          subview.innerHTML = renderJournalSubView();
          bindTarotEvents(container);
        }
      });
    }

    // Phase 3: Journal Star Ratings
    container.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const star = parseInt(btn.getAttribute('data-star'), 10);
        if (id && !isNaN(star)) {
          updateJournalEntryData(id, undefined, star, undefined);
          playCardSlideSound();
          triggerHaptic(15);
          renderTarot();
          if (typeof window.showToast === 'function') {
            window.showToast(`⭐ Đã cập nhật độ ứng nghiệm: ${star}/5 sao`);
          }
        }
      });
    });

    // Phase 3: Toggle Reflection Note Editor
    container.querySelectorAll('.btn-toggle-edit-reflection').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const displayBox = container.querySelector(`#reflection-display-${id}`);
        const editBox = container.querySelector(`#reflection-edit-${id}`);
        if (displayBox && editBox) {
          const isEditing = editBox.style.display !== 'none';
          editBox.style.display = isEditing ? 'none' : 'block';
          displayBox.style.display = isEditing ? 'block' : 'none';
        }
      });
    });

    // Phase 3: Save Reflection Note
    container.querySelectorAll('.btn-save-note').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const textarea = container.querySelector(`#textarea-${id}`);
        const statusSelect = container.querySelector(`#status-select-${id}`);
        if (id && textarea) {
          const noteText = textarea.value.trim();
          const statusVal = statusSelect ? statusSelect.value : 'studying';
          updateJournalEntryData(id, noteText, undefined, statusVal);
          triggerHaptic(20);
          renderTarot();
          if (typeof window.showToast === 'function') {
            window.showToast('✅ Đã lưu ghi chú phản tư cá nhân!');
          }
        }
      });
    });

    container.querySelectorAll('.btn-cancel-note').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const displayBox = container.querySelector(`#reflection-display-${id}`);
        const editBox = container.querySelector(`#reflection-edit-${id}`);
        if (displayBox && editBox) {
          editBox.style.display = 'none';
          displayBox.style.display = 'block';
        }
      });
    });

    // Phase 3: Export & Import Journal Data
    const btnExportJson = container.querySelector('#btn-tarot-export-json');
    if (btnExportJson) {
      btnExportJson.addEventListener('click', () => {
        exportJournalData();
        if (typeof window.showToast === 'function') {
          window.showToast('📁 Đang tải tệp sao lưu Nhật ký JSON...');
        }
      });
    }

    const btnImportJson = container.querySelector('#btn-tarot-import-json');
    const btnImportJsonEmpty = container.querySelector('#btn-tarot-import-json-empty');
    const fileInput = container.querySelector('#tarot-journal-file-input');

    const handleImportTrigger = () => {
      if (fileInput) fileInput.click();
    };
    if (btnImportJson) btnImportJson.addEventListener('click', handleImportTrigger);
    if (btnImportJsonEmpty) btnImportJsonEmpty.addEventListener('click', handleImportTrigger);

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const ok = importJournalData(event.target.result);
          if (ok) {
            renderTarot();
            if (typeof window.showToast === 'function') {
              window.showToast('✅ Đã khôi phục dữ liệu Nhật ký thành công!');
            }
          }
        };
        reader.readAsText(file);
      });
    }

    // Mini card click in journal opens card detail
    container.querySelectorAll('.journal-mini-card').forEach(mc => {
      mc.addEventListener('click', () => {
        const id = mc.getAttribute('data-id');
        if (id) openTarotCardDetailModal(id);
      });
    });

    // Top frequent card pills click in stats
    container.querySelectorAll('.top-card-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const id = pill.getAttribute('data-id');
        if (id) openTarotCardDetailModal(id);
      });
    });

"""

pos_journal_actions = code.find(event_insert_marker)
if pos_journal_actions != -1:
    code = code[:pos_journal_actions] + new_event_handlers + "\n" + code[pos_journal_actions:]
    print("[4] Added Phase 3 event bindings.")
else:
    print("WARNING: Could not find event_insert_marker")

with open(tarot_view_path, "w", encoding="utf-8") as f:
    f.write(code)

print("Saved Phase 3 Step 2 successfully!")
