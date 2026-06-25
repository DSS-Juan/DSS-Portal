// ============================================================
// DSS Portal v3 — SOP Detail Page Logic
// data.js must be loaded before this file.
// ============================================================

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(d) {
  if (!d) return "—";
  const parts = d.split("-");
  if (parts.length < 3) return d;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const m = parseInt(parts[1], 10) - 1;
  return `${months[m] || "?"} ${parseInt(parts[2], 10)}, ${parts[0]}`;
}

function hide(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  const orig = btn.textContent;
  btn.textContent = "Copied!";
  btn.style.color = "var(--green)";
  btn.style.borderColor = "var(--green)";
  setTimeout(() => {
    btn.textContent = orig;
    btn.style.color = "";
    btn.style.borderColor = "";
  }, 1200);
}

// Detect Windows file paths (e.g. P:\Folder\File.csv) and return
// only the copyable chips — no surrounding prose text.
const PATH_REGEX = /([A-Za-z]:\\[\w\s\-_.\\]+\.(?:csv|xlsx?|xlsm|xlsb|txt|pdf|docx?|xlam|accdb|json|xml|adm))/gi;

function extractPathChips(text) {
  PATH_REGEX.lastIndex = 0;
  let html  = "";
  let match;
  while ((match = PATH_REGEX.exec(text)) !== null) {
    const path = match[1];
    html += `<span class="inline-path"><code class="path-text">${escapeHtml(path)}</code><button class="path-copy-btn" type="button" data-path="${escapeHtml(path)}">Copy</button></span>`;
  }
  return html;
}

