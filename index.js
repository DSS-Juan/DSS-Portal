// ============================================================
// DSS Portal v3 — Homepage Logic
// Two views: department grid → department tools
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

function toolsForDept(deptId) {
  return tools.filter(t => t.deptId === deptId);
}

// ---- DEPARTMENT CARD ----
function makeDeptCard(dept) {
  const deptTools = toolsForDept(dept.id);
  const count     = deptTools.length;
  const isEmpty   = count === 0;

  const footerHTML = isEmpty
    ? `<span class="dept-card-count empty">No tools yet</span><div class="dept-card-arrow" style="opacity:0.3">→</div>`
    : `<span class="dept-card-count"><strong>${count}</strong> ${count === 1 ? "tool" : "tools"}</span><div class="dept-card-arrow">→</div>`;

  return `
    <div
      class="dept-card ${isEmpty ? "is-empty" : ""}"
      style="--dept-color: ${dept.color};"
      data-dept-id="${escapeHtml(dept.id)}"
      role="${isEmpty ? "presentation" : "button"}"
      tabindex="${isEmpty ? "-1" : "0"}"
      aria-label="Open ${escapeHtml(dept.name)}"
    >
      <span class="dept-card-icon">${dept.icon}</span>
      <div class="dept-card-name">${escapeHtml(dept.name)}</div>
      <div class="dept-card-desc">${escapeHtml(dept.desc)}</div>
      <div class="dept-card-footer">${footerHTML}</div>
    </div>
  `;
}

// ---- TOOL CARD ----
function makeToolCard(t) {
  const tags     = (t.tags || []).map(x => `<span class="tag">${escapeHtml(x)}</span>`).join("");
  const toolLink = `tool.html?tool=${encodeURIComponent(t.id)}`;

  return `
    <article class="tool-card">
      <div class="tool-card-meta">
        <span class="version-badge">${escapeHtml(t.version)}</span>
      </div>
      <h4>${escapeHtml(t.name)}</h4>
      <p>${escapeHtml(t.desc)}</p>
      <div class="tags">${tags}</div>
      <div class="card-actions">
        <a class="open-link" href="${toolLink}">Open →</a>
        <button class="btn-mini" type="button" data-copy-path="${escapeHtml(t.id)}">Copy path</button>
      </div>
    </article>
  `;
}

// ---- TUTORIAL CARD ----
function makeTutorialCard(v) {
  const dept      = departments.find(d => d.id === v.deptId);
  const deptLabel = dept ? `${dept.icon} ${dept.name}` : "";
  const tags      = (v.tags || []).map(x => `<span class="tag">${escapeHtml(x)}</span>`).join("");
  const hasVideo  = !!v.videoId;

  // Thumbnail URL — YouTube serves several resolutions:
  // maxresdefault.jpg (1280×720, may not exist for all videos)
  // hqdefault.jpg     (480×360, always exists)
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

  // Fallback: no video yet
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
  // Use video-grid class when there are actual video cards
  grid.className = "video-grid";
  grid.innerHTML = tutorials.map(makeTutorialCard).join("");
}

