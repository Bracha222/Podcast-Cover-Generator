// DOM refs
const audioInput = document.getElementById("audio-input");
const chooseFileBtn = document.getElementById("choose-file-btn");
const uploadZone = document.getElementById("upload-zone");

const fileInfo = document.getElementById("file-info");
const fileNameEl = document.getElementById("file-name");
const fileSizeEl = document.getElementById("file-size");
const fileDurationEl = document.getElementById("file-duration");

const analyzeBtn = document.getElementById("analyze-btn");
const generateBtn = document.getElementById("generate-btn");
const resetBtn = document.getElementById("reset-btn");

const statusText = document.getElementById("status-text");
const statusIndicator = document.getElementById("status-indicator");

const analysisPlaceholder = document.getElementById("analysis-placeholder");
const analysisBody = document.getElementById("analysis-body");
const analysisTopic = document.getElementById("analysis-topic");
const analysisMood = document.getElementById("analysis-mood");
const analysisGenre = document.getElementById("analysis-genre");
const analysisAudience = document.getElementById("analysis-audience");
const analysisKeywords = document.getElementById("analysis-keywords");

const styleSelect = document.getElementById("style-select");
const coversGrid = document.getElementById("covers-grid");
const downloadAllBtn = document.getElementById("download-all-btn");

const toastEl = document.getElementById("toast");
const stepElements = document.querySelectorAll(".step");

let selectedFile = null;
let uploadedFileId = null;
let selectedCoverId = null;

// Helpers

function setStatus(message, type = "idle") {
  statusText.textContent = message;

  statusIndicator.classList.remove("status-ok", "status-error", "status-loading");
  if (type === "ok") statusIndicator.classList.add("status-ok");
  if (type === "error") statusIndicator.classList.add("status-error");
  if (type === "loading") statusIndicator.classList.add("status-loading");
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  setTimeout(() => {
    toastEl.classList.remove("show");
  }, 2500);
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let u = 0;
  let value = bytes;
  while (value >= 1024 && u < units.length - 1) {
    value /= 1024;
    u++;
  }
  return `${value.toFixed(1)} ${units[u]}`;
}

function setStepActive(stepNumber) {
  stepElements.forEach((stepEl) => {
    const step = stepEl.getAttribute("data-step");
    if (String(step) === String(stepNumber)) {
      stepEl.classList.add("active");
    } else {
      stepEl.classList.remove("active");
    }
  });
}

// File handling

function handleFileSelected(file) {
  if (!file) return;

  // Basic size check (20MB)
  const maxBytes = 20 * 1024 * 1024;
  if (file.size > maxBytes) {
    showToast("הקובץ גדול מדי (מעל 20MB).");
    setStatus("העלאה נכשלה – הקובץ גדול מדי.", "error");
    return;
  }

  selectedFile = file;
  uploadedFileId = null;
  selectedCoverId = null;

  fileNameEl.textContent = file.name;
  fileSizeEl.textContent = formatBytes(file.size);
  fileDurationEl.textContent = "משך זמן: מחשב...";

  fileInfo.hidden = false;

  analyzeBtn.disabled = true;
  generateBtn.disabled = true;
  downloadAllBtn.disabled = true;

  setStatus("מעלה את הקובץ לשרת...", "loading");
  setStepActive(1);

  uploadFile(file);
}

// Upload to backend

async function uploadFile(file) {
  try {
    const formData = new FormData();
    formData.append("audio", file);

    const res = await fetch("/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`Upload failed: ${res.status}`);
    }

    const data = await res.json();
    // Expected shape: { fileId, duration }
    uploadedFileId = data.fileId || data.id || null;

    if (data.duration) {
      fileDurationEl.textContent = `משך זמן: ${data.duration} שניות`;
    } else {
      fileDurationEl.textContent = "משך זמן: לא זמין";
    }

    setStatus("הקובץ הועלה בהצלחה. אפשר לעבור לניתוח.", "ok");
    analyzeBtn.disabled = false;
    setStepActive(2);
    showToast("הקובץ הועלה בהצלחה.");
  } catch (err) {
    console.error(err);
    setStatus("שגיאה בהעלאת הקובץ. נסי שוב.", "error");
    showToast("שגיאה בהעלאת הקובץ.");
  }
}

