/**
 * MODULE XIN ĐÀI ÂM DƯƠNG (XIN KEO CỔ TRUYỀN)
 * Phân hệ Thỉnh Ý Tiên Gia & Bề Trên theo Luật Tam Bất Quá Tam
 * Tích hợp chuẩn Neta Light Design System & Mobile Ergonomics
 */

window.NetaXinDaiView = (() => {
  let isHapticEnabled = true;
  let tossAudio = null;
  let currentContext = "ha_le";
  let roundCount = 0;
  let isLocked = false;
  let isCompleted = false;
  let isInitialized = false;

  const CONTEXT_DATA = {
    ha_le: {
      name: "Hạ Lễ / Hóa Vàng",
      prayer: '"Nay tuần hương đã tàn, lễ bạc tâm thành đã dâng trọn. Tín chủ con xin phép chư vị bề trên cho phép được hạ lễ, hóa kim ngân và thụ hưởng lộc phước..."',
      outcomes: {
        NHAT_AM_NHAT_DUONG: {
          title: "ĐẮC ĐÀI HẠ LỄ (BỀ TRÊN ĐỒNG Ý)",
          desc: "Bề trên đã hoan hỉ thụ hưởng lễ vật, chứng giám lòng thành. ĐƯỢC PHÉP HẠ LỄ VÀ HÓA VÀNG. Vái tạ 3 vái rồi thụ lộc bình an.",
          colorLight: "#8b1d24",
          colorDark: "#ffd166",
          isSuccess: true
        },
        LUONG_DUONG: {
          title: "ĐÀI CƯỜI - CHƯA HẾT TUẦN LỄ",
          desc: "Lễ chưa tàn hoặc con cháu quá vội vàng, các cụ còn đang ngự thụ hưởng. CHƯA ĐƯỢC HẠ LỄ. Châm thêm hương hoặc đợi thêm rồi xin lại.",
          colorLight: "#0284c7",
          colorDark: "#38bdf8",
          isSuccess: false
        },
        LUONG_AM: {
          title: "BẾ ĐÀI - CHƯA CHO PHÉP HẠ LỄ",
          desc: "Bề trên CHƯA ĐỒNG Ý. Có thể mâm cúng có điều sơ suất, bày biện sai quy cách hoặc có việc chưa yên. TUYỆT ĐỐI CHƯA HẠ LỄ, đợi hết tuần hương.",
          colorLight: "#dc2626",
          colorDark: "#f87171",
          isSuccess: false
        }
      }
    },
    le_chua: {
      name: "Đi Lễ Chùa / Đền",
      prayer: '"Nam mô A Di Đà Phật / Kính lạy Tam Tòa Thánh Mẫu, Đức Thành Hoàng Bản Thổ. Đệ tử con sắm sửa hương hoa lễ vật dâng trước án tiền, cúi xin chứng giám sở nguyện..."',
      outcomes: {
        NHAT_AM_NHAT_DUONG: {
          title: "THÁNH THÀNH - CHỨNG GIÁM SỞ NGUYỆN",
          desc: "Chư Phật, Thánh Mẫu, Thành Hoàng đã chuẩn thuận lời cầu nguyện. Cầu tài đắc tài, cầu lộc đắc lộc. Hãy lễ tạ tam bái và tích đức hành thiện.",
          colorLight: "#8b1d24",
          colorDark: "#ffd166",
          isSuccess: true
        },
        LUONG_DUONG: {
          title: "TIẾU ĐÀI - THẦN THÁNH MỈM CƯỜI",
          desc: "Bề trên mỉm cười chưa duyệt. Tâm ý còn phân vân hoặc sở cầu vượt phước phần. Hãy sám hối, hạ bớt tham vọng, cầu bình an thay vì danh lợi viển vông.",
          colorLight: "#0284c7",
          colorDark: "#38bdf8",
          isSuccess: false
        },
        LUONG_AM: {
          title: "CẤM ĐÀI - BỀ TRÊN TỪ CHỐI DỨT KHOÁT",
          desc: "Chư vị thần thánh lắc đầu từ chối. Báo hiệu điều xin là bất khả, nếu cố làm sẽ hao tài tổn phúc. DỪNG NGAY Ý ĐỊNH ĐÓ LẠI.",
          colorLight: "#dc2626",
          colorDark: "#f87171",
          isSuccess: false
        }
      }
    },
    dai_su: {
      name: "Việc Đại Sự",
      prayer: '"Kính lạy Tiên tổ nội ngoại, Thổ công bản thổ tôn thần. Nay gia đình có việc đại sự muốn tiến hành, cúi xin bề trên soi đường chỉ lối, tỏ rõ ý trời..."',
      outcomes: {
        NHAT_AM_NHAT_DUONG: {
          title: "THÁNH ĐÀI - ĐẠI CÁT ĐẠI LỢI",
          desc: "Âm Dương tương thông, bề trên đồng ý chở che bảo bọc. Việc lớn triển khai thuận lợi, có quý nhân phù trợ. Tự tin tiến hành theo kế hoạch.",
          colorLight: "#8b1d24",
          colorDark: "#ffd166",
          isSuccess: true
        },
        LUONG_DUONG: {
          title: "ĐÀI CƯỜI - TÂM CHƯA QUYẾT",
          desc: "Thần thánh mỉm cười vì người hỏi còn phân vân, nửa muốn làm nửa không; hoặc việc đã rõ mà vẫn hỏi thử lòng. Bình tâm suy xét kỹ lưỡng.",
          colorLight: "#0284c7",
          colorDark: "#38bdf8",
          isSuccess: false
        },
        LUONG_AM: {
          title: "ĐÀI SẬP - CẢN TRỞ NGUY HIỂM",
          desc: "Cửa âm đóng chặt. Báo hiệu hiểm họa khó lường, thời cơ chưa tới, nếu cố làm ắt thất bại. DỪNG LẠI NGAY LẬP TỨC để bảo toàn sự an ổn.",
          colorLight: "#dc2626",
          colorDark: "#f87171",
          isSuccess: false
        }
      }
    }
  };

  /**
   * Phát rung phần cứng đa tầng theo từng nhịp va chạm vật lý
   */
  function triggerHaptic(type) {
    if (!isHapticEnabled) return;

    // A. Kênh Flutter / Native Mobile App
    try {
      if (window.flutter_inappwebview && window.flutter_inappwebview.callHandler) {
        window.flutter_inappwebview.callHandler('hapticFeedback', type);
        return;
      }
      if (window.MobileHaptic && typeof window.MobileHaptic.postMessage === 'function') {
        window.MobileHaptic.postMessage(type);
        return;
      }
      if (window.AndroidInterface && typeof window.AndroidInterface.vibrate === 'function') {
        window.AndroidInterface.vibrate(type);
        return;
      }
      if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.haptic) {
        window.webkit.messageHandlers.haptic.postMessage(type);
        return;
      }
    } catch (e) {
      // Ignored
    }

    // B. Web Vibration API tiêu chuẩn
    if ("vibrate" in navigator) {
      try {
        switch(type) {
          case 'click':
            navigator.vibrate(15);
            break;
          case 'coin1_hit':
            navigator.vibrate(35);
            break;
          case 'coin1_bounce':
            navigator.vibrate(12);
            break;
          case 'coin2_hit':
            navigator.vibrate(40);
            break;
          case 'coin2_bounce':
            navigator.vibrate(14);
            break;
          case 'success':
            navigator.vibrate([40, 80, 55]);
            break;
          case 'fail':
            navigator.vibrate(25);
            break;
          default:
            navigator.vibrate(20);
        }
      } catch (err) {
        // Ignored
      }
    }
  }

  function initAudio() {
    if (!tossAudio) {
      try {
        if (typeof AUDIO_COIN_DROP_B64 !== "undefined") {
          tossAudio = new Audio(AUDIO_COIN_DROP_B64);
        } else {
          tossAudio = new Audio('assets/xindai/tieng_xu_roi_dia_su.wav');
        }
        tossAudio.preload = 'auto';
      } catch (e) {
        console.warn('Audio init warning:', e);
      }
    }
  }

  function playDropSound() {
    initAudio();
    if (tossAudio) {
      try {
        tossAudio.currentTime = 0;
        tossAudio.play().catch(() => {});
      } catch (e) {}
    }
  }

  function resetStateOnly() {
    roundCount = 0;
    isCompleted = false;
    isLocked = false;

    const slot1 = document.getElementById("xindai-slot1");
    const slot2 = document.getElementById("xindai-slot2");
    const inner1 = document.getElementById("xindai-inner1");
    const inner2 = document.getElementById("xindai-inner2");
    const img1 = document.getElementById("xindai-img1");
    const img2 = document.getElementById("xindai-img2");
    const titleEl = document.getElementById("xindai-result-title");
    const descEl = document.getElementById("xindai-result-desc");
    const roundEl = document.getElementById("xindai-result-round");
    const btn = document.getElementById("xindai-btn-toss");

    if (slot1) slot1.className = "xindai-coin-slot";
    if (slot2) slot2.className = "xindai-coin-slot";
    if (inner1) {
      inner1.className = "xindai-coin-inner";
      inner1.style.transform = "rotate(0deg)";
    }
    if (inner2) {
      inner2.className = "xindai-coin-inner";
      inner2.style.transform = "rotate(0deg)";
    }
    if (img1) img1.src = "assets/xindai/mat_duong.png";
    if (img2) img2.src = "assets/xindai/mat_am.png";

    if (titleEl) {
      titleEl.innerText = "Thành Tâm Thỉnh Nguyện";
      titleEl.style.color = "";
    }
    if (descEl) {
      descEl.innerText = "Đọc thầm lời khấn bên trên, định tâm trong 3 giây rồi bấm nút gieo đài vào đĩa sứ.";
    }
    if (roundEl) {
      roundEl.innerText = "Chưa gieo đài (Tam Bất Quá Tam)";
    }
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<span>🪙</span> <span>GIEO ĐÀI VÀO ĐĨA</span>`;
    }
  }

  function setContext(ctxKey) {
    if (isLocked) return;
    triggerHaptic('click');
    currentContext = ctxKey;

    document.querySelectorAll(".xindai-tab-btn").forEach(b => b.classList.remove("active"));
    const activeBtn = document.getElementById(`xindai-tab-${ctxKey}`);
    if (activeBtn) activeBtn.classList.add("active");

    const prayerBox = document.getElementById("xindai-prayer-box");
    if (prayerBox && CONTEXT_DATA[ctxKey]) {
      prayerBox.innerText = CONTEXT_DATA[ctxKey].prayer;
    }
    resetStateOnly();
  }

  function executeToss() {
    if (isLocked) return;
    triggerHaptic('click');

    // Nếu trước đó đã hoàn thành hoặc hết 3 lần: tự động bắt đầu lượt mới
    if (isCompleted || roundCount >= 3) {
      roundCount = 0;
      isCompleted = false;
    }

    isLocked = true;
    roundCount++;

    const btn = document.getElementById("xindai-btn-toss");
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span>⏳</span> <span>ĐANG GIEO VÀO ĐĨA...</span>`;
    }

    playDropSound();

    // CSPRNG Hardware Random
    let isYang1 = false;
    let isYang2 = false;

    if (window.crypto && window.crypto.getRandomValues) {
      const entropy = new Uint32Array(2);
      window.crypto.getRandomValues(entropy);
      isYang1 = (entropy[0] & 1) === 1;
      isYang2 = (entropy[1] & 1) === 1;
    } else {
      isYang1 = Math.random() < 0.5;
      isYang2 = Math.random() < 0.5;
    }

    let resultCode = "";
    if (isYang1 !== isYang2) {
      resultCode = "NHAT_AM_NHAT_DUONG";
    } else if (isYang1 && isYang2) {
      resultCode = "LUONG_DUONG";
    } else {
      resultCode = "LUONG_AM";
    }

    const slot1 = document.getElementById("xindai-slot1");
    const slot2 = document.getElementById("xindai-slot2");
    const inner1 = document.getElementById("xindai-inner1");
    const inner2 = document.getElementById("xindai-inner2");
    const img1 = document.getElementById("xindai-img1");
    const img2 = document.getElementById("xindai-img2");

    if (slot1) slot1.className = "xindai-coin-slot";
    if (slot2) slot2.className = "xindai-coin-slot";
    if (inner1) inner1.className = "xindai-coin-inner";
    if (inner2) inner2.className = "xindai-coin-inner";
    void (slot1 ? slot1.offsetWidth : 0);
    void (slot2 ? slot2.offsetWidth : 0);

    if (slot1) slot1.className = "xindai-coin-slot xindai-slot-tossing-1";
    if (slot2) slot2.className = "xindai-coin-slot xindai-slot-tossing-2";
    if (inner1) inner1.className = "xindai-coin-inner xindai-coin-spinning-1";
    if (inner2) inner2.className = "xindai-coin-inner xindai-coin-spinning-2";

    let flipCount1 = 0;
    const flipTimer1 = setInterval(() => {
      flipCount1++;
      if (img1) img1.src = (flipCount1 % 2 === 0) ? 'assets/xindai/mat_duong.png' : 'assets/xindai/mat_am.png';
    }, 70);

    let flipCount2 = 0;
    const flipTimer2 = setInterval(() => {
      flipCount2++;
      if (img2) img2.src = (flipCount2 % 2 === 0) ? 'assets/xindai/mat_am.png' : 'assets/xindai/mat_duong.png';
    }, 70);

    // Đồng 1 chạm đĩa (750ms)
    setTimeout(() => {
      triggerHaptic('coin1_hit');
      clearInterval(flipTimer1);
      if (inner1) inner1.className = "xindai-coin-inner";
      if (img1) img1.src = isYang1 ? 'assets/xindai/mat_duong.png' : 'assets/xindai/mat_am.png';
      const rotZ1 = Math.floor(Math.random() * 50) - 25;
      if (inner1) inner1.style.transform = `rotate(${rotZ1}deg)`;
    }, 750);

    // Đồng 1 nảy nhẹ (880ms)
    setTimeout(() => {
      triggerHaptic('coin1_bounce');
    }, 880);

    // Đồng 2 chạm đĩa (1020ms)
    setTimeout(() => {
      triggerHaptic('coin2_hit');
      clearInterval(flipTimer2);
      if (inner2) inner2.className = "xindai-coin-inner";
      if (img2) img2.src = isYang2 ? 'assets/xindai/mat_duong.png' : 'assets/xindai/mat_am.png';
      const rotZ2 = Math.floor(Math.random() * 50) - 25;
      if (inner2) inner2.style.transform = `rotate(${rotZ2}deg)`;
    }, 1020);

    // Đồng 2 nảy nhẹ (1160ms)
    setTimeout(() => {
      triggerHaptic('coin2_bounce');
    }, 1160);

    // Kết thúc & hiển thị kết quả (1750ms)
    setTimeout(() => {
      showResult(resultCode);
      isLocked = false;
    }, 1750);
  }

  function showResult(code) {
    const ctx = CONTEXT_DATA[currentContext] || CONTEXT_DATA.ha_le;
    const data = ctx.outcomes[code];
    const titleEl = document.getElementById("xindai-result-title");
    const descEl = document.getElementById("xindai-result-desc");
    const roundEl = document.getElementById("xindai-result-round");
    const btn = document.getElementById("xindai-btn-toss");
    const isLight = document.body.classList.contains("theme-light");

    if (titleEl && data) {
      titleEl.innerText = data.title;
      titleEl.style.color = isLight ? data.colorLight : data.colorDark;
    }
    if (descEl && data) {
      descEl.innerText = data.desc;
    }

    triggerHaptic(data && data.isSuccess ? 'success' : 'fail');

    if (data && data.isSuccess) {
      isCompleted = true;
      if (roundEl) {
        roundEl.innerHTML = `<span style="color:#d4af37; font-weight:bold;">ĐẮC ĐÀI Ở LẦN THỨ ${roundCount}!</span> (Bề trên chuẩn thuận)`;
      }
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `<span>✨</span> <span>TẠ ƠN & GIEO LƯỢT MỚI</span>`;
      }
    } else {
      if (roundCount >= 3) {
        isCompleted = true;
        if (roundEl) {
          roundEl.innerHTML = `<span style="color:#dc2626; font-weight:bold;">TAM BẤT QUÁ TAM: ĐÃ HẾT 3 LẦN</span>`;
        }
        if (descEl) {
          descEl.innerText += " Quá tam ba bận không đắc đài, bề trên dứt khoát từ chối. TUYỆT ĐỐI NÊN DỪNG LẠI!";
        }
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>🔄</span> <span>BẮT ĐẦU LƯỢT MỚI</span>`;
        }
      } else {
        if (roundEl) {
          roundEl.innerHTML = `LẦN THỨ ${roundCount} CHƯA THUẬN (CÒN ${3 - roundCount} LẦN XIN LẠI)`;
        }
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span>🪙</span> <span>XIN LẠI LẦN ${roundCount + 1} / 3</span>`;
        }
      }
    }

    // Thông báo cho Native Bridge nếu có
    try {
      if (window.XinDaiResult && typeof window.XinDaiResult.postMessage === 'function') {
        window.XinDaiResult.postMessage(JSON.stringify({
          context: currentContext,
          round: roundCount,
          code: code,
          isSuccess: data ? data.isSuccess : false
        }));
      }
    } catch (e) {}
  }

  function render(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="xindai-workspace">
        <!-- 1. BỘ CHỌN BỐI CẢNH CO DÃN -->
        <div class="xindai-context-selector">
          <button class="xindai-tab-btn active" id="xindai-tab-ha_le">🏮 Hạ Lễ / Hóa Vàng</button>
          <button class="xindai-tab-btn" id="xindai-tab-le_chua">🏛️ Lễ Chùa / Đền</button>
          <button class="xindai-tab-btn" id="xindai-tab-dai_su">📜 Việc Đại Sự</button>
        </div>

        <!-- 2. VĂN KHẤN GỢI Ý THEO BỐI CẢNH -->
        <div class="xindai-prayer-box" id="xindai-prayer-box">
          ${CONTEXT_DATA.ha_le.prayer}
        </div>

        <!-- 3. BÀN THỜ VÀ ĐĨA SỨ HOA LAM THẬT -->
        <div class="xindai-altar">
          <div class="xindai-plate">
            <div class="xindai-plate-shadow"></div>
            <div class="xindai-coins-wrapper">
              <!-- ĐỒNG XU THỨ NHẤT (RƠI TRƯỚC) -->
              <div class="xindai-coin-slot" id="xindai-slot1">
                <div class="xindai-coin-inner" id="xindai-inner1">
                  <img class="xindai-coin-img" id="xindai-img1" src="assets/xindai/mat_duong.png" alt="Mặt Dương Càn Long" />
                </div>
              </div>

              <!-- ĐỒNG XU THỨ HAI (RƠI SAU) -->
              <div class="xindai-coin-slot" id="xindai-slot2">
                <div class="xindai-coin-inner" id="xindai-inner2">
                  <img class="xindai-coin-img" id="xindai-img2" src="assets/xindai/mat_am.png" alt="Mặt Âm Song Long" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4. KHUNG THÔNG BÁO KẾT QUẢ -->
        <div class="xindai-result-card" id="xindai-result-card">
          <div class="xindai-result-title" id="xindai-result-title">Thành Tâm Thỉnh Nguyện</div>
          <div class="xindai-result-desc" id="xindai-result-desc">Đọc thầm lời khấn bên trên, định tâm trong 3 giây rồi bấm nút gieo đài vào đĩa sứ.</div>
          <div class="xindai-result-round" id="xindai-result-round">Chưa gieo đài (Tam Bất Quá Tam)</div>
        </div>

        <!-- 5. NÚT DUY NHẤT: BÉ TINH TẾ, DỄ BẤM -->
        <div class="xindai-controls">
          <button class="xindai-btn-toss" id="xindai-btn-toss">
            <span>🪙</span> <span>GIEO ĐÀI VÀO ĐĨA</span>
          </button>
        </div>
      </div>
    `;

    // Gắn sự kiện tab bối cảnh
    const tabHaLe = document.getElementById("xindai-tab-ha_le");
    const tabLeChua = document.getElementById("xindai-tab-le_chua");
    const tabDaiSu = document.getElementById("xindai-tab-dai_su");
    if (tabHaLe) tabHaLe.addEventListener("click", () => setContext("ha_le"));
    if (tabLeChua) tabLeChua.addEventListener("click", () => setContext("le_chua"));
    if (tabDaiSu) tabDaiSu.addEventListener("click", () => setContext("dai_su"));

    // Gắn sự kiện nút gieo đài
    const btnToss = document.getElementById("xindai-btn-toss");
    if (btnToss) {
      btnToss.addEventListener("click", executeToss);
      btnToss.addEventListener("touchend", (e) => {
        e.preventDefault();
        executeToss();
      });
    }

    initAudio();
  }

  function init() {
    const container = document.getElementById("view-xindai");
    if (!container) return;
    if (!isInitialized || container.innerHTML.trim() === "") {
      render(container);
      isInitialized = true;
    }
  }

  return {
    init,
    render,
    setContext,
    executeToss,
    reset: resetStateOnly,
    getState: () => ({
      context: currentContext,
      round: roundCount,
      isCompleted
    })
  };
})();