// ---- LIGHTBOX ----
function buildLightbox() {
  if (document.getElementById("lightboxOverlay")) return; // already built
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

  // Close on overlay click or button
  el.addEventListener("click", (e) => {
    if (e.target === el) closeLightbox();
  });
  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

function openLightbox(videoId, title) {
  buildLightbox();
  const overlay = document.getElementById("lightboxOverlay");
  const frame   = document.getElementById("lightboxFrame");
  const lbTitle = document.getElementById("lightboxTitle");

  // Autoplay when opened; rel=0 hides related videos; modestbranding=1 hides logo
  frame.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0&modestbranding=1&color=white`;
  lbTitle.textContent = title;

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  const overlay = document.getElementById("lightboxOverlay");
  const frame   = document.getElementById("lightboxFrame");
  if (!overlay) return;
  overlay.classList.remove("open");
  frame.src = "";   // stop video immediately
  document.body.style.overflow = "";
}

// ---- RENDER: tools for a department ----
function renderDeptTools(deptId, query = "") {
  const grid = document.getElementById("deptToolGrid");
  let deptTools = toolsForDept(deptId);

  if (query) {
    const q = query.toLowerCase();
    deptTools = deptTools.filter(t =>
      [t.name, t.desc, ...(t.tags || [])].join(" ").toLowerCase().includes(q)
    );
  }

  if (deptTools.length === 0) {
    grid.innerHTML = query
      ? `<div class="empty-state">No tools matched "<strong>${escapeHtml(query)}</strong>".</div>`
      : `<div class="empty-state">No tools in this department yet.</div>`;
    return;
  }

  grid.innerHTML = deptTools.map(makeToolCard).join("");
}

// ============================================================
// VIEW SWITCHING
// ============================================================
let activeDeptId = null;

const viewDepts = document.getElementById("view-depts");
const viewTools = document.getElementById("view-tools");

function showDeptGrid() {
  // Reset state
  activeDeptId = null;
  document.getElementById("toolSearch").value = "";

  // Animate out tools view, animate in dept grid
  viewTools.classList.add("hidden");
  viewDepts.classList.remove("hidden");

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showDeptTools(deptId) {
  const dept      = departments.find(d => d.id === deptId);
  if (!dept) return;

  const deptTools = toolsForDept(deptId);
  if (deptTools.length === 0) return; // Empty depts are not clickable

  activeDeptId = deptId;

  // Populate header
  document.getElementById("viewDeptIcon").textContent = dept.icon;
  document.getElementById("viewDeptName").textContent = dept.name;
  document.getElementById("viewDeptDesc").textContent = dept.desc;
  const count = deptTools.length;
  document.getElementById("viewDeptBadge").textContent =
    `${count} ${count === 1 ? "tool" : "tools"}`;

  // Render tools
  renderDeptTools(deptId);

  // Animate in tools view
  viewDepts.classList.add("hidden");
  viewTools.classList.remove("hidden");

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ---- Department card clicks ----
document.getElementById("deptGrid").addEventListener("click", (e) => {
  const card = e.target.closest(".dept-card");
  if (!card || card.classList.contains("is-empty")) return;
  showDeptTools(card.dataset.deptId);
});

// Keyboard accessibility for dept cards
document.getElementById("deptGrid").addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".dept-card");
  if (!card || card.classList.contains("is-empty")) return;
  e.preventDefault();
  showDeptTools(card.dataset.deptId);
});

// ---- Back button ----
document.getElementById("backBtn").addEventListener("click", showDeptGrid);

// ---- In-dept search ----
document.getElementById("toolSearch").addEventListener("input", (e) => {
  if (!activeDeptId) return;
  renderDeptTools(activeDeptId, e.target.value.trim());
});

// ---- Copy path (event delegation — works in both views) ----
document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-copy-path]");
  if (!btn) return;

  const toolId   = btn.getAttribute("data-copy-path");
  const tool     = tools.find(t => t.id === toolId);
  if (!tool) return;

  const pathText = Array.isArray(tool.path) ? tool.path.join("\n") : tool.path;
  try {
    await navigator.clipboard.writeText(pathText);
    btn.textContent = "Copied ✓";
    setTimeout(() => (btn.textContent = "Copy path"), 1000);
  } catch {
    alert("Copy failed — open the tool page to copy the path manually.");
  }
});

// ============================================================
// INIT
// ============================================================
renderDeptGrid();
renderTutorials();

// ---- Video card clicks (lightbox) ----
document.addEventListener("click", (e) => {
  const card = e.target.closest("[data-video-id]");
  // Don't intercept clicks on the "Watch on YouTube" link
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

document.getElementById("toolCount").textContent  = String(tools.length);
document.getElementById("deptCount").textContent  = String(departments.length);
document.getElementById("videoCount").textContent = String(tutorials.length);
document.getElementById("year").textContent       = String(new Date().getFullYear());