function main() {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get("sop");

  document.getElementById("year").textContent = String(new Date().getFullYear());

  const sop = (typeof sops !== "undefined") && sops.find(s => s.id === id);
  if (!sop) {
    document.getElementById("sopTitle").textContent = "SOP not found";
    document.getElementById("sopDesc").textContent  = "Return to the home page and select a department to browse SOPs.";
    document.getElementById("breadcrumbSop").textContent = "Not found";
    document.getElementById("downloadBar").style.display = "none";
    document.getElementById("sopSplit").style.display    = "none";
    return;
  }

  const dept = (typeof departments !== "undefined") && departments.find(d => d.id === sop.deptId);

  document.title = `${sop.sopCode} · ${sop.title} · DSS Portal`;

  if (dept) document.getElementById("breadcrumbDept").textContent = dept.name;
  document.getElementById("breadcrumbSop").textContent = sop.sopCode;

  document.getElementById("metaSopCode").textContent = sop.sopCode;
  const metaDeptEl = document.getElementById("metaDept");
  metaDeptEl.textContent = dept ? dept.name : "—";

  const statusEl = document.getElementById("metaStatus");
  const status   = sop.status || "Active";
  statusEl.textContent = status;
  statusEl.classList.add(status.toLowerCase().split(/[\s—–]+/)[0].replace(/[^a-z0-9-]/g, ""));

  document.getElementById("sopTitle").textContent = sop.title;
  document.getElementById("sopDesc").textContent  = sop.desc;

  // Download buttons
  const sopBtn = document.getElementById("downloadSopBtn");
  const qrgBtn = document.getElementById("downloadQrgBtn");
  if (sop.pdfPath) {
    sopBtn.href = sop.pdfPath;
    sopBtn.setAttribute("download", sop.pdfPath.split("/").pop());
  } else {
    sopBtn.style.display = "none";
  }
  if (sop.qrgPath) {
    qrgBtn.href = sop.qrgPath;
    qrgBtn.setAttribute("download", sop.qrgPath.split("/").pop());
  } else {
    qrgBtn.style.display = "none";
  }

  // Metadata strip
  document.getElementById("sopOwner").textContent   = sop.owner   || "—";
  document.getElementById("sopVersion").textContent  = sop.version || "—";
  document.getElementById("sopDate").textContent     = formatDate(sop.effectiveDate);

  // PDF embed
  if (sop.pdfPath) {
    const embed = document.getElementById("sopPdfEmbed");
    embed.src = sop.pdfPath;
    document.getElementById("pdfFallbackBtn").href = sop.pdfPath;
    embed.addEventListener("error", () => {
      embed.style.display = "none";
      document.getElementById("pdfFallback").style.display = "";
    });
  } else {
    document.getElementById("sopSplit").querySelector(".sop-pdf-panel").style.display = "none";
  }

  // Cadence
  if (sop.cadence) {
    document.getElementById("sopCadence").textContent = sop.cadence;
  } else { hide("cadenceSection"); }

  // Roles
  if (sop.roles && sop.roles.length > 0) {
    document.querySelector("#sopRoles tbody").innerHTML = sop.roles.map(r => `
      <tr>
        <td><strong>${escapeHtml(r.role)}</strong></td>
        <td>${escapeHtml(r.responsibility)}</td>
      </tr>
    `).join("");
  } else { hide("rolesSection"); }

  // Interactive checklist with inline path chips
  if (sop.steps && sop.steps.length > 0) {
    const stepsEl    = document.getElementById("sopSteps");
    const storageKey = `dss-checklist-${sop.id}`;
    const total      = sop.steps.length;

    stepsEl.innerHTML = sop.steps.map((step, i) => {
      // Extract only the path chips from detail — skip the full description text
      const pathChips = extractPathChips(step.detail || "");
      return `
        <label class="procedure-step" id="step-${i}">
          <input type="checkbox" class="step-check" data-step="${i}">
          <div class="step-indicator">${i + 1}</div>
          <div class="step-content">
            <div class="step-title">${escapeHtml(step.title)}</div>
            ${pathChips ? `<div class="step-paths">${pathChips}</div>` : ""}
          </div>
        </label>
      `;
    }).join("");

    // Copy path chips — delegated click handler
    stepsEl.addEventListener("click", (e) => {
      const btn = e.target.closest(".path-copy-btn");
      if (!btn) return;
      e.preventDefault();
      copyText(btn.dataset.path, btn);
    });

    function loadState() {
      try { return JSON.parse(localStorage.getItem(storageKey)) || Array(total).fill(false); }
      catch { return Array(total).fill(false); }
    }
    function saveState(states) { localStorage.setItem(storageKey, JSON.stringify(states)); }

    function updateProgress(states) {
      const done = states.filter(Boolean).length;
      document.getElementById("progressLabel").textContent = `${done} / ${total} steps`;
      const fill = document.getElementById("progressFill");
      fill.style.width = `${Math.round(done / total * 100)}%`;
      fill.style.background = done === total ? "var(--green)" : "var(--accent)";
    }

    function applyState(states) {
      states.forEach((checked, i) => {
        const label     = document.getElementById(`step-${i}`);
        const cb        = label && label.querySelector(".step-check");
        const indicator = label && label.querySelector(".step-indicator");
        if (!label || !cb || !indicator) return;
        cb.checked = checked;
        label.classList.toggle("done", checked);
        indicator.textContent = checked ? "✓" : String(i + 1);
      });
      updateProgress(states);
    }

    const states = loadState();
    applyState(states);

    stepsEl.addEventListener("change", (e) => {
      const cb = e.target.closest(".step-check");
      if (!cb) return;
      const i = parseInt(cb.dataset.step, 10);
      states[i] = cb.checked;
      document.getElementById(`step-${i}`).classList.toggle("done", cb.checked);
      saveState(states);
      updateProgress(states);
    });

    document.getElementById("resetBtn").addEventListener("click", () => {
      localStorage.removeItem(storageKey);
      states.fill(false);
      applyState(states);
    });

  } else { hide("procedureSection"); }

  // Notes
  if (sop.notes && sop.notes.length > 0) {
    document.getElementById("sopNotes").innerHTML = sop.notes.map(n => `<li>${escapeHtml(n)}</li>`).join("");
  } else { hide("notesSection"); }
}

main();
