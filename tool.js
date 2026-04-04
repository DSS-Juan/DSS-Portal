// ============================================================
// DSS Portal v2 — Tool Detail Page Logic
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

function makeTag(t) {
  return `<span class="tag">${escapeHtml(t)}</span>`;
}

function fillList(el, items) {
  if (!el) return;
  if (!items || items.length === 0) {
    el.innerHTML = `<li class="muted">Not documented yet.</li>`;
    return;
  }
  el.innerHTML = items.map(x => `<li>${escapeHtml(x)}</li>`).join("");
}

// Render an embedded YouTube player for a tutorial that has a videoId.
// Falls back to a card with a "Watch" link if no videoId.
function makeVideoPlayer(v) {
  if (v.videoId) {
    const tags = (v.tags || []).map(makeTag).join("");
    return `
      <div class="video-player-item">
        <div class="video-player-title">${escapeHtml(v.title)}</div>
        <div class="video-player-wrap">
          <iframe
            src="https://www.youtube.com/embed/${encodeURIComponent(v.videoId)}?rel=0&modestbranding=1&color=white"
            title="${escapeHtml(v.title)}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <div style="margin-top:10px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
          <div class="tags">${tags}</div>
          <a href="${escapeHtml(v.url)}" target="_blank" rel="noreferrer"
             style="font-size:12px; color:var(--accent); font-weight:600; text-decoration:none; display:inline-flex; align-items:center; gap:5px; white-space:nowrap;">
            ↗ Open in YouTube
          </a>
        </div>
      </div>
    `;
  }

  // Fallback: no video yet
  const tags = (v.tags || []).map(makeTag).join("");
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

function makeIssueCard(issue) {
  const problem = issue?.problem ? escapeHtml(issue.problem) : "—";
  const fix     = issue?.fix     ? escapeHtml(issue.fix)     : "—";
  return `
    <article class="issue-card">
      <h4>${problem}</h4>
      <p><strong>Fix:</strong> ${fix}</p>
    </article>
  `;
}

function main() {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get("tool");

  document.getElementById("year").textContent = String(new Date().getFullYear());

  // --- Tool not found ---
  const tool = (typeof tools !== "undefined") && tools.find(t => t.id === id);
  if (!tool) {
    document.getElementById("toolTitle").textContent = "Tool not found";
    document.getElementById("toolDesc").textContent  = "Return to the Tools page and try again.";
    document.getElementById("breadcrumbTool").textContent = "Not found";
    document.getElementById("toolPathBox").textContent    = "";
    document.getElementById("toolIssues").innerHTML =
      `<div class="card"><p class="muted">—</p></div>`;
    document.getElementById("toolVideoGrid").innerHTML =
      `<div class="card"><p class="muted">—</p></div>`;
    return;
  }

  // --- Department ---
  const dept     = (typeof departments !== "undefined") && departments.find(d => d.id === tool.deptId);
  const pathText = Array.isArray(tool.path) ? tool.path.join("\n") : tool.path;

  // Page <title>
  document.title = `${tool.name} · DSS Portal`;

  // Breadcrumb
  if (dept) {
    const crumbDept = document.getElementById("breadcrumbDept");
    crumbDept.textContent = dept.name;
    crumbDept.href = "index.html#tools";
  }
  document.getElementById("breadcrumbTool").textContent = tool.name;

  // Meta chips
  const metaDept = document.getElementById("metaDept");
  metaDept.innerHTML = dept
    ? `${dept.icon} ${escapeHtml(dept.name)}`
    : "Unknown Department";
  document.getElementById("metaVersion").textContent = tool.version || "—";

  // Hero content
  document.getElementById("toolTitle").textContent = tool.name;
  document.getElementById("toolDesc").textContent  = tool.desc;
  document.getElementById("toolTags").innerHTML    = (tool.tags || []).map(makeTag).join("");

  // Path
  document.getElementById("toolPathBox").textContent = pathText;

  // How-to-use
  fillList(document.getElementById("toolWhen"),    tool.when);
  fillList(document.getElementById("toolInputs"),  tool.inputs);
  fillList(document.getElementById("toolOutputs"), tool.outputs);

  const stepsEl = document.getElementById("toolSteps");
  if (tool.steps && tool.steps.length) {
    stepsEl.innerHTML = tool.steps.map(x => `<li>${escapeHtml(x)}</li>`).join("");
  } else {
    stepsEl.innerHTML = `<li class="muted">Not documented yet.</li>`;
  }

  // Common issues
  const issues = tool.issues || [];
  document.getElementById("toolIssues").innerHTML = issues.length
    ? issues.map(makeIssueCard).join("")
    : `<div class="card"><p class="muted">No issues documented yet.</p></div>`;

  // Tutorials / video players for this tool
  const toolVideos = (typeof tutorials !== "undefined")
    ? tutorials.filter(v => v.toolId === tool.id)
    : [];

  document.getElementById("tutorialCount").textContent = String(toolVideos.length);

  const videoGrid    = document.getElementById("toolVideoGrid");
  const videoSection = document.getElementById("toolVideoSection");

  if (toolVideos.length > 0) {
    // Show the section with embedded player(s)
    videoSection.style.display = "";
    videoGrid.innerHTML = `<div class="video-player-list">${toolVideos.map(makeVideoPlayer).join("")}</div>`;
  } else {
    // Hide the entire section — no clutter for tools without tutorials yet
    videoSection.style.display = "none";
  }

  // Copy path button
  document.getElementById("copyPathBtn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(pathText);
      const btn = document.getElementById("copyPathBtn");
      btn.textContent = "Copied ✓";
      setTimeout(() => (btn.textContent = "Copy path"), 1000);
    } catch {
      alert("Copy failed — you can select and copy the path manually from the box below.");
    }
  });
}

main();
