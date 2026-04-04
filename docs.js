// ============================================================
// DSS Portal v2 — Docs Page Logic
// Reads from data.js  (data.js must be loaded first via HTML)
// ============================================================

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getDept(deptId) {
  return (typeof departments !== "undefined")
    ? departments.find(d => d.id === deptId) || null
    : null;
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-CA", {
      year: "numeric", month: "long", day: "numeric"
    });
  } catch {
    return dateStr;
  }
}

// ---- DOC CARD ----
function makeDocCard(doc) {
  const dept     = getDept(doc.deptId);
  const deptLabel = dept ? `${dept.icon} ${dept.name}` : "General";
  const steps    = (doc.steps || []).map(s => `<li>${escapeHtml(s)}</li>`).join("");
  const updated  = formatDate(doc.lastUpdated);

  return `
    <div class="doc-card">
      <div class="doc-card-header">
        <span class="doc-dept-badge">${escapeHtml(deptLabel)}</span>
        <h4>${escapeHtml(doc.title)}</h4>
        <p>${escapeHtml(doc.desc)}</p>
      </div>
      ${steps
        ? `<ol class="doc-steps">${steps}</ol>`
        : `<p style="padding:14px 20px; color:var(--muted); font-size:13px;">Steps not yet documented.</p>`
      }
      <div class="doc-updated">Last updated: ${updated}</div>
    </div>
  `;
}

// ---- RENDER ----
function renderDocs() {
  const grid = document.getElementById("docsGrid");
  const countEl = document.getElementById("docsCount");

  if (typeof docs === "undefined" || docs.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        No SOPs yet — add them to the <strong>docs</strong> array in
        <code style="font-size:12px;">data.js</code>.
      </div>
    `;
    if (countEl) countEl.textContent = "0 guides";
    return;
  }

  if (countEl) {
    countEl.textContent = `${docs.length} guide${docs.length !== 1 ? "s" : ""}`;
  }

  grid.innerHTML = docs.map(makeDocCard).join("");
}

// ---- INIT ----
document.getElementById("year").textContent = String(new Date().getFullYear());
renderDocs();
