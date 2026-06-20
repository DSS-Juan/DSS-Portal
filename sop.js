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
    return;
  }

  const dept = (typeof departments !== "undefined") && departments.find(d => d.id === sop.deptId);

  // Page <title>
  document.title = `${sop.sopCode} · ${sop.title} · DSS Portal`;

  // Breadcrumb
  const crumbDept = document.getElementById("breadcrumbDept");
  if (dept) {
    crumbDept.textContent = dept.name;
  }
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

  // Download buttons
  const sopBtn = document.getElementById("downloadSopBtn");
  const qrgBtn = document.getElementById("downloadQrgBtn");

  if (sop.pdfPath) {
    sopBtn.href     = sop.pdfPath;
    sopBtn.setAttribute("download", sop.pdfPath.split("/").pop());
  } else {
    sopBtn.style.display = "none";
  }

  if (sop.qrgPath) {
    qrgBtn.href     = sop.qrgPath;
    qrgBtn.setAttribute("download", sop.qrgPath.split("/").pop());
  } else {
    qrgBtn.style.display = "none";
  }

  // Metadata strip
  document.getElementById("sopOwner").textContent   = sop.owner   || "—";
  document.getElementById("sopVersion").textContent  = sop.version || "—";
  document.getElementById("sopDate").textContent     = formatDate(sop.effectiveDate);

  // Purpose
  if (sop.purpose) {
    document.getElementById("sopPurpose").textContent = sop.purpose;
  } else {
    hide("purposeSection");
  }

  // Scope
  if (sop.scope) {
    document.getElementById("sopScope").textContent = sop.scope;
  } else {
    hide("scopeSection");
  }

  // Definitions
  if (sop.definitions && sop.definitions.length > 0) {
    const defsEl = document.getElementById("sopDefinitions");
    defsEl.innerHTML = sop.definitions.map(d => `
      <div class="definition-item">
        <dt class="def-term">${escapeHtml(d.term)}</dt>
        <dd class="def-meaning">${escapeHtml(d.meaning)}</dd>
      </div>
    `).join("");
  } else {
    hide("definitionsSection");
  }

  // Roles & Responsibilities
  if (sop.roles && sop.roles.length > 0) {
    const tbody = document.querySelector("#sopRoles tbody");
    tbody.innerHTML = sop.roles.map(r => `
      <tr>
        <td><strong>${escapeHtml(r.role)}</strong></td>
        <td>${escapeHtml(r.responsibility)}</td>
      </tr>
    `).join("");
  } else {
    hide("rolesSection");
  }

  // Cadence
  if (sop.cadence) {
    document.getElementById("sopCadence").textContent = sop.cadence;
  } else {
    hide("cadenceSection");
  }

  // Procedure steps
  if (sop.steps && sop.steps.length > 0) {
    const stepsEl = document.getElementById("sopSteps");
    stepsEl.innerHTML = sop.steps.map((step, i) => `
      <div class="procedure-step">
        <div class="step-number">${i + 1}</div>
        <div class="step-content">
          <div class="step-title">${escapeHtml(step.title)}</div>
          ${step.detail ? `<div class="step-detail">${escapeHtml(step.detail)}</div>` : ""}
        </div>
      </div>
    `).join("");
  } else {
    hide("procedureSection");
  }

  // Notes & Exceptions
  if (sop.notes && sop.notes.length > 0) {
    const notesEl = document.getElementById("sopNotes");
    notesEl.innerHTML = sop.notes.map(n => `<li>${escapeHtml(n)}</li>`).join("");
  } else {
    hide("notesSection");
  }
}

main();