// Analyze

async function analyzeAudio() {
  if (!uploadedFileId) {
    showToast("קודם צריך להעלות קובץ.");
    return;
  }

  setStatus("מנתח את האודיו בעזרת Gemini...", "loading");
  analyzeBtn.disabled = true;
  generateBtn.disabled = true;

  analysisPlaceholder.hidden = true;
  analysisBody.hidden = true;

  try {
    const res = await fetch("/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId: uploadedFileId }),
    });

    if (!res.ok) {
      throw new Error(`Analyze failed: ${res.status}`);
    }

    const data = await res.json();
    // Expected shape:
    // { topic, mood, genre, audience, keywords: ["...", ...] }

    analysisTopic.textContent = data.topic || "לא זמין";
    analysisMood.textContent = data.mood || "לא זמין";
    analysisGenre.textContent = data.genre || "לא זמין";
    analysisAudience.textContent = data.audience || "לא זמין";

    if (Array.isArray(data.keywords)) {
      analysisKeywords.textContent = data.keywords.join(" · ");
    } else if (typeof data.keywords === "string") {
      analysisKeywords.textContent = data.keywords;
    } else {
      analysisKeywords.textContent = "לא זמין";
    }

    analysisBody.hidden = false;
    setStatus("הניתוח הושלם. אפשר ליצור קאברים.", "ok");
    generateBtn.disabled = false;
    setStepActive(3);
    showToast("הניתוח הושלם בהצלחה.");
  } catch (err) {
    console.error(err);
    analysisPlaceholder.hidden = false;
    setStatus("שגיאה בניתוח האודיו.", "error");
    analyzeBtn.disabled = false;
    showToast("שגיאה בניתוח. נסי שוב.");
  }
}

// Generate covers

async function generateCovers() {
  if (!uploadedFileId) {
    showToast("קודם צריך להעלות ולנתח קובץ.");
    return;
  }

  setStatus("יוצר קאברים בעזרת Gemini...", "loading");
  generateBtn.disabled = true;
  downloadAllBtn.disabled = true;
  selectedCoverId = null;
  renderCoversSkeleton();

  try {
    const res = await fetch("/generate-covers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileId: uploadedFileId,
        preferredStyle: styleSelect.value,
      }),
    });

    if (!res.ok) {
      throw new Error(`Generate covers failed: ${res.status}`);
    }

    const data = await res.json();
    // Expected shape: { covers: [{ id, url, style }, ...] }
    const covers = Array.isArray(data.covers) ? data.covers : data;

    if (!covers || covers.length === 0) {
      coversGrid.innerHTML = `
        <div class="empty-state">
          <p>לא התקבלו קאברים מהשרת.</p>
        </div>
      `;
      setStatus("לא התקבלו קאברים.", "error");
      return;
    }

    renderCovers(covers);
    setStatus("הקאברים נוצרו בהצלחה.", "ok");
    downloadAllBtn.disabled = false;
    showToast("הקאברים מוכנים להורדה.");
  } catch (err) {
    console.error(err);
    coversGrid.innerHTML = `
      <div class="empty-state">
        <p>שגיאה ביצירת הקאברים.</p>
        <p class="muted">בדקי את השרת או את מפתח ה־API.</p>
      </div>
    `;
    setStatus("שגיאה ביצירת הקאברים.", "error");
    generateBtn.disabled = false;
    showToast("שגיאה ביצירת הקאברים.");
  }
}

function renderCoversSkeleton() {
  coversGrid.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const card = document.createElement("div");
    card.className = "cover-card";
    card.innerHTML = `
      <div class="cover-image-wrapper" style="background: linear-gradient(135deg,#1f2937,#020617);">
      </div>
      <div class="cover-card-body">
        <div class="cover-style-label">
          מייצר קאבר...
        </div>
      </div>
    `;
    coversGrid.appendChild(card);
  }
}

