// ============================================================
// DSS Portal v3 — Homepage Logic
// Two views: department grid → department SOPs
// ============================================================

// ---- UTILS ----
function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function sopsForDept(deptId) {
  return sops.filter(s => s.deptId === deptId);
}

// ---- DEPARTMENT SVG ICONS ----
const DEPT_ICONS = {
  "customer-success": `<svg viewBox="0 0 24 24"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`,
  "operations":       `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  "sales":            `<svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  "automation":       `<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
};

function deptIcon(deptId) {
  return DEPT_ICONS[deptId] || `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>`;
}

// ---- DEPARTMENT CARD ----
function makeDeptCard(dept) {
  const deptSops = sopsForDept(dept.id);
  const count    = deptSops.length;
  const isEmpty  = count === 0;

  const footerHTML = isEmpty
    ? `<span class="dept-card-count empty">No SOPs yet</span><div class="dept-card-arrow" style="opacity:0.3">→</div>`
    : `<span class="dept-card-count"><strong>${count}</strong> ${count === 1 ? "SOP" : "SOPs"}</span><div class="dept-card-arrow">→</div>`;

  return `
    <div
      class="dept-card ${isEmpty ? "is-empty" : ""}"
      style="--dept-color: ${dept.color};"
      data-dept-id="${escapeHtml(dept.id)}"
      role="${isEmpty ? "presentation" : "button"}"
      tabindex="${isEmpty ? "-1" : "0"}"
      aria-label="Open ${escapeHtml(dept.name)}"
    >
      <div class="dept-card-icon">${deptIcon(dept.id)}</div>
      <div class="dept-card-name">${escapeHtml(dept.name)}</div>
      <div class="dept-card-desc">${escapeHtml(dept.desc)}</div>
      <div class="dept-card-footer">${footerHTML}</div>
    </div>
  `;
}

// ---- SOP CARD ----
function makeSopCard(s) {
  const sopLink = `sop.html?sop=${encodeURIComponent(s.id)}`;
  const status  = s.status || "Active";
  const hasQrg  = !!s.qrgPath;

  return `
    <article class="sop-card">
      <div class="sop-card-top">
        <span class="sop-code">${escapeHtml(s.sopCode)}</span>
        <div class="sop-card-chips">
          <span class="status-chip ${status.toLowerCase()}">${escapeHtml(status)}</span>
          ${hasQrg ? `<span class="qrg-chip">QRG ✓</span>` : ""}
        </div>
      </div>
      <h4>${escapeHtml(s.title)}</h4>
      <p>${escapeHtml(s.desc)}</p>
      <div class="card-actions">
        <a class="open-link" href="${sopLink}">View SOP →</a>
      </div>
    </article>
  `;
}

// ---- TUTORIAL CARD ----
function makeTutorialCard(v) {
  const dept      = departments.find(d => d.id === v.deptId);
  const deptLabel = dept ? dept.name : "";
  const tags      = (v.tags || []).map(x => `<span class="tag">${escapeHtml(x)}</span>`).join("");
  const hasVideo  = !!v.videoId;

  const thumbSrc = hasVideo
    ? `https://img.youtube.com/vi/${encodeURIComponent(v.videoId)}/hqdefault.jpg`
    : "";

  const ytIcon = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8z"/>
  </svg>`;

  if (hasVideo) {
    return `
      <div class="video-card" data-video-id="${escapeHtml(v.videoId)}" data-video-title="${escapeHtml(v.title)}" role="button" tabindex="0" aria-label="Play ${escapeHtml(v.title)}">
        <div class="video-thumb">
          <img src="${thumbSrc}" alt="${escapeHtml(v.title)}" loading="lazy" onerror="this.style.display='none'" />
          ${deptLabel ? `<div class="video-dept-chip">${escapeHtml(deptLabel)}</div>` : ""}
          <div class="play-btn">
            <div class="play-btn-circle">
              <svg viewBox="0 0 16 16" fill="white"><path d="M6 4l6 4-6 4V4z"/></svg>
            </div>
          </div>
        </div>
        <div class="video-info">
          <h4>${escapeHtml(v.title)}</h4>
          <p>${escapeHtml(v.desc)}</p>
          <div class="video-tags">${tags}</div>
          <a class="video-yt-link" href="${escapeHtml(v.url)}" target="_blank" rel="noreferrer" onclick="event.stopPropagation()">
            ${ytIcon} Watch on YouTube
          </a>
        </div>
      </div>
    `;
  }

  return `
    <article class="card">
      <h4>${escapeHtml(v.title)}</h4>
      <p>${escapeHtml(v.desc)}</p>
      <div class="tags">${tags}</div>
      <div class="card-actions">
        <a href="${escapeHtml(v.url)}" target="_blank" rel="noreferrer">Watch →</a>
      </div>
    </article>
  `;
}

// ---- RENDER: department grid ----
function renderDeptGrid() {
  const grid = document.getElementById("deptGrid");
  grid.innerHTML = departments.map(makeDeptCard).join("");
}

// ---- RENDER: tutorials ----
function renderTutorials() {
  const grid = document.getElementById("videoGrid");
  if (!tutorials || tutorials.length === 0) {
    grid.innerHTML = `<div class="empty-state">No tutorials yet — add video IDs to <strong>data.js</strong> as you upload to YouTube.</div>`;
    return;
  }
  grid.className = "video-grid";
  grid.innerHTML = tutorials.map(makeTutorialCard).join("");
}

// ---- LIGHTBOX ----
function buildLightbox() {
  if (document.getElementById("lightboxOverlay")) return;
  const el = document.createElement("div");
  el.id = "lightboxOverlay";
  el.className = "lightbox-overlay";
  el.innerHTML = `
    <div class="lightbox-inner">
      <div class="lightbox-header">
        <span class="lightbox-title" id="lightboxTitle"></span>
        <button class="lightbox-close" id="lightboxClose" aria-label="Close">✕</button>
      </div>
      <div class="lightbox-player">
        <iframe id="lightboxFrame" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>
      </div>
    </div>
  `;
  document.body.appendChild(el);

  el.addEventListener("click", (e) => {
    if (e.target === el) closeLightbox();
  });
  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

function openLightbox(videoId, title) {
  buildLightbox();
  const overlay = document.getElementById("lightboxOverlay");
  const frame   = document.getElementById("lightboxFrame");
  const lbTitle = document.getElementById("lightboxTitle");

  frame.src  = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1&color=white`;
  lbTitle.textContent = title;

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const overlay = document.getElementById("lightboxOverlay");
  const frame   = document.getElementById("lightboxFrame");
  if (!overlay) return;
  overlay.classList.remove("open");
  frame.src = "";
  document.body.style.overflow = "";
}

