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
    document.getElementById("copyPaths").style.display   = "none";
    document.getElementById("sopSplit").style.display    = "none";
    return;
  }

  const dept = (typeof departments !== "undefined") && departments.find(d => d.id === sop.deptId);

  // Page <title>
  document.title = `${sop.sopCode} · ${sop.title} · DSS Portal`;

  // Breadcrumb
  if (dept) document.getElementById("breadcrumbDept").textContent = dept.name;
  document.getElementById("breadcrumbSop").textContent = sop.sopCode;

  // Meta chips
  document.getElementById("metaSopCode").textContent = sop.sopCode;
  const metaDeptEl = document.getElementById("metaDept");
  metaDeptEl.innerHTML = dept ? `${dept.icon} ${escapeHtml(dept.name)}` : "—";
  const statusEl = document.getElementById("metaStatus");
  const status   = sop.status || "Active";
  statusEl.textContent = status;
  statusEl.classList.add(status.toLowerCase());

  // Hero content
  document.getElementById("sopTitle").textContent = sop.title;
  document.getElementById("sopDesc").textContent  = sop.desc;

  // ---- DOWNLOAD BUTTONS ----
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

  // ---- COPY PATH BOXES ----
  const base = window.location.origin + window.location.pathname.replace(/[^/]*$/, "");

  if (sop.pdfPath) {
    const pdfUrl = base + sop.pdfPath.replace("./", "");
    document.getElementById("copyPdfText").textContent = pdfUrl;
    document.getElementById("copyPdfBtn").addEventListener("click", (e) => copyText(pdfUrl, e.currentTarget));
  } else {
    hide("copyPdfRow");
  }

  if (sop.qrgPath) {
    const qrgUrl = base + sop.qrgPath.replace("./", "");
    document.getElementById("copyQrgText").textContent = qrgUrl;
    document.getElementById("copyQrgRow").style.display = "";
    document.getElementById("copyQrgBtn").addEventListener("click", (e) => copyText(qrgUrl, e.currentTarget));
  }

  const pageUrl = window.location.href;
  document.getElementById("copyLinkText").textContent = pageUrl;
  document.getElementById("copyLinkBtn").addEventListener("click", (e) => copyText(pageUrl, e.currentTarget));

  // ---- METADATA STRIP ----
  document.getElementById("sopOwner").textContent   = sop.owner   || "—";
  document.getElementById("sopVersion").textContent  = sop.version || "—";
  document.getElementById("sopDate").textContent     = formatDate(sop.effectiveDate);

  // ---- PDF VIEWER ----
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

  // ---- PURPOSE ----
  if (sop.purpose) {
    document.getElementById("sopPurpose").textContent = sop.purpose;
  } else {
    hide("purposeSection");
  }

  // ---- SCOPE ----
  if (sop.scope) {
    document.getElementById("sopScope").textContent = sop.scope;
  } else {
    hide("scopeSection");
  }

  // ---- DEFINITIONS ----
  if (sop.definitions && sop.definitions.length > 0) {
    document.getElementById("sopDefinitions").innerHTML = sop.definitions.map(d => `
      <div class="definition-item">
        <dt class="def-term">${escapeHtml(d.term)}</dt>
        <dd class="def-meaning">${escapeHtml(d.meaning)}</dd>
      </div>
    `).join("");
  } else {
    hide("definitionsSection");
  }

  // ---- ROLES ----
  if (sop.roles && sop.roles.length > 0) {
    document.querySelector("#sopRoles tbody").innerHTML = sop.roles.map(r => `
      <tr>
        <td><strong>${escapeHtml(r.role)}</strong></td>
        <td>${escapeHtml(r.responsibility)}</td>
      </tr>
    `).join("");
  } else {
    hide("rolesSection");
  }

  // ---- CADENCE ----
  if (sop.cadence) {
    document.getElementById("sopCadence").textContent = sop.cadence;
  } else {
    hide("cadenceSection");
  }

  // ---- INTERACTIVE CHECKLIST ----
  if (sop.steps && sop.steps.length > 0) {
    const stepsEl    = document.getElementById("sopSteps");
    const storageKey = `dss-checklist-${sop.id}`;
    const total      = sop.steps.length;

    stepsEl.innerHTML = sop.steps.map((step, i) => `
      <label class="procedure-step" id="step-${i}">
        <input type="checkbox" class="step-check" data-step="${i}">
        <div class="step-indicator">${i + 1}</div>
        <div class="step-content">
          <div class="step-title">${escapeHtml(step.title)}</div>
          ${step.detail ? `<div class="step-detail">${escapeHtml(step.detail)}</div>` : ""}
        </div>
      </label>
    `).join("");

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
        const label = document.getElementById(`step-${i}`);
        const cb    = label && label.querySelector(".step-check");
        if (!label || !cb) return;
        cb.checked = checked;
        label.classList.toggle("done", checked);
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

  } else {
    hide("procedureSection");
  }

  // ---- NOTES ----
  if (sop.notes && sop.notes.length > 0) {
    document.getElementById("sopNotes").innerHTML = sop.notes.map(n => `<li>${escapeHtml(n)}</li>`).join("");
  } else {
    hide("notesSection");
  }
}

main();