function renderCovers(covers) {
  coversGrid.innerHTML = "";
  covers.forEach((cover, index) => {
    const card = document.createElement("div");
    card.className = "cover-card";
    card.dataset.coverId = cover.id || String(index);

    const styleLabel =
      cover.style ||
      (index === 0
        ? "מינימליסטי"
        : index === 1
        ? "צבעוני"
        : index === 2
        ? "אומנותי"
        : "מותאם לז'אנר");

    card.innerHTML = `
      <div class="cover-image-wrapper">
        <img src="${cover.url}" alt="Podcast cover ${index + 1}" loading="lazy" />
        <span class="cover-badge">${styleLabel}</span>
      </div>
      <div class="cover-card-body">
        <div class="cover-style-label">קאבר #${index + 1}</div>
        <div class="cover-actions">
          <button type="button" class="btn btn-icon ghost js-select-cover">
            בחר
          </button>
          <button type="button" class="btn btn-icon secondary js-download-cover">
            הורד
          </button>
        </div>
      </div>
    `;

    coversGrid.appendChild(card);
  });

  coversGrid.addEventListener("click", (ev) => {
    const selectBtn = ev.target.closest(".js-select-cover");
    const downloadBtn = ev.target.closest(".js-download-cover");
    const card = ev.target.closest(".cover-card");
    if (!card) return;
    const coverId = card.dataset.coverId;

    if (selectBtn) {
      selectCoverCard(coverId);
    } else if (downloadBtn) {
      downloadSingleCover(coverId);
    }
  });
}

function selectCoverCard(coverId) {
  selectedCoverId = coverId;
  document.querySelectorAll(".cover-card").forEach((card) => {
    if (card.dataset.coverId === coverId) {
      card.classList.add("selected");
      if (!card.querySelector(".selected-pill")) {
        const pill = document.createElement("div");
        pill.className = "selected-pill";
        pill.textContent = "נבחר";
        card.appendChild(pill);
      }
    } else {
      card.classList.remove("selected");
      const pill = card.querySelector(".selected-pill");
      if (pill) pill.remove();
    }
  });
  showToast("קאבר מועדף נבחר.");
}

// Downloads – כאן את משנה לפי ה־endpoint שלך

function downloadSingleCover(coverId) {
  // כאן אפשר לשלב endpoint אמיתי, לדוגמה:
  // window.location.href = `/download-cover/${encodeURIComponent(coverId)}`;
  showToast("בשרת האמיתי זה יוריד את הקאבר הספציפי.");
}

function downloadAllCovers() {
  // כאן אפשר endpoint ל־ZIP
  // window.location.href = `/download-all/${encodeURIComponent(uploadedFileId)}`;
  showToast("בשרת האמיתי זה יוריד ZIP של כל הקאברים.");
}

// Reset

function resetAll() {
  selectedFile = null;
  uploadedFileId = null;
  selectedCoverId = null;
  audioInput.value = "";

  fileInfo.hidden = true;
  analysisBody.hidden = true;
  analysisPlaceholder.hidden = false;

  coversGrid.innerHTML = `
    <div class="empty-state">
      <p>עדיין אין קאברים להצגה.</p>
      <p class="muted">אחרי לחיצה על "יצירת קאברים" התמונות יופיעו כאן.</p>
    </div>
  `;

  analyzeBtn.disabled = true;
  generateBtn.disabled = true;
  downloadAllBtn.disabled = true;

  setStatus("עוד לא הועלה קובץ.", "idle");
  setStepActive(1);
}

// Events

chooseFileBtn.addEventListener("click", () => audioInput.click());

audioInput.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (file) {
    handleFileSelected(file);
  }
});

["dragenter", "dragover"].forEach((eventName) => {
  uploadZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.add("drag-over");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  uploadZone.addEventListener(eventName, (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.remove("drag-over");
  });
});

uploadZone.addEventListener("drop", (e) => {
  const file = e.dataTransfer?.files?.[0];
  if (file) {
    handleFileSelected(file);
  }
});

uploadZone.addEventListener("click", () => audioInput.click());

analyzeBtn.addEventListener("click", analyzeAudio);
generateBtn.addEventListener("click", generateCovers);
downloadAllBtn.addEventListener("click", downloadAllCovers);
resetBtn.addEventListener("click", resetAll);

// Init
setStatus("עוד לא הועלה קובץ.", "idle");