// ---- RENDER: SOPs for a department ----
function renderDeptSops(deptId, query = "") {
  const grid = document.getElementById("deptSopGrid");
  let deptSops = sopsForDept(deptId);

  if (query) {
    const q = query.toLowerCase();
    deptSops = deptSops.filter(s =>
      [s.title, s.desc, s.sopCode].join(" ").toLowerCase().includes(q)
    );
  }

  if (deptSops.length === 0) {
    grid.innerHTML = query
      ? `<div class="empty-state">No SOPs matched "<strong>${escapeHtml(query)}</strong>".</div>`
      : `<div class="empty-state">No SOPs in this department yet.</div>`;
    return;
  }

  grid.innerHTML = deptSops.map(makeSopCard).join("");
}

// ============================================================
// VIEW SWITCHING
// ============================================================
let activeDeptId = null;

const viewDepts = document.getElementById("view-depts");
const viewTools = document.getElementById("view-tools");

function showDeptGrid() {
  activeDeptId = null;
  document.getElementById("sopSearch").value = "";

  viewTools.classList.add("hidden");
  viewDepts.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showDeptSops(deptId) {
  const dept     = departments.find(d => d.id === deptId);
  if (!dept) return;

  const deptSops = sopsForDept(deptId);
  if (deptSops.length === 0) return;

  activeDeptId = deptId;

  const iconEl = document.getElementById("viewDeptIcon");
  iconEl.innerHTML = deptIcon(dept.id);
  iconEl.style.background = dept.color;
  document.getElementById("viewDeptName").textContent = dept.name;
  document.getElementById("viewDeptDesc").textContent = dept.desc;
  const count = deptSops.length;
  document.getElementById("viewDeptBadge").textContent =
    `${count} ${count === 1 ? "SOP" : "SOPs"}`;

  renderDeptSops(deptId);

  viewDepts.classList.add("hidden");
  viewTools.classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---- Department card clicks ----
document.getElementById("deptGrid").addEventListener("click", (e) => {
  const card = e.target.closest(".dept-card");
  if (!card || card.classList.contains("is-empty")) return;
  showDeptSops(card.dataset.deptId);
});

document.getElementById("deptGrid").addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".dept-card");
  if (!card || card.classList.contains("is-empty")) return;
  e.preventDefault();
  showDeptSops(card.dataset.deptId);
});

// ---- Back button ----
document.getElementById("backBtn").addEventListener("click", showDeptGrid);

// ---- In-dept SOP search ----
document.getElementById("sopSearch").addEventListener("input", (e) => {
  if (!activeDeptId) return;
  renderDeptSops(activeDeptId, e.target.value.trim());
});

// ---- Video card clicks (lightbox) ----
document.addEventListener("click", (e) => {
  const card = e.target.closest("[data-video-id]");
  if (!card || e.target.closest(".video-yt-link")) return;
  openLightbox(card.dataset.videoId, card.dataset.videoTitle);
});

document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest("[data-video-id]");
  if (!card) return;
  e.preventDefault();
  openLightbox(card.dataset.videoId, card.dataset.videoTitle);
});

// ============================================================
// INIT
// ============================================================
renderDeptGrid();
renderTutorials();

document.getElementById("sopCount").textContent   = String(sops.length);
document.getElementById("deptCount").textContent  = String(departments.length);
document.getElementById("videoCount").textContent = String(tutorials.length);
document.getElementById("year").textContent       = String(new Date().getFullYear());
