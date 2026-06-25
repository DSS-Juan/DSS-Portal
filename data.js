// ============================================================
// DSS Portal v3 — Single Source of Truth
// All data lives here. index.js reads departments + sops + tutorials.
// sop.js reads departments + sops.
// tool.js reads departments + tools + tutorials.
// ============================================================

const departments = [
  {
    id: "customer-success",
    name: "Customer Success",
    icon: "🤝",
    color: "#0071e3",
    desc: "Standard operating procedures for customer interactions, orders, payments, refunds, and account management."
  },
  {
    id: "operations",
    name: "Operations",
    icon: "⚙️",
    color: "#ff9f0a",
    desc: "Procedures for inventory management, Shopify updates, ordering, shipping, and warehouse operations."
  },
  {
    id: "sales",
    name: "Sales",
    icon: "💼",
    color: "#5e5ce6",
    desc: "Processes for account management, missing opportunities, and back-in-stock outreach."
  },
  {
    id: "automation",
    name: "Automation Platform",
    icon: "🤖",
    color: "#30d158",
    desc: "Technical documentation for building and maintaining DSS cloud automations and SOP workflows."
  }
];

// ---- SOPs ----
// Each SOP corresponds to a document in 04_Operations_SOPs.
// pdfPath / qrgPath are relative to the portal root.
const sops = [
  {
    "id": "auto-001-adding-automation",
    "deptId": "automation",
    "sopCode": "SOP-AUTO-001",
    "title": "Adding a New Automation",
    "desc": "Defines how to add a new automation to the DSS Automation Platform, covering all three trigger types (file drop, scheduled, and email) for both direct and AI-assisted authoring. Ensures every automation follows a consistent structure, manifest, and deployment pattern regardless of who built it.",
    "status": "Active",
    "version": "2.1",
    "effectiveDate": "2026-05-01",
    "owner": "David",
    "pdfPath": "./sops/SOP-AUTO-001_v2.1_Adding-a-new-automation.pdf",
    "qrgPath": null,
    "purpose": "This SOP defines how to add a new automation to the DSS Automation Platform. Read it end-to-end before generating any files. The platform supports three trigger types — file drops, scheduled runs, and incoming emails — and is authored by both developers and team members working with AI assistants. The default input pattern for any user-facing automation is email + Power Automate + SharePoint inbox folder, covered in section 6. Following this template ensures every automation looks the same, regardless of who built it.",
    "scope": "Applies to all automations running on the DSS Mac mini under user 'claude'. Authors include David, Juan, and any DSS team member building an automation with assistance from Claude Desktop or another AI assistant. Out of scope: cloud-hosted automations, third-party SaaS workflows, and any code that does not live in the automation-platform repository.",
    "definitions": [
      {
        "term": "manifest.yml",
        "meaning": "The required registration card for every automation. Tracks ownership, criticality, dependencies, and trigger configuration."
      },
      {
        "term": "file_drop trigger",
        "meaning": "A launchd WatchPaths trigger that fires when a file lands in a watched OneDrive folder."
      },
      {
        "term": "scheduled trigger",
        "meaning": "A launchd StartCalendarInterval trigger that fires at a configured calendar time (daily, weekly, or monthly)."
      },
      {
        "term": "email trigger",
        "meaning": "A trigger that fires when an email arrives at claude@digitalsmokesupplies.com with a recognized subject prefix. Can be implemented via Pattern A (Power Automate + SharePoint file_drop) or Pattern B (direct IMAP polling via email-watcher daemon)."
      },
      {
        "term": "Pattern A",
        "meaning": "The recommended email trigger pattern: Power Automate watches Outlook, saves attachments to a SharePoint inbox folder, OneDrive syncs the file to the mini, and a file_drop trigger fires."
      },
      {
        "term": "Pattern B",
        "meaning": "Advanced email trigger pattern using the email-watcher Python daemon that polls IMAP directly on the Mac mini. Used only when Power Automate cannot be used or sub-minute latency is required."
      },
      {
        "term": "notify-teams",
        "meaning": "Platform helper that posts an Adaptive Card to the DSS Automation Status or Review Teams channel. Accepts title, message, level (info/success/warning/error/review), and optional --file SharePoint URL."
      },
      {
        "term": "secret",
        "meaning": "Keychain wrapper helper. All entries are auto-prefixed with 'dss-'. Commands: secret get <name>, secret set <name>, secret delete <name>."
      },
      {
        "term": "DSS_* path constants",
        "meaning": "Shell environment variables exposed by common.sh that map to canonical OneDrive/SharePoint folder paths (e.g. DSS_HUB, DSS_INBOX, DSS_REVIEW, PLATFORM_LOGS, etc.)."
      },
      {
        "term": "review_required",
        "meaning": "Manifest field (true/false) that routes automation outputs to the DSS Automation > Review Teams channel for human approval before publishing to production folders."
      },
      {
        "term": "subject_prefix",
        "meaning": "Case-insensitive email subject prefix (e.g. 'SOP:', 'MEETING:') used by the email-watcher to dispatch incoming mail to the correct automation handler."
      },
      {
        "term": "from_filter",
        "meaning": "A regex of allowed sender email addresses enforced by the email-watcher before invoking a handler script. Minimum acceptable value: '@digitalsmokesupplies.com'."
      },
      {
        "term": "common.sh",
        "meaning": "Platform library script at $HOME/automation-platform/platform/lib/common.sh that must be sourced by every shell script. Provides PATH, DSS_* constants, and helper functions."
      },
      {
        "term": "email-watcher",
        "meaning": "Platform Python daemon that polls IMAP every 60 seconds for new mail at the service mailbox, matches subject prefixes, validates senders, and dispatches to the correct handler script (Pattern B)."
      }
    ],
    "roles": [
      {
        "role": "Platform Owner (David)",
        "responsibility": "Primary owner of the automation platform. Reviews and deploys AI-generated automations, approves exceptions to this SOP, maintains the platform README, and has final authority over all automations running on the Mac mini."
      },
      {
        "role": "Backup Owner (Juan)",
        "responsibility": "Backup platform owner. Reviews and deploys automations in David's absence. Co-approver on the DSS Automation > Review Teams channel."
      },
      {
        "role": "DSS Team Member (Automation Author)",
        "responsibility": "Any DSS team member who proposes a new automation. May author directly or use Claude Desktop to generate files following this SOP. Responsible for providing an accurate spec and submitting via the AUTOMATION: email trigger."
      },
      {
        "role": "Department Lead",
        "responsibility": "Co-approver on the DSS Automation > Review channel for automations relevant to their department. Acts on review-required files directly in SharePoint and replies in the Teams thread to mark approved or rejected."
      },
      {
        "role": "Service Identity (claude@digitalsmokesupplies.com)",
        "responsibility": "The service mailbox and Mac mini user account under which all automations run. Email triggers arrive at this address; Power Automate flows are authenticated as this account."
      }
    ],
    "cadence": "As needed",
    "steps": [
      {
        "title": "1. Understand the Platform Overview",
        "detail": "The DSS Automation Platform runs on a single Mac mini logged in as user 'claude', executing multiple automations from one git repo. All automations share the same infrastructure layer: secret management via macOS Keychain (with the dss- prefix); Teams notifications via the notify-teams helper; triggers via launchd (file drops, scheduled) plus the email-watcher daemon (incoming emails); data storage via SharePoint Data Hub, OneDrive-synced to the mini; status visibility via DSS Automation > Status Teams channel; files awaiting human approval routed to DSS Automation > Review Teams channel. Reference paths: Code: /Users/claude/automation-platform/, Data: ~/dss-hub/ (symlinks into OneDrive-synced SharePoint), GitHub: https://github.com/DSS-Distro/automation-platform."
      },
      {
        "title": "2. Determine Authoring Mode",
        "detail": "Any DSS team member can propose and draft a new automation. Two authoring modes are supported: (1) Direct authoring — David or Juan write code into the repo and deploy. (2) AI-assisted authoring — a team member describes the automation to Claude Desktop, which generates files following this SOP; output is submitted to the review queue and deployed by David or Juan. All AI-generated automations must pass review before launchd loads them. When using Claude Desktop, attach this SOP PDF (or paste its contents) at the start of the conversation as context. Section 13 covers the end-to-end Claude Desktop authoring flow."
      },
      {
        "title": "3. Create the Folder Structure",
        "detail": "Every automation is a self-contained folder under automations/ with the following structure. The manifest.yml registration card is required; everything else is optional but follows the conventions below:\n\nautomations/<your-automation-name>/\n  manifest.yml            <- registration card (required)\n  bin/                    <- shell scripts\n    run.sh\n    ...\n  prompts/                <- Claude prompts as markdown (if used)\n    *.md\n  launchd/                <- one plist per trigger (file/scheduled only)\n    com.dss.automation.<name>.plist\n  README.md               <- what + why"
      },
      {
        "title": "4. Create manifest.yml",
        "detail": "Every automation must include a manifest.yml at its root. This is the registration card the platform uses to track ownership, criticality, dependencies, and trigger configuration. Required fields:\n\nname: <automation-name>\ndescription: <one sentence>\nowner: <email>\nbackup_owner: <name or email>\ncriticality: low | medium | high\ntrigger:\n  type: file_drop | scheduled | email\n  # one of:\n  watch_path: <absolute path>          # if file_drop\n  cron: \"0 8 * * 2\"                    # if scheduled\n  subject_prefix: \"SOP:\"               # if email\n  from_filter: \"@digitalsmokesupplies.com\"  # if email\nsecrets:\n  - <keychain-entry-name-without-dss-prefix>\ninputs:\n  - <path>\noutputs:\n  - <path>\nreview_required: true | false          # routes outputs to Review channel"
      },
      {
        "title": "5. Choose and Configure the Trigger Type",
        "detail": "Pick exactly one trigger type per automation. (5.1) File-drop trigger: fires when a file lands in a watched OneDrive folder; implemented via launchd WatchPaths (see section 9); use the REAL OneDrive path, not the symlinked ~/dss-hub/ path; example use: meeting transcripts dropped into Inbox, vendor reports auto-imported. (5.2) Scheduled trigger: fires at a calendar time (daily, weekly, monthly); implemented via launchd StartCalendarInterval (see section 9); example use: weekly inventory pull every Tuesday 8am, end-of-day sales summary. (5.3) Email trigger: fires when an email arrives at the service mailbox with a recognized subject prefix; two patterns — Pattern A (RECOMMENDED, Power Automate + SharePoint, see section 6) or Pattern B (advanced, email-watcher IMAP daemon, see section 10); service mailbox: claude@digitalsmokesupplies.com; example use: meeting transcripts, SOP requests, customer email forwarding, report requests. Reserved subject prefixes (case-insensitive): SOP: (generate/update an SOP), AUTOMATION: (submit new automation for review), MEETING: (process meeting transcript), REPORT: (generate a report), FORWARD: (forwarded customer email). New prefixes must be added to this SOP and to the email-watcher router config before the automation is deployed."
      },
      {
        "title": "6. Set Up Power Automate Input Bridge (for Email Triggers — Pattern A)",
        "detail": "This is the standard pattern for any automation that receives email as input. Power Automate watches the service mailbox, saves attachments to a SharePoint inbox folder, OneDrive sync brings the file to the mini, and a file_drop trigger picks it up. End-to-end flow: User sends email → claude@digitalsmokesupplies.com → Power Automate flow (subject filter) → SharePoint /06_AI_Workspace/Inbox/<automation>/ → OneDrive sync to Mac mini → launchd file_drop trigger → automation runs.\n\nInbox folder convention: each email-triggered automation owns one subfolder under Shared Documents/06_AI_Workspace/Inbox/<automation-name>/. The folder must exist in SharePoint before the Power Automate flow runs — Power Automate will not auto-create missing parent folders.\n\nPower Automate flow setup steps:\nBefore you start: confirm the destination folder exists in SharePoint; note the SharePoint Site URL; sign into make.powerautomate.com as claude@digitalsmokesupplies.com.\nStep 1 — Create the flow: Click + Create → Automated cloud flow; name it '<Automation> attachment to SharePoint'; trigger: 'When a new email arrives (V3)' (Office 365 Outlook); click Create.\nStep 2 — Configure the trigger (Show advanced options): Folder: Inbox, To: claude@digitalsmokesupplies.com, Subject Filter: <YOUR PREFIX>: (e.g. SALES MEETING:), Importance: Any, Only with Attachments: Yes, Include Attachments: Yes.\nStep 3 — Add the loop: Click + New step; choose Apply to each (Control connector); Input field: open Dynamic Content panel → click Attachments.\nStep 4 — Add the SharePoint write action INSIDE the loop using 'Send an HTTP request to SharePoint' (not 'Create file'): Site Address: https://<tenant>.sharepoint.com/sites/<site>; Method: POST; Uri: _api/web/GetFolderByServerRelativeUrl('/sites/<site>/Shared Documents/...path.../<automation>')/Files/add(url='@{items('Apply_to_each')?['Name']}', overwrite=true); Headers: Accept: application/json;odata=verbose, Content-Type: application/octet-stream; Body: Attachments Content (from dynamic content, in loop).\nStep 5 — Test: Save → Test → Manually → Test; send an email to claude@digitalsmokesupplies.com with matching subject prefix and a small attachment; within ~30 seconds the run history should show steps progressing; confirm the file appears in the SharePoint destination folder.\n\nCommon errors and fixes: 'Server relative urls must start with SPWeb.ServerRelativeUrl' — Site Address and path inside GetFolderByServerRelativeUrl don't match; Folder not found / 404 — parent folders must exist, create them in SharePoint first; Access denied — grant claude@ edit permission on the destination library; Trigger never fires — confirm Subject Filter is exact (no leading space, includes the colon) and Only with Attachments is Yes; File saves empty — use Attachments Content (per-item, inside the loop), not Attachments (the array).\n\nCloning for new automations: export the working flow, re-import under a new name, change only Subject Filter (trigger) and destination path inside the Uri."
      },
      {
        "title": "7. Write the Shell Script(s)",
        "detail": "Every shell script under bin/ must: source common.sh first (provides PATH and DSS_* path constants); use 'set -uo pipefail' for safer scripts (do NOT use 'set -e' — handle errors explicitly); use notify-teams for all status (success, failure, info, review); log to $PLATFORM_LOGS/<automation>/<task>-<date>-<ts>.log; quote all path variables (paths contain spaces because of SharePoint folder names); handle empty input gracefully — exit cleanly when there is nothing to do; for files synced via OneDrive, wait for size stability before reading; move processed inputs to processed/ subfolder to prevent re-runs.\n\nStandard template (file-drop / scheduled triggers):\n#!/usr/bin/env bash\nset -uo pipefail\nsource \"$HOME/automation-platform/platform/lib/common.sh\"\nLOG_DIR=\"$PLATFORM_LOGS/<your-automation-name>\"\nmkdir -p \"$LOG_DIR\"\n# ... your logic ...\nnotify-teams \"Title\" \"Detail message\" success\n\nFor email-triggered automations (Pattern B), the script is invoked by the email-watcher with four arguments: $1 = EMAIL_BODY (path to email body text file), $2 = ATTACHMENTS (path to attachments folder, may be empty), $3 = SENDER (sender email address), $4 = SUBJECT (full subject line). End the script with: notify-teams \"Output ready\" \"...\" review --file <sharepoint-url>"
      },
      {
        "title": "8. Use Available Platform Helpers",
        "detail": "notify-teams: posts an Adaptive Card to the DSS Automation Status or Review channel. Syntax: notify-teams <title> <message> [level] [--file <sharepoint-url>]. Levels: info | success | warning | error | review (default: info). 'review' routes the card to the Review channel for human approval. '--file' attaches a clickable SharePoint URL to the card. File references in Teams notifications must always be clickable SharePoint https://...sharepoint.com/... links — never local /Users/claude/Library/CloudStorage/... paths.\n\nsecret: Keychain wrapper (all entries auto-prefixed with 'dss-'). Commands: 'secret get <name>' (prints value), 'secret set <name>' (prompts for value, stores), 'secret delete <name>' (removes).\n\nPath constants from common.sh: DSS_HUB=~/dss-hub, DSS_MASTER_DATA=$DSS_HUB/00_Master_Data, DSS_SALES=$DSS_HUB/01_Sales, DSS_INVENTORY=$DSS_HUB/02_Inventory, DSS_PROCUREMENT=$DSS_HUB/03_Procurement, DSS_OPERATIONS_SOPS=$DSS_HUB/04_Operations_SOPs, DSS_MARKETING=$DSS_HUB/05_Marketing, DSS_AI_WORKSPACE=$DSS_HUB/06_AI_Workspace, DSS_TEMPLATES=$DSS_HUB/07_Templates, DSS_ARCHIVE=$DSS_HUB/99_Archive, DSS_INBOX=$DSS_AI_WORKSPACE/Inbox, DSS_REVIEW=$DSS_AI_WORKSPACE/Review, DSS_APPROVED=$DSS_AI_WORKSPACE/Approved, DSS_AI_LOGS=$DSS_AI_WORKSPACE/Logs, DSS_STATUS=$DSS_AI_WORKSPACE/Status, DSS_STATE=$DSS_AI_WORKSPACE/State, PLATFORM_ROOT=$HOME/automation-platform, PLATFORM_LOGS=$PLATFORM_ROOT/runtime/logs."
      },
      {
        "title": "9. Configure the launchd Plist (file-drop and scheduled triggers only)",
        "detail": "ProgramArguments must start with /bin/bash explicitly — do not rely on the script's shebang. macOS TCC needs to identify the binary holding Full Disk Access permission; going through /usr/bin/env makes responsible-process tracking ambiguous and the script will be blocked from reading OneDrive folders. Correct pattern:\n<key>ProgramArguments</key>\n<array>\n  <string>/bin/bash</string>\n  <string>/Users/claude/automation-platform/automations/<name>/bin/run.sh</string>\n</array>\n\nFor file-drop (WatchPaths): use the REAL OneDrive path, not the symlinked ~/dss-hub/ path. The real path is: /Users/claude/Library/CloudStorage/OneDrive-VapeurExpress/DSS Data Hub - <NN>_<Folder>/...\n\nFor scheduled (StartCalendarInterval):\n<key>StartCalendarInterval</key>\n<dict>\n  <key>Weekday</key><integer>2</integer>  <!-- 0=Sun, 1=Mon, ..., 6=Sat -->\n  <key>Hour</key><integer>8</integer>\n  <key>Minute</key><integer>0</integer>\n</dict>\n\nEmail-triggered automations do NOT ship a launchd plist — the email-watcher daemon owns the plist.\n\nInstall commands (file-drop / scheduled only):\ncp automations/<name>/launchd/com.dss.automation.<name>.plist ~/Library/LaunchAgents/\nlaunchctl bootout \"gui/$(id -u)/com.dss.automation.<name>\" 2>/dev/null || true\nlaunchctl bootstrap \"gui/$(id -u)\" ~/Library/LaunchAgents/com.dss.automation.<name>.plist"
      },
      {
        "title": "10. Configure Direct IMAP Integration (Pattern B — advanced, email triggers only)",
        "detail": "Use Pattern B only when Power Automate cannot be used — e.g. integrations with non-Microsoft mail systems, or when sub-minute latency is required (Power Automate has a ~30–60 second polling lag). When trigger type is email and Pattern B is in use, the launchd plist is owned by the email-watcher daemon, not the automation. The automation provides only the handler script and manifest fields.\n\nRequired manifest fields: trigger.subject_prefix (case-insensitive subject line prefix, e.g. 'SOP:'), trigger.from_filter (regex of allowed sender addresses, minimum '@digitalsmokesupplies.com'), review_required (true if outputs must be approved before being saved to production folders).\n\nHandler responsibilities: validate sender — if from_filter rejects, exit silently with a Teams warning notification including the sender address; process the email body and any attachments from the path provided in $2; write outputs to a temporary location, then post a notify-teams card to the Review channel with a SharePoint link if review is required; if no review is needed, write directly to the appropriate DSS_* folder and post to the Status channel; on success, the email-watcher moves the source email to the processed/ folder automatically — do not move it yourself.\n\nEmail-watcher dispatch logic: (1) Poll IMAP every 60 seconds for new mail in claude@digitalsmokesupplies.com. (2) Match the subject prefix (case-insensitive) against each automation's manifest. (3) Validate the sender against the matching automation's from_filter. (4) Save email body to a temp file, save attachments to $DSS_INBOX/<automation>/<message-id>/. (5) Invoke the handler with body, attachments folder, sender, subject as arguments. (6) On exit code 0, move the source email to processed/; otherwise leave for retry."
      },
      {
        "title": "11. Manage the Review Workflow",
        "detail": "Any automation producing a file for human consumption routes through the review workflow. Two Teams channels are involved: DSS Automation > Status (operational notifications — success, failure, warnings; read-only by the team) and DSS Automation > Review (files awaiting human approval; approvers: David, Juan, plus the relevant department lead).\n\nReview-required outputs (set review_required: true): SOPs and policy documents; reports going to external parties; customer-facing communications; anything modifying production master data.\n\nDirect-publish outputs (set review_required: false): internal status reports; meeting notes; backup archives and logs.\n\nUse the 'review' level on notify-teams to route to the Review channel:\nnotify-teams \"SOP draft ready for approval\" \"Generated from SOP: email from david@\" review --file https://...sharepoint.com/.../draft.pdf\n\nApprovers act on the file directly in SharePoint and reply in the Teams thread to mark approved or rejected. Approved files are moved by the platform to the appropriate DSS_* folder. Rejected files stay in Review with a comment for the author."
      },
      {
        "title": "12. Configure macOS Permissions (one-time per Mac mini)",
        "detail": "Required for any automation that reads or writes OneDrive folders: (1) Open System Settings → Privacy & Security → Full Disk Access. (2) Add /bin/bash (use Cmd+Shift+G in the file picker to type the path). (3) Toggle the entry on. Without this, launchd-spawned scripts get 'Operation not permitted' errors when accessing OneDrive-synced folders. The email-watcher daemon also requires this entry."
      },
      {
        "title": "13. Author an Automation via Claude Desktop",
        "detail": "Any DSS team member can author an automation with help from Claude Desktop. This process keeps every AI-generated automation aligned to this SOP regardless of who built it. Steps: (1) Open a new conversation in Claude Desktop. (2) Attach this SOP PDF as the first message. Add: 'Generate a new automation following this SOP. Specs below.' (3) Provide the spec: name (kebab-case), one-sentence description, trigger type (file_drop / scheduled / email) with details, inputs, outputs, required secrets, criticality (low/medium/high), and review_required (true/false). (4) Claude generates manifest.yml, bin/run.sh, launchd plist (if applicable), and README.md. (5) Save the output as a folder on your computer. (6) Email the folder (zipped) to claude@digitalsmokesupplies.com with subject 'AUTOMATION: <automation-name>'. (7) The email-watcher routes the submission into the Review channel. David or Juan reviews, then deploys."
      },
      {
        "title": "14. Follow the Git Workflow",
        "detail": "All automations live in the single automation-platform repository. Branch off main for non-trivial changes. Commit messages follow the format: <scope>: <what>. Example: meeting-automation: fix /bin/bash invocation. The runtime/ directory is gitignored — never commit logs, state, or hashes. Push to GitHub for backup."
      },
      {
        "title": "15. Run the Testing Checklist",
        "detail": "Before going live, verify each of the following: (1) Manual run from Terminal: ./bin/run.sh && echo OK. (2) For file/scheduled triggers: launchctl kickstart fires successfully. (3) For email triggers: send a test email matching subject_prefix from a from_filter address; verify handler invokes, output appears in Review or Status, source email moves to processed/. (4) Real trigger fires (file drop, scheduled time, or live email). (5) Teams Status or Review channel receives the expected notification. (6) Any file referenced in a Teams notification opens directly when clicked from the card. (7) runtime/logs/<name>/*.err.log is clean. (8) Failure scenarios (missing input, broken auth, rejected sender) produce clear error notifications. (9) Idempotency: running twice on the same input does not duplicate work."
      },
      {
        "title": "16. Avoid Common Pitfalls",
        "detail": "Known pitfalls to avoid: Using #!/usr/bin/env bash and relying on it for launchd invocation — TCC blocks file access; using ~/dss-hub/ paths in plist WatchPaths — may not trigger; not waiting for OneDrive sync stability — reading half-synced files; forgetting to quote variables — fails on paths with spaces; not handling the empty-inbox case — script crashes on first launchd-empty-trigger; storing secrets in .env files — use Keychain via the secret command instead; posting osascript notifications — invisible on a headless Mac mini, use notify-teams; posting filenames or local paths to Teams without a clickable SharePoint URL. Power Automate specific: Site Address and path inside GetFolderByServerRelativeUrl don't match; HTTP action placed outside the Apply to each loop; destination SharePoint folder doesn't exist; subject filter typo — trigger never fires; File saves empty — Body field uses the array instead of per-item Attachments Content. Email-watcher (Pattern B) specific: subject_prefix not matching exactly (typos, missing colon); missing or overly permissive from_filter — security risk."
      },
      {
        "title": "17. Know Where to Look When Something Breaks",
        "detail": "Debugging locations in order: Teams Status channel — should show what failed; Power Automate run history (make.powerautomate.com → My flows → the flow → 28-day history) — shows every trigger fire and which step failed; SharePoint inbox folder — if the file isn't there, the issue is upstream of the mini; runtime/logs/<name>/*.err.log — recent script errors on the mini; runtime/logs/email-watcher/*.log — IMAP and dispatch errors (Pattern B only); launchctl list | grep <name> — agent status (PID 0 means clean exit; non-zero means crashed); launchctl print gui/$(id -u)/<label> — full agent state; IMAP auth errors — check Keychain entry: secret get email-watcher-pass (Pattern B only)."
      },
      {
        "title": "18. Owner Contacts",
        "detail": "Platform owner: David — david@digitalsmokesupplies.com. Backup owner: Juan. Service identity: claude@digitalsmokesupplies.com (also the email trigger inbox). Mac mini access: SSH or Screen Sharing (request credentials from platform owner). GitHub repository: github.com/DSS-Distro/automation-platform (private). Teams channels: DSS Automation > Status, DSS Automation > Review."
      },
      {
        "title": "19. Non-Compliance Consequences",
        "detail": "Automations that do not follow this SOP risk being silently disabled, blocked by macOS TCC, or producing data inconsistencies that affect downstream systems. Specific consequences: storing secrets outside Keychain — removed from platform on detection; posting notifications outside standard Teams channels — treated as unsupported tool; posting file references to Teams without a clickable SharePoint URL — flagged at code review, must remediate before re-enabling; writing to data folders without using DSS_* path constants — rejected at code review; running without a manifest.yml — considered untracked and will be disabled; email-triggered with missing from_filter — treated as a security incident and disabled immediately. Any automation operating without notification visibility, or modifying production data without owner approval, will be unloaded from launchd (or de-registered from the email-watcher) and require a documented review before re-enabling."
      },
      {
        "title": "20. Document and Approve Exceptions",
        "detail": "Exceptions to this SOP must be documented and approved by the platform owner before deployment. Acceptable grounds: one-off automations for limited-duration projects (under 30 days), provided they still emit Teams notifications and are tracked in a temporary entry; external-vendor scripts that cannot be modified to source common.sh — must be wrapped by a compliant launcher script; experimental automations during platform-engineering work, isolated to a dedicated experimental/ folder and never scheduled in production launchd. All exceptions must be recorded in the platform README under an 'Exceptions' section with the date, owner, automation name, and intended end date."
      }
    ],
    "notes": [
      "Version 2.1 added Section 6 (Power Automate input bridge) as the recommended pattern for email-triggered automations. Pattern B (Python email-watcher daemon, Section 10) is reframed as advanced, retained only for non-Microsoft mail or sub-minute latency needs.",
      "Email triggers must verify the sender. The from_filter regex in manifest.yml is enforced by the email-watcher before the handler runs. Without a valid filter, anyone could trigger your automation. The minimum acceptable filter is '@digitalsmokesupplies.com'. Missing from_filter is treated as a security incident and the automation is disabled immediately.",
      "launchd plist ProgramArguments MUST start with /bin/bash explicitly — never rely on the script shebang (#!/usr/bin/env bash). macOS TCC requires the binary to be identified; using /usr/bin/env blocks OneDrive folder access.",
      "WatchPaths in launchd plists must use the REAL OneDrive path (/Users/claude/Library/CloudStorage/OneDrive-VapeurExpress/DSS Data Hub - <NN>_<Folder>/...), not the symlinked ~/dss-hub/ path. Symlink resolution can interfere with launchd file-system event monitoring.",
      "All Teams notifications that reference any file (input, output, attachment, log) must include a clickable SharePoint URL (https://...sharepoint.com/...). Plain filenames, local OneDrive-synced paths, or text-only mentions are not acceptable.",
      "The Power Automate 'Send an HTTP request to SharePoint' action must be placed INSIDE the 'Apply to each' loop, and the Body must use 'Attachments Content' (per-item dynamic content), not the 'Attachments' array. The destination SharePoint folder must exist before the flow runs — Power Automate will not auto-create missing parent folders.",
      "New email subject prefixes must be added to this SOP AND to the email-watcher router config before the automation is deployed. Currently reserved prefixes: SOP:, AUTOMATION:, MEETING:, REPORT:, FORWARD:",
      "macOS Full Disk Access must be granted to /bin/bash (one-time per Mac mini) via System Settings → Privacy & Security → Full Disk Access. Without this, launchd-spawned scripts receive 'Operation not permitted' errors on OneDrive folders.",
      "All automations must have a manifest.yml. Automations running without a manifest.yml are considered untracked and will be disabled.",
      "The runtime/ directory is gitignored. Never commit logs, state files, or hashes to the automation-platform repository.",
      "AI-assisted authoring flow: attach this SOP PDF to Claude Desktop, provide the spec, receive generated files, zip and email to claude@digitalsmokesupplies.com with subject 'AUTOMATION: <name>'. David or Juan reviews and deploys — AI-generated automations must pass review before launchd loads them.",
      "CONFIDENTIAL — INTERNAL USE ONLY. Document is branded DSS Distro — Vapes & Snacks, Montreal, QC."
    ]
  },
  {
    "id": "auto-002-sop-drafting",
    "deptId": "automation",
    "sopCode": "SOP-AUTO-002",
    "title": "SOP Drafting Workflow",
    "desc": "Describes how to draft a new internal SOP using the AI-assisted workflow. The workflow takes a screen-recorded transcript and screenshots as inputs and produces a branded, editable Word document that can be reviewed, refined, and published as a final PDF.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-05-01",
    "owner": "Operations Owner",
    "pdfPath": "./sops/SOP-AUTO-002_SOP_drafting_workflow.pdf",
    "qrgPath": null,
    "purpose": "This SOP describes how to draft a new internal SOP using the AI-assisted workflow. The workflow takes a screen-recorded transcript and screenshots as inputs and produces a branded, editable Word document that can be reviewed, refined, and published as a final PDF.",
    "scope": "Applies to anyone at DSS Distro creating a new SOP, policy, or handoff document. Out of scope: editing existing approved documents (handled directly in SharePoint with version control), and external-facing documents intended for customers or suppliers.",
    "definitions": [
      {
        "term": "Transcript",
        "meaning": "A Word document containing the auto-transcribed narration of a screen recording. Generated by iOS Voice Memos or an equivalent tool."
      },
      {
        "term": "Action screenshot",
        "meaning": "A screen capture showing a specific step in the process being documented. Named to reference the action it shows."
      },
      {
        "term": "Status channel",
        "meaning": "The DSS Automation channel in Microsoft Teams. Posts automated notifications when an SOP submission is received and when the draft is ready."
      },
      {
        "term": "AI workspace",
        "meaning": "The SharePoint folder structure where SOP drafts live during review and approval. Located in Data Hub > 06 AI Workspace."
      }
    ],
    "roles": [
      {
        "role": "Process Owner",
        "responsibility": "Records the screen capture and narration, prepares screenshots, and submits the package by email. Reviews and approves the generated draft."
      },
      {
        "role": "Operations Owner",
        "responsibility": "Final sign-off on any SOP affecting cross-department processes. Approves exceptions and resolves disagreements on content."
      },
      {
        "role": "Automation Platform",
        "responsibility": "Receives email submissions, generates the draft .docx, posts status notifications, watches for approval, converts approved drafts to PDF, publishes the final file."
      }
    ],
    "cadence": "As needed",
    "steps": [
      {
        "title": "6.1 Capture the Process",
        "detail": "1. Identify the process to be documented and walk through it once end to end before recording the narration, to confirm you have all the access and tools you need. 2. On your iPhone, open Voice Memos and start a new recording. Voice Memos auto-transcribes on iOS 18 and later. 3. Walk through the process while narrating each step out loud. Cover what you click, why you click it, what to look for in the result, and any exceptions or judgement calls you make as you go. 4. As you complete each step, take a screenshot of the relevant screen. Name each screenshot to describe the action it shows, prefixed with a sequence number. Example: 01_open_erply_sales.png, 02_select_international_customers.png, 03_run_item_sales_by_product.png. 5. Stop the recording when the process is complete. Export the Voice Memo transcription as a Word document. 6. Save the transcript and all screenshots in a single folder on your computer."
      },
      {
        "title": "6.2 Submit by Email",
        "detail": "1. Compose a new email to claude@digitalsmokesupplies.com. 2. The subject line must start with SOP followed by the department and the topic, separated by hyphens. Example: SOP - Operations - Flavour ingredient ordering. 3. Leave the email body empty. The automation reads the transcript and screenshots only — anything in the body is ignored. 4. Attach the transcript Word document and all action screenshots. Do not zip them — attach as individual files. 5. Send the email."
      },
      {
        "title": "6.3 Watch for the Receipt Notification",
        "detail": "Within a few minutes of sending, a notification will post in the DSS Automation channel on Teams confirming the submission was received and draft generation has started. Wait for the second notification before checking SharePoint."
      },
      {
        "title": "6.4 Review the Draft",
        "detail": "1. When the second notification posts (draft ready), open the SharePoint link from the notification or navigate to Data Hub > 06 AI Workspace > Review SOP draft. 2. Open the .docx file. Read it through end to end, comparing against your original transcript and the actual process. 3. Make corrections directly in the Word document. Common edits: fixing inferred details (timelines, thresholds, role names), adding missing exceptions, tightening unclear language. 4. Verify the screenshots are placed at the correct steps and the captions accurately describe each one. 5. Save the file in place. Do not rename it — the automation tracks files by name."
      },
      {
        "title": "6.5 Approve and Publish",
        "detail": "1. Once you are satisfied with the draft, move the file from 06 AI Workspace > Review SOP draft to 06 AI Workspace > Approved > SOP drafts. 2. The automation detects the move, converts the .docx to PDF, publishes the PDF to its final location, and posts a confirmation notification in the status channel. 3. After publication, the .docx remains in the Approved > SOP drafts folder as the source of truth for any future revisions."
      }
    ],
    "notes": [
      "The full cycle from submission to published PDF takes roughly 10 to 30 minutes of active work, plus automation processing time between steps.",
      "Prerequisites: DSS email account with access to send to claude@digitalsmokesupplies.com; Membership in the DSS Automation channel on Microsoft Teams; Access to the Data Hub SharePoint site, specifically the 06 AI Workspace folder; An iPhone with iOS 18 or later for Voice Memos with auto-transcription.",
      "Status notifications reference — 'SOP submission received': Email and attachments arrived; draft generation has started; next step is to wait for the next notification. 'SOP draft ready': Word draft is in the Review SOP draft folder; next step is to open the file in SharePoint and review. 'SOP published': Approved Word file has been converted to PDF and published; no action required — share the published PDF link as needed. 'SOP submission failed': The automation could not process the email (common causes: missing attachments, unreadable transcript format); next step is to resubmit with corrected attachments.",
      "Folder reference — Submission: Email to claude@digitalsmokesupplies.com. Review: Data Hub > 06 AI Workspace > Review SOP draft. Approval: Data Hub > 06 AI Workspace > Approved > SOP drafts. Final published PDF: Data Hub > 04 Operation_SOPs.",
      "Troubleshooting — No receipt notification within 10 minutes: Check email address and attachments; if still not posted contact the Operations Owner. Draft is missing key steps: Transcript was likely incomplete or audio was unclear; rerecord and resubmit or edit directly in SharePoint. Screenshots placed at wrong steps: Automation matches screenshots by filename; rename descriptively and resubmit or move manually in the Word draft. File cannot be moved out of Review SOP draft: Confirm edit permissions on 06 AI Workspace folder; contact Operations Owner if access needed. Published PDF does not appear after approval: Confirm the file was moved (not copied) to Approved > SOP drafts — automation only triggers on a move.",
      "Non-Compliance: Skipping the review step and approving a draft without reading it produces documents that may contain inferred, inaccurate, or incomplete information. Submitting incomplete transcripts produces drafts that are missing critical steps and may mislead the next person who follows the SOP. Bypassing the approval folder — for example, manually publishing a draft to the final location — breaks the version control chain and leaves the source of truth in an undefined state.",
      "Exceptions: Urgent SOPs that cannot wait for the full review cycle may be drafted directly in Word using the dss-sop-policy template, with Operations Owner sign-off recorded by email. The resulting file should still be placed in the Approved > SOP drafts folder so it is captured in the published location and follows the same versioning thereafter."
    ]
  },
  {
    "id": "cs-001-act-open-accounts",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-001",
    "title": "ACT Open Account Verification",
    "desc": "A weekly procedure in which the Customer Success Coordinator works through every ACT contact assigned to the Open record manager, confirms whether each business is still operating, and logs the outcome in both ACT and an Excel tracker. Results are reported to the Sales Lead each Friday to inform resourcing decisions.",
    "status": "Active",
    "version": "1.0",
    "effectiveDate": "2026-06-01",
    "owner": "Customer Success Coordinator",
    "pdfPath": "./sops/SOP-CS-001_act-open-accounts.pdf",
    "qrgPath": "./sops/QRG-CS-001_act-open-accounts.pdf",
    "purpose": "The Customer Success Coordinator works through every ACT contact currently assigned to the Open record manager and confirms whether the business is still operating. The cleaned list shows how many dormant accounts remain reachable, which informs whether DSS needs to hire a third salesperson and which leads existing sales staff can pick up when they have spare time.",
    "scope": "Applies to every ACT contact whose Record Manager is set to Open. Accounts assigned to Gabriel or Eric Michael are out of scope and remain under their salesperson. The procedure runs once a week on Fridays and continues until the full Open list has been worked through. Account removal from ACT is performed by the Operations Lead on a weekly cycle and is out of scope for this SOP.",
    "definitions": [
      {
        "term": "ACT",
        "meaning": "The CRM used to store every customer contact, call log, and account status."
      },
      {
        "term": "Open (Record Manager)",
        "meaning": "An ACT contact with no salesperson assigned. The verification project targets this group only."
      },
      {
        "term": "Open (Status)",
        "meaning": "Verified result meaning the business is still in operation, whether or not it is interested in reordering."
      },
      {
        "term": "Closed (Status)",
        "meaning": "Verified result meaning the business no longer exists. Confirmed only by direct contact or by a clear written notice from the owner."
      },
      {
        "term": "Unsure (Status)",
        "meaning": "No answer on the phone, no closure indication online, and no email reply within the deadline window."
      }
    ],
    "roles": [
      {
        "role": "Customer Success Coordinator",
        "responsibility": "Exports the Open list, runs research and calls, logs every outcome in ACT and the Excel tracker. Cadence: Weekly (Fridays)."
      },
      {
        "role": "Operations Lead",
        "responsibility": "Removes contacts marked Closed from ACT once a week. Cadence: Weekly."
      },
      {
        "role": "Sales Lead (David)",
        "responsibility": "Receives the weekly numbers report and decides on resourcing. Cadence: Weekly review."
      },
      {
        "role": "Sales Team",
        "responsibility": "Picks up reactivated Open leads from the cleaned list when spare time allows. Cadence: Ad hoc."
      }
    ],
    "cadence": "Fridays weekly",
    "steps": [
      {
        "title": "Weekly Cadence and Time Allocation",
        "detail": "Fridays are reserved for this work. Other tasks do not interrupt it — the sales team handles their own orders that day. Invoices remain the coordinator's responsibility on Friday. Allocate roughly half an hour at the start of the day and half an hour before end of day for other tasks. This could be less time if needed. Record the start and stop times so the weekly hours total is accurate when reporting to the Sales Lead."
      },
      {
        "title": "Export the Open List from ACT",
        "detail": "Pull a fresh Excel export at the start of this process. The export becomes the working tracker. Steps: 1. Open ACT. 2. Click Lookup then All Contacts. 3. Click Record Manager to group contacts by their assigned manager. 4. Scroll to the contacts listed as OPEN and select them all. 5. Click Lookup Selected to limit the view to Open contacts only. 6. Click the Last Order Date column header to sort by most recent order first. 7. Click the Export Current List to Excel icon — ACT generates the Excel file. The exported file lists every Open contact with the columns ACT carries: contact ID, contact name, company, phone, city, province, postal code, email, ID/status, and last order date."
      },
      {
        "title": "Set Up the Excel Tracker",
        "detail": "The Excel file is the working tracker for this project. ACT keeps the call history and status, but the Excel sheet is what survives the Operations Lead's weekly removal of Closed contacts — without it the coordinator loses track of how many accounts have been called and where they landed. Required columns: Status — one of Open, Closed, or Unsure; colour-code the cell green for Open, red for Closed, yellow for Unsure. Note — optional; one short line capturing how the interaction went so the next call can pick up where the last left off. Check-in 1, Check-in 2 — weekly columns that capture the next contact attempt for Unsure or unconfirmed Open accounts. Why a parallel Excel tracker: the Operations Lead (Juan) removes Closed contacts from ACT once a week. Without an external record, accounts vanish from ACT mid-project and the Coordinator loses the count. The Excel file preserves every row and every status decision for the Sales Lead report."
      },
      {
        "title": "Pre-Call Research",
        "detail": "Before calling, run a short check to anticipate whether the business is likely still open. Spend a couple of minutes per account, not more. Steps: 1. Search the company name on Google. Note whether the listing shows permanently closed — treat this as a hint only, since any user can flag a listing as closed. 2. Check whether the company website is live and whether it carries a closure notice. 3. Open the ACT contact record. Read the existing notes for the primary contact name, alternative phone numbers, and any restriction on when to call. 4. Check Shopify for an account under the same business name in case the contact has migrated to the e-commerce side."
      },
      {
        "title": "Phone Call Script",
        "detail": "Use something akin to this opener on every call. Stay brief — a long script is not required and the goal is volume. Opener: 'Hi, I'm calling from DSS. You have an account with us, and I can see that we haven't placed an order in about two years. I'm calling to check whether the business is still open.' If there is more than one phone number on the ACT record, work through every number before treating the contact as unreachable. The original number may have belonged to a buyer who has since left."
      },
      {
        "title": "Outcome 1 — Confirmed Closed",
        "detail": "Closed is only recorded when a person directly confirms that the business no longer exists, when a clear written notice arrives in response to the cleanup email, or when the phone number/email doesn't work and there is no active website. Steps: 1. In ACT, log the call as 'Completed, customer confirmed, closed.' 2. Format the log text in large, bold, red so the Operations Lead can spot the row when removing Closed accounts from ACT. 3. Change the ACT Customer ID Status to Closed. 4. On the Excel tracker, set Status to Closed and shade the cell red. Note: Keep one prepared copy-paste text block per outcome (Closed, Open, Unsure) with the correct formatting already applied. Paste the matching block into ACT instead of re-typing and re-formatting every time."
      },
      {
        "title": "Outcome 2 — Business Sold to a New Owner",
        "detail": "When the contact says they sold the business, the underlying account is treated as closed but the lead is preserved. Steps: 1. Ask: who did you sell to, and is the store name unchanged? 2. Ask for the new owner's name and phone number. 3. Search ACT for the new business name. If an account already exists, mark the old account Closed — that legal entity no longer exists. 4. If no account exists for the new owner, capture the contact details and treat it as a new account from scratch. 5. Update the corresponding Shopify account if applicable. 6. When the new owner is reached, ask whether they want their historical account transferred and the password reset, or whether they prefer a fresh account. Honour the choice."
      },
      {
        "title": "Outcome 3 — Confirmed Open",
        "detail": "Open means the business is operating, whether or not it is interested in reordering. Steps: 1. In ACT, log the call as 'Confirmed still in business' in large, bold, green. 2. On the Excel tracker, set Status to Open and shade the cell green. 3. Offer a password reset and link so the contact can reactivate on Shopify. Do not push if they decline. 4. If they are interested in reordering, route the lead to the sales team. The salesperson treats it as a new account and works the lead in the order it appears on the cleaned list. 5. If they are not interested, leave the status as Open. No further outreach is required from the Coordinator."
      },
      {
        "title": "Outcome 4 — Unsure (No Answer, No Closure Signal)",
        "detail": "Unsure applies when no one answers the phone, no closure notice is visible online, and the business identity cannot be confirmed. The Coordinator works a three-week sequence before marking the account Closed. Week 1: Call every phone number on file. Leave a voicemail if available. Tracker: Status = Unsure, note the attempt date in Check-in 1. Week 2: Call again and send the cleanup email with a two-week deadline. Tracker: Status = Unsure, note in Check-in 2 that the email was sent. Week 3: If no reply by the deadline, mark the account Closed and log the call in ACT in large, bold, red. Tracker: Status = Closed, cell shaded red. Cleanup email: Send a single email when no one answers the phone. The email states that DSS is cleaning the customer database and gives a two-week deadline, leading to a Friday. Make the deadline explicit (date, not 'two weeks from now'). The email must say that the account will be closed if no reply is received by that date. Website-says-closed variant: If the company website carries a closure notice and the phone is unanswered, send one targeted email before deactivating the account. Ask whether the physical shop is still operating or the business was sold. Treat the reply (or absence of reply) as the Unsure sequence."
      },
      {
        "title": "Logging in ACT",
        "detail": "Every call must be logged in ACT. Use the prepared copy-paste block for the outcome so the formatting (size, bold, colour) is consistent and the Operations Lead can find Closed rows quickly. Update the ACT Customer ID Status on the same visit as the call. The Status field, not the call note, is what drives the weekly removal of Closed accounts. Do not leave it set to Open after a confirmed closure."
      },
      {
        "title": "Weekly Reporting to the Sales Lead",
        "detail": "At the end of each Friday session, send the Sales Lead a single line with the week's numbers. Do not include narrative. Report fields: Hours worked (source: start and stop times noted during the session), Accounts contacted (source: count of rows touched in the Excel tracker this week), Confirmed closed (source: Excel Status = Closed for this week), Confirmed open (source: Excel Status = Open for this week), Carried to next week (source: Excel Status = Unsure for this week). Example: 4 h worked, 25 accounts contacted, 20 confirmed closed, 1 confirmed open, 4 carried to next week. Once a steady rhythm is reached (target: from week two onward), the Sales Lead uses these numbers to project the total weeks required to clear the Open list. That projection drives the decision on whether a third salesperson is hired."
      }
    ],
    "notes": [
      "Non-Compliance — Marking an account Closed without direct verbal or written confirmation from the business (or something clear such as the phone number/email not working) is overturned by the Sales Lead and reopened. Repeated occurrences trigger a review of the project's accuracy.",
      "Non-Compliance — Failing to update the ACT Customer ID Status after a confirmed closure leaves the account on next week's Open list and double-counts work.",
      "Non-Compliance — Logging a call result in ACT without the prescribed colour and bold formatting hides the row from the Operations Lead's weekly cleanup, so closed accounts stay live in ACT.",
      "Non-Compliance — Skipping the Friday session without re-allocating the week's calls extends the total project length and is reported to the Sales Lead.",
      "Non-Compliance — Working only inside ACT (no Excel tracker) makes the weekly numbers report impossible — Closed rows that Operations removes mid-project can no longer be counted.",
      "Exception — The Sales Lead can suspend the Friday cadence for a defined week (for example, a quarter-end push). The pause is logged in the weekly report and the schedule is extended by the same number of weeks.",
      "Exception — If the volume of orders or invoices on a given Friday genuinely blocks the session, the Coordinator notifies the Sales Lead at the start of the day and proposes a make-up window inside the same week.",
      "Exception — A contact reached during sold-business handling that maps to an existing ACT account is closed without the three-week unsure sequence — the new owner's account already exists.",
      "Copy-paste templates: Keep one prepared text block per outcome (Closed, Open, Unsure) with the correct formatting already applied. Paste the matching block into ACT instead of re-typing and re-formatting every time to ensure consistent bold, large, colour-coded entries that the Operations Lead can identify quickly."
    ]
  },
  {
    "id": "cs-001-credit-card-payments",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-001",
    "title": "Credit Card Payments and Special Customer Cases",
    "desc": "Defines how Customer Success processes credit card payments in Shopify for wholesale orders and handles recurring special cases including failed payments, browser issues, multi-address accounts, Vape Street Holdings franchise orders, and customer tags and automatic discounts.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-05-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-001_credit-card-payments-special-cases.pdf",
    "qrgPath": null,
    "purpose": "This SOP defines how Customer Success processes credit card payments in Shopify and handles the recurring special cases that come up with wholesale accounts — failed payments, browser issues, multiple addresses on file, Vape Street Holdings franchise orders, customer tags and automatic discounts. The goal is consistent, error-free payment capture that matches the billing address on the cardholder authorization form on file.",
    "scope": "Applies to all Customer Success staff who receive payment on wholesale Shopify orders using a credit card on file. Covers the standard processing flow, recovery when a charge fails, browser-related issues, address verification on multi-address accounts, the Vape Street Holdings recreate-and-cancel process, and the application of customer-specific tags and discounts. Out of scope: customer-facing checkout (Shopify storefront), retail point-of-sale payments, and any payment method other than credit card on file.",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Staff",
        "responsibility": "Process credit card payments in Shopify for wholesale orders following this SOP, including handling special cases, verifying billing addresses, applying tags and discounts, and saving all changes correctly."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Owns this SOP, addresses repeat non-compliance instances during weekly one-on-ones, and must approve any exception involving sending a cancellation email to a franchise."
      },
      {
        "role": "Operations Manager",
        "responsibility": "Holds backend access for payment troubleshooting, must be consulted before contacting the customer when a charge fails repeatedly, and must approve exceptions such as using a shipping address as billing address or waiving the $25 express fee on sub-threshold Vape Street orders."
      }
    ],
    "cadence": "As needed",
    "steps": [
      {
        "title": "Process a Credit Card Payment",
        "detail": "Follow these steps for every wholesale order paid by credit card on file. 1. Open File Explorer and navigate to P:\\Emna\\Payment\\CARTES DE CREDIT (Public drive, Emna folder, Payment subfolder, Credit Cards). 2. Open the customer's credit card authorization form from the CARTES DE CREDIT folder. 3. In Shopify, open the order and click Percevoir le paiement (Receive Payment), then select Carte de credit (Credit Card). 4. In the payment modal, enter the card number, expiration date, CVV, cardholder name, and billing address exactly as shown on the authorization form. 5. Confirm the charge and verify the order status updates to Paye. Non-negotiable rules: always use the billing address linked to the credit card; do not use the shipping address as the billing address unless the authorization form explicitly says so."
      },
      {
        "title": "Handle a Failed or Declined Payment",
        "detail": "When the charge is declined or errors out: 1. Retry the charge once or twice. 2. If it still fails, check with the Operations Manager who holds backend access before contacting the customer. 3. Contact the customer only after the internal check, and only with specific information about what to update (new card, updated address, raise bank limit, etc.). Common reasons a charge is declined: the card information has changed; the bank limit has been reached; the bank has blocked the payment; the card is expired; the billing address entered does not match the address on file with the bank."
      },
      {
        "title": "Resolve Browser Issues with Google Chrome",
        "detail": "Google Chrome occasionally causes the Shopify payment modal to behave unexpectedly — fields fail to populate, the submit button does not respond, or the modal closes without confirming the charge. If this happens, open the order in a different browser (Edge or Firefox) and re-enter the payment. Do not retry the same charge repeatedly in Chrome."
      },
      {
        "title": "Handle Customers with Multiple Addresses",
        "detail": "Some wholesale customers maintain multiple shipping locations and a separate billing address. Before charging the card: verify which address is on file with the issuing bank for the card being charged; enter that billing address in Shopify exactly as it appears on the authorization form, even if the order ships somewhere else. Example: a customer has two locations on file, but the credit card is linked to only one. Using the wrong billing address causes the charge to fail even though the card is valid."
      },
      {
        "title": "Vape Street Holdings — Recreate Order Under Pamela Tremblay",
        "detail": "Vape Street Holdings operates multiple franchise locations and has a custom order-handling workflow. Orders placed under any Vape Street account are processed under a single head-office account so payment and tagging stay consistent across franchises. Steps: 1. Duplicate the original order in Shopify (use Autres actions > Dupliquer). 2. Change the customer on the duplicate to Pamela Tremblay. 3. Keep the franchise's shipping address on the duplicate — the order still ships to that location. 4. Set the billing address to the address linked to the credit card on file (from the authorization form). Shipping instructions: add the order note 'Please ship express' to every Vape Street order; if the order is below the free-shipping threshold, apply a $25 express shipping fee."
      },
      {
        "title": "Cancel the Original Vape Street Order",
        "detail": "After the recreated order is in place, cancel the franchise-name original so the books and inventory stay clean. 1. Open the original order and click Autres actions > Annuler la commande. 2. Uncheck 'Send notification to customer' — the franchise must not receive a cancellation email. 3. Check 'Restock items when cancelling' so inventory returns to stock. 4. Add the internal note 'Order recreated under Pamela Tremblay account.' to the original order before confirming the cancellation."
      },
      {
        "title": "Review and Apply Discounts and Tags",
        "detail": "Each customer record carries tags and automatic discounts that drive pricing and shipping rules. Before charging the card: open the customer account in Shopify and review the tags on the right-hand panel; confirm the correct automatic discount is applied to the order; click Apply wholesale discounts on the order if the discount has not auto-applied."
      },
      {
        "title": "Save All Changes",
        "detail": "Shopify does not auto-save edits. After every modification, click Save before moving to the next field or closing the order. Specifically save after: changing the shipping or billing address; adding an order note; applying a discount; editing customer details on the account."
      },
      {
        "title": "General Reminder — Handle Account Exceptions",
        "detail": "Many wholesale accounts carry exceptions or custom handling. Recurring patterns become familiar with experience, but when in doubt about a specific customer's billing, shipping, or discount setup, ask the Operations Manager or the account manager before charging the card. A failed charge with the wrong billing address is harder to unwind than a five-minute question."
      }
    ],
    "notes": [
      "Non-Compliance — Charging a card with a billing address that does not match the authorization form causes the charge to fail and, on repeated attempts, can trigger a fraud flag on the merchant account.",
      "Non-Compliance — Sending a cancellation email to a Vape Street franchise when the order has been recreated under the head-office account creates a support ticket and damages the franchise relationship.",
      "Non-Compliance — Skipping the Save click after editing an address or discount silently discards the change and produces a wrong-amount charge. Repeat instances of any of these are addressed by the Customer Success Lead during the weekly one-on-one.",
      "Exceptions — Deviation from this SOP is permitted only with prior approval from the Operations Manager or the Customer Success Lead. Using a shipping address as the billing address requires written confirmation from the cardholder on the authorization form. Waiving the $25 express fee on a sub-threshold Vape Street order requires Operations Manager approval. Sending a cancellation email to a franchise requires Customer Success Lead approval. Every exception is recorded as an internal note on the Shopify order, naming the approver and the reason.",
      "Authorization forms are stored on the P: drive (Public) under Emna > Payment > CARTES DE CREDIT. Always retrieve the form before entering any card details in Shopify.",
      "Always use the billing address linked to the credit card as shown on the authorization form — never substitute the shipping address unless the form explicitly permits it."
    ]
  },
  {
    "id": "cs-001-new-customer-intake",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-001",
    "title": "New Customer Request Intake",
    "desc": "Defines how the Customer Success team responds to a new wholesale account request submitted through the DSS Distro storefront. Covers the first qualifying call, account creation in Shopify and ACT, and handoff to the dedicated account manager.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-05-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-001_new-customer-request-intake.pdf",
    "qrgPath": null,
    "purpose": "This SOP defines how the Customer Success team responds to a new wholesale account request submitted through the DSS Distro storefront. It covers the first qualifying call, account creation in Shopify and ACT, and the handoff to the dedicated account manager. The goal is a consistent intake experience that confirms customer information, captures the data needed downstream, and sets the customer up for a smooth first order.",
    "scope": "Applies to every new wholesale request that arrives in the DSS Info inbox with the subject line \"New Customer Request.\" Applies to the Customer Success representative on intake duty for that day and to the Customer Success Lead who supervises the rotation. Out of scope: existing-customer reorders, account-manager activity after the handoff, and credit or payment-terms decisions (handled separately by Finance).",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Representative",
        "responsibility": "Receives the intake email, makes the first call, qualifies the lead, creates the Shopify and ACT records, and either transfers the customer or schedules a follow-up."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Owns the assignment rotation between account managers, audits new accounts weekly, and approves any deviation from this SOP."
      },
      {
        "role": "Account Manager (Gab or Eric)",
        "responsibility": "Takes over the account once intake is complete. Walks the customer through the catalogue, pricing, and product recommendations. Receives a warm transfer or a scheduled callback."
      },
      {
        "role": "Finance",
        "responsibility": "Validates provincial and federal tax numbers when flagged. Owns the indemnity-agreement archive."
      }
    ],
    "cadence": "As needed — triggered each time a new wholesale account request arrives in the DSS Info inbox with the subject line \\\"New Customer Request.\\\"",
    "steps": [
      {
        "title": "Process Trigger",
        "detail": "A prospective wholesale customer submits the application form on the DSS Distro storefront via the \"Apply for a wholesale account\" link on the login page. The form collects: country code, full name, company name, website (if available), email address, phone number, provincial and/or federal tax number, preferred brand name or store, number of years in business, shipping address, and billing address. Once submitted, Shopify forwards the application to the DSS Info inbox as an email from \"mailer@shopify.com\" with the subject \"New Customer Request.\" The body contains every field the customer filled in. This email is the trigger event for this SOP."
      },
      {
        "title": "Pre-Call Preparation",
        "detail": "Before placing the first call, the representative completes two checks. 1. Open the customer database template at Public → Emna → Customer Database Template on SharePoint and review the latest entries. 2. Check the last customer assignment to determine whose turn it is in the rotation between Gab and Eric. The rotation alternates strictly; do not skip a name without lead approval. Have the original Shopify email open in a second window so the customer-supplied data is visible while the call is in progress."
      },
      {
        "title": "First Customer Call — Introduction",
        "detail": "The first call has two objectives: confirm the information the customer submitted on the form, and build a conversation that surfaces details the form does not capture. Use a warm, professional tone throughout. Introduction script: \"Hey, this is [your name] calling from Digital Smoke Supplies. I'm part of the Customer Success team. How are you doing today?\" Once the customer responds, explain the reason for the call: \"We received your request to open a wholesale account with us, and I personally like to welcome new customers with a quick call and ask a few questions, if you don't mind.\""
      },
      {
        "title": "First Customer Call — Qualifying Questions",
        "detail": "Work through the following questions, confirming what the customer already provided and filling in anything missing. Take notes directly into the ACT record once it exists. Questions to cover: How did you hear about us? Confirm the company name. Confirm how many years they have been in business. How many locations or stores do they have? Are they the owner or the store manager? Is the phone number provided the store number or a personal number? Do they have a website? Do they sell online? Are they looking for any specific brands or product categories? Is the email address provided the best email for orders and account communication? Ask for their provincial and federal tax numbers to verify the legitimacy of the business. Which provinces are they planning to sell in? If the customer asks for product recommendations, do not improvise — defer to the dedicated account manager: \"That's actually a great question. Once your account is finalized, your dedicated account manager will contact you and walk you through our catalogue, pricing, and product recommendations tailored to your store.\""
      },
      {
        "title": "Provincial Considerations and Indemnity Agreement",
        "detail": "Some provinces require additional handling because of how excise stamps are applied. Ontario is the most common example. If the customer is based in Ontario, ask whether they will purchase Ontario-stamped products only, or federally stamped products as well. If the customer wants federally stamped products, the representative must send the Indemnity Agreement for Additional Duty Provinces before the federal tag is applied to the Shopify account. The agreement is located at: Public → DSS Tools → Sales and Reporting → Indemnity Agreement for Additional Duty Provinces. The agreement must be signed and returned before the Federal tag is added in Shopify. File the signed copy in the customer's ACT record under Documents and notify Finance that the agreement is on file."
      },
      {
        "title": "Shopify Account Creation",
        "detail": "Create the Shopify customer record immediately after the call. The Shopify customer ID is required before the ACT record can be linked, so do not skip ahead. Steps: 1. In Shopify, go to Customers and click \"Add customer\" in the top-right corner. 2. Fill in the customer overview: first name, last name, email, and phone number, using the country code from the application. 3. Add the default address — enter both the shipping and billing addresses confirmed during the call. 4. Enter federal and provincial tax information under tax details. Set \"Collect tax\" so Shopify charges the correct tax on each order. (If the shop is on a Reserve, they do not pay taxes.) 5. Apply tags — every wholesale customer receives the following tags: Wholesale (always — marks the account as B2B); Province tag (always — use the customer's province: Ontario, Alberta, Manitoba, etc.; one tag per account); Gab or Eric (always — reflects the rotation assignment confirmed in pre-call preparation); Federal (only when the customer purchases federally stamped products and the signed Indemnity Agreement is on file). 6. Save the record. Shopify generates an activation email automatically and sends it to the customer's confirmed email address. The customer must click the activation link before they can log in."
      },
      {
        "title": "ACT Account Creation",
        "detail": "ACT is the system of record for customer relationships. Every new Shopify wholesale account has a matching ACT contact. Create it the same day the Shopify record is created. Steps: 1. Open ACT and click New. 2. Fill in every field on the Business Card: account key, contact name, company, phone, email, website, and address. 3. Paste the Shopify customer ID into the Account Key field. This is the link between the two systems and is required. 4. Set the contact owner to the assigned account manager (Gab or Eric). 5. Add a History entry summarizing the intake call: date, who you spoke with, and any notes from the qualifying questions."
      },
      {
        "title": "Handoff and Closing",
        "detail": "The intake ends with one of three handoff outcomes, chosen in order of preference. 1. Warm transfer: If the customer is still on the line and the assigned account manager is available, offer an immediate transfer — \"If you're available, I can transfer you right away to your dedicated account manager.\" 2. Scheduled follow-up (customer on line, manager unavailable): Schedule a follow-up call directly in ACT under the account manager's name using Schedule Activity → Call; set the date and time and add the regarding line so the account manager has context. 3. Scheduled follow-up (customer unavailable): If the customer was not available to take the original call, schedule a follow-up call for the next business day in ACT under Gab or Eric, depending on the rotation assignment. Before ending the call, confirm three things with the customer: DSS Distro is excited to work with them; their account setup is in progress; their dedicated account manager will follow up shortly. After the call, send the customer the standard payment options email from the Customer Success shared mailbox. This step is mandatory — the customer cannot place a first order without it."
      }
    ],
    "notes": [
      "Non-Compliance — Skipping the first call: Skipping the first call results in incomplete account data and downstream order errors. The Customer Success Lead audits new accounts weekly. Accounts with missing required fields, no ACT record, or no logged intake call are reassigned and the responsible representative is coached at the next one-on-one.",
      "Non-Compliance — Federal tag without signed agreement: Applying the Federal tag in Shopify without a signed Indemnity Agreement on file is treated as a compliance breach. The account is frozen, the tag is removed, and the incident is reported to Finance and the Customer Success Lead within one business day. Repeat occurrences trigger a formal performance review.",
      "Exceptions require written approval from the Customer Success Lead before the account is created. Common approved grounds: (1) Existing customer of an affiliated brand migrating to DSS Distro who has already provided verified tax documents. (2) Account manager assignment override (skipping the rotation) when one of Gab or Eric is on leave or already managing a related store. (3) Same-day Federal tag application when the Indemnity Agreement has been signed digitally and Finance has confirmed receipt. Approved exceptions are recorded in the customer's ACT History with the approver's name and the reason. No verbal-only exceptions.",
      "The Shopify customer ID must be created before the ACT record is linked — do not create the ACT record first.",
      "After the intake call, sending the standard payment options email from the Customer Success shared mailbox is mandatory — the customer cannot place a first order without it.",
      "The Indemnity Agreement for Additional Duty Provinces must be signed and returned before the Federal tag is added in Shopify. File the signed copy in the customer's ACT record under Documents and notify Finance."
    ]
  },
  {
    "id": "cs-002-logging-interactions",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-002",
    "title": "Logging Customer Interactions in ACT",
    "desc": "Defines how Customer Success agents log calls, emails, notes, and follow-ups in ACT to maintain an accurate, shared record of every customer touchpoint. Ensures Customer Service, Account Managers, and the wider team always know what was done, discussed, and is outstanding for each customer.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-05-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-002_logging-customer-interactions.pdf",
    "qrgPath": null,
    "purpose": "ACT is the shared record of every customer touchpoint at DSS Distro. This SOP defines how Customer Success agents log calls, emails, notes, and follow-ups in ACT so that Customer Service, Account Managers, and the wider team always have an accurate picture of what was done, what was discussed, and what is outstanding for each customer.",
    "scope": "Applies to all Customer Success agents and Account Managers who interact with customers by phone, email, or internal note. Covers searching for a customer, reading the customer profile, logging calls and emails, writing internal notes, setting call status, and creating follow-ups. Out of scope: ACT installation and infrastructure (handled by IT), and any customer-facing communication — ACT notes are internal only.",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Agent",
        "responsibility": "Log all calls, emails, and notes in ACT for every customer interaction; set correct call results; create follow-ups whenever a next action is owed; write clear, self-contained notes that allow colleagues to continue without re-reading the full thread."
      },
      {
        "role": "Account Manager",
        "responsibility": "Log customer interactions in ACT and keep the customer profile up to date, ensuring other team members are informed without a separate handoff."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Audit the History grid and Task List weekly; approve any deviations from this SOP; address non-compliance through the standard performance process; record exceptions (ACT outages) in the Customer Success operations log."
      },
      {
        "role": "IT (Etienne)",
        "responsibility": "Handle ACT installation, repair, and infrastructure; contacted when ACT does not load on an agent's workstation."
      }
    ],
    "cadence": "Every customer interaction (calls, emails, notes) — logged in real time; Customer Success Lead audits weekly.",
    "steps": [
      {
        "title": "Access and Setup",
        "detail": "ACT is installed on each agent's workstation and signed in with the agent's DSS email account so emails sync automatically. If ACT does not load, contact Etienne in IT to install or repair the application before continuing customer work. Do not share ACT logins between agents — each agent's email account is the link that captures their email history into the customer profile."
      },
      {
        "title": "Search for a Customer",
        "detail": "Open ACT and use the Lookup panel on the left, under Contact Field. Search using one of the following fields in order of preference: (1) Email — the most reliable identifier; copy the email directly from Shopify and paste it into ACT to avoid typing errors. (2) Contact name — use when the email is not known. (3) Customer ID — use when working from an order or invoice reference. (4) Store name — use for B2B accounts when the contact's name is unclear."
      },
      {
        "title": "Read the Customer Profile",
        "detail": "Before contacting a customer, open the profile and review the existing record. The profile contains: internal notes left by other team members; email history synced from the agent's mailbox; call history with results and durations; payment follow-ups and outstanding-invoice flags; Shopify notes carried over from the storefront; phone numbers, the assigned account manager, and the full customer history. The History tab lists every prior interaction in date order. The Latest Activities panel on the Business Card highlights the most recent email, call attempt, and call reach so the agent can confirm current status at a glance."
      },
      {
        "title": "Review Context Notes",
        "detail": "Context notes summarize the substance of past interactions. A typical entry reads: 'Marc-Antoine followed up regarding an outstanding payment. Customer confirmed payment would be processed.' Read the most recent context note before contacting the customer so the conversation continues from where the last agent left off. A good context note tells the next agent four things at a glance: (1) the history of the customer relationship, (2) the current payment status, (3) past interactions and who handled them, and (4) any ongoing issue that is not yet resolved."
      },
      {
        "title": "Emails in ACT",
        "detail": "Emails to and from a customer are saved in ACT automatically because the agent's mailbox is linked to the system. No manual logging is required for email. To view the full thread on a customer, open the profile and click History — emails appear alongside calls and notes in date order."
      },
      {
        "title": "Log a Call in ACT",
        "detail": "Every call to a customer must be logged in ACT, regardless of outcome. This is non-negotiable — a call that is not logged does not exist for the rest of the team. To log a new call: (1) From the customer profile, click Call in the toolbar (or use Schedule > Call) to open the Schedule Activity dialog. (2) Confirm the Activity Type is Call, set the start date and time to the actual call time, and set Duration to the call length (10 minutes is a sensible default for outbound payment calls). (3) Enter a short summary of the purpose in the Regarding field (for example, 'Follow-Up on Payment #DSS166229'). (4) Set Priority to High for payment-related and time-sensitive calls; otherwise Low. (5) Click OK to save the activity. For no-answer calls: even if there is no answer, the call must still be recorded. Leave a voicemail if voicemail is available. Voicemails are strongly recommended even when the customer does not respond — they create a recoverable touchpoint and a clear timestamp."
      },
      {
        "title": "Clear the Call Activity (After the Call)",
        "detail": "When the call ends, open the activity from the History grid (or the Task List) and clear it. The Clear Activity dialog is where the interaction becomes a permanent record on the customer profile. Steps: (1) Set Results using the call status rules (section 9): use 'Call Completed' if you spoke with the customer and reached a substantive outcome; use 'Call Attempted' if there was no answer, voicemail, or could not connect. (2) Tick 'Add Activity Details to History' so the note is preserved. (3) Write the note in the Details field following the note format. (4) If a follow-up is required, click Follow-up to schedule it. Otherwise click OK to save and close."
      },
      {
        "title": "Apply Call Status Rules",
        "detail": "Set the Result on every cleared call. The two values are not interchangeable: 'Call Completed' — use when you spoke with the customer and reached a substantive outcome; signals to the team that the conversation happened and they should read the note for the outcome. 'Call Attempted' — use when there was no answer, voicemail, or could not connect; signals that the customer was not reached and another attempt is still required. Misclassifying a no-answer as Call Completed hides the need for a follow-up and breaks payment-tracking and account-management workflows."
      },
      {
        "title": "Write the Interaction Note",
        "detail": "Notes can be written in English or French — use the language the conversation took place in. Customers do not see ACT notes; they are internal only. A useful note answers, in order: who was contacted, why, what they said, and what happens next. Example: 'Called Marc-Antoine regarding outstanding invoice. Customer advised payment will be processed by the end of the day. Customer has reached credit card limit. Order remains on hold until payment is received.' When the outcome requires action, end the note with an explicit Action line so the next agent can act without re-reading the full thread. Example Action line: 'Action: Keep an eye on the order to confirm whether the payment has been received so we can mark it as paid. If it is not paid by tomorrow, follow up again.' Short closing notes are acceptable when the matter is resolved — for example, 'Customer paid his outstanding invoice' after the payment lands."
      },
      {
        "title": "Create a Follow-Up",
        "detail": "ACT generates a reminder for any follow-up scheduled on a customer. Use follow-ups whenever the customer commits to a future action (payment, callback, document return) or whenever the agent must verify an outcome by a specific date. Steps: (1) In the Clear Activity dialog, click Follow-up to open a new Schedule Activity dialog pre-linked to the same customer. (2) Set Activity Type to Call (or another type if appropriate) and set the start date to the day the action is expected. (3) Enter the same Regarding reference as the originating activity so both items appear together in the History grid. (4) Set Priority using the standing rule: High for payments and time-critical commitments, Low for routine check-ins. (5) Click OK to save. The follow-up appears on the agent's Task List on the scheduled date. On the scheduled date, use the Task List filters: 'Tomorrow' to see what is due the next business day; 'Today' to work the current day's queue; 'All' with a custom date range to plan the week or catch overdue items."
      }
    ],
    "notes": [
      "ACT is for internal use only — notes are never visible to customers and can be written in English or French depending on the language of the interaction.",
      "A call that is not logged in ACT does not exist for the rest of the team — logging every call regardless of outcome is non-negotiable.",
      "Do not share ACT logins between agents — each agent's email account is the link that captures their email history into the customer profile.",
      "Call status rules: 'Call Completed' means you spoke with the customer and reached a substantive outcome; 'Call Attempted' means no answer, voicemail, or could not connect. These are not interchangeable — misclassifying a no-answer breaks payment-tracking and account-management workflows.",
      "Voicemails are strongly recommended even when the customer does not respond — they create a recoverable touchpoint and a clear timestamp.",
      "Non-Compliance: Calls or emails not logged in ACT, missing or mislabelled call results, and unscheduled follow-ups are treated as missed work. The Customer Success Lead audits the History grid and Task List weekly. Repeated lapses are addressed through the standard performance process: a documented coaching note on first occurrence, a written warning on the second, and escalation to the department manager on the third.",
      "If a missed log causes a customer-facing error (duplicate call, missed payment commitment, or release of an order on hold), the responsible agent must reconcile the record immediately and notify the Customer Success Lead the same day.",
      "Exceptions: Deviation from this SOP is approved only by the Customer Success Lead and only for documented technical incidents (e.g., ACT offline or email sync broken). During an approved exception, agents record interactions in a temporary shared log and replay them into ACT once service is restored. The Lead records each exception — including start/end time and affected agents — in the Customer Success operations log."
    ]
  },
  {
    "id": "cs-003-quality-issues",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-003",
    "title": "Handling Customer Quality Product Issues",
    "desc": "Defines how Customer Success handles customer-reported product quality complaints — including taste, bottle, or flavour issues — by gathering information, documenting complaints, and escalating internally to the production team before providing any resolution to the customer.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-05-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-003_handling-customer-quality-product-issues.pdf",
    "qrgPath": null,
    "purpose": "This SOP defines how Customer Success handles customer-reported product quality complaints — taste, bottle, flavour, or any other issue that suggests the product is not behaving as expected. Every complaint is gathered, documented, and escalated internally before a final conclusion is given to the customer, so that DSS can distinguish between an isolated bottle, a partial batch, or a full batch issue.",
    "scope": "Applies to all Customer Success representatives who receive product quality complaints from customers by email, phone, or any other channel. Covers every DSS-distributed e-liquid, nicotine pouch, and snack product. Out of scope: shipping damage claims (handled under the carrier-claim process), pricing or invoice disputes, and compliance / labelling concerns reported by regulators — those follow their own escalation paths.",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Representative",
        "responsibility": "Receives product quality complaints, sends the intake reply using the approved template, collects the bottling date, lot number, and photo from the customer, forwards the case internally to Pamela and David, and follows up with the customer once production has confirmed the classification."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Owns this SOP, reviews lapses with representatives in one-on-one sessions, reopens cases that bypassed this SOP, and escalates repeated non-compliance to the Operations Manager."
      },
      {
        "role": "Operations Manager (Backup)",
        "responsibility": "Acts as backup owner for this SOP, provides written approval for any same-day refund issued without production review, and receives escalations for repeated non-compliance."
      },
      {
        "role": "Pamela Del Rosso / Production Team",
        "responsibility": "Reviews the case details forwarded by Customer Success, determines whether the issue is a single-bottle, partial-batch, or full-batch problem, and broadcasts batch-wide issues to Sales, Customer Success, and the Warehouse on Teams with resolution options."
      },
      {
        "role": "David Levesque",
        "responsibility": "Receives the internal case escalation as Cc, participates in the production review, and can provide written approval for same-day refunds in lieu of production review."
      }
    ],
    "cadence": "As needed",
    "steps": [
      {
        "title": "Understand the Issue",
        "detail": "When a customer reports a problem with taste, bottle, flavour, or overall quality, the goal of the first reply is to gather enough information to determine whether the complaint is an isolated bottle issue or a problem that affects an entire production batch. A typical pattern: a customer routinely buys a specific SKU (e.g. Blue Berries Solar Master 3mg) and reports the bottle, taste, or flavour is off. Customer Success must determine whether the report is isolated or batch-wide. Do not promise a refund, swap, or root cause in the first response."
      },
      {
        "title": "Request Information from the Customer",
        "detail": "Always reply to the customer and ask for the following three items — these are the minimum required to escalate the case internally: (1) Bottling date — printed on the bottle label. (2) Lot number — printed on the bottle label, typically prefixed with the SKU code (for example, SMBB03170426). (3) Photo of the product — attached to the email if possible, showing the label so the bottling date and lot number are legible. If the customer cannot provide a photo, accept the bottling date and lot number in the body of the email and proceed."
      },
      {
        "title": "Send the Intake Reply to the Customer",
        "detail": "Use the following template for the first response. Thank the customer, acknowledge that the issue will be reviewed with the production team, request the bottling date, lot number, and a photo, and set the expectation that the investigation will take some time. Do not commit to a resolution before the production team has reviewed the case. Template: 'Hello, Thank you for reaching out and for bringing this to our attention. We have not received any other complaints about this product so far, but we will carefully review and investigate this with our production team. Could you please send us a photo of the product, including: the bottling date and the lot number. You can attach the photo to this email or include the details directly in your message. Please note that our investigation may take some time, but we will follow up with you as soon as we have more information. Thank you for your cooperation. Best regards,'"
      },
      {
        "title": "Run the Internal Escalation Process",
        "detail": "After receiving a complaint, Customer Success runs the following steps in order — the investigation cannot conclude until the production / lab team has reviewed the case: (1) Thank the customer and acknowledge the issue using the template in section 5. (2) Confirm whether similar complaints have already been received for the same SKU, bottling date, or lot number. (3) Collect from the customer: bottling date, lot number, and a photo (if available). (4) Forward the case internally to Pamela and David, including the SKU, batch number, bottling date, and the customer's description of the issue. (5) Production and lab review the case and determine whether it is a single-bottle issue, a partial-batch issue, or a full-batch issue. (6) Once production confirms the classification, Customer Success follows up with the customer and any other affected customers using the language approved by Pamela."
      },
      {
        "title": "Handle a Confirmed Batch-Wide Issue",
        "detail": "If production confirms the issue affects an entire batch, Pamela broadcasts the affected batch and list of affected orders to Sales, Customer Success, and the Warehouse on Teams. Customer Success then removes the affected items from any orders still in the system and notifies each affected customer with the resolution options approved for that batch. Customer Success contacts each affected customer in writing with the three approved resolution options: (1) Ship the rest of the order and place the affected items on back-order for the next batch. (2) Swap for another flavour. (3) Refund the affected items."
      }
    ],
    "notes": [
      "Key Rule — Document, investigate, confirm in that order: Every complaint is documented at intake, investigated with the production team, and confirmed internally before any final conclusion is given to the customer. Customer Success does not diagnose the cause, promise a refund, or rule out a batch issue before Pamela and David have reviewed the case.",
      "Non-Compliance: Skipping the intake template, closing a complaint without forwarding to Pamela and David, or committing to a resolution before production review masks batch issues and exposes DSS to repeat complaints from the same lot. Cases that bypass this SOP are reopened by the Customer Success Lead, the customer is re-contacted with the correct process, and the lapse is reviewed with the representative in their next one-on-one. Repeated lapses are escalated to the Operations Manager.",
      "Exceptions: A customer may decline to provide a photo or the lot number. In that case, escalate the complaint to Pamela and David with whatever information was supplied, and note in the internal email that the customer could not provide the missing fields. A same-day refund without production review is only permitted with explicit written approval from the Operations Manager or David Levesque, and the approval is attached to the case for the audit trail.",
      "Why this process matters: Product quality issues fall on a spectrum — some are isolated to a single bottle, some are linked to a specific production run and affect a partial or full batch. Taste and consistency can vary slightly between batches — not every variation is a defect. Even when no other complaints exist, every case is still investigated so that a developing batch issue is caught early.",
      "Backup owner for this SOP is the Operations Manager."
    ]
  },
  {
    "id": "cs-003-payment-terms",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-003",
    "title": "Customers with Payment Terms: Order Verification and Marking Paid",
    "desc": "Defines how Customer Success staff verify payment terms, confirm outstanding balances, and mark Shopify orders as paid for wholesale customers who pay on terms rather than at checkout. Ensures the warehouse can pick and ship without releasing goods to customers with unresolved invoices.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-05-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-003_payment-terms-order-verification.pdf",
    "qrgPath": null,
    "purpose": "This SOP defines how Customer Success staff verify customer payment terms, confirm outstanding balances, and mark Shopify orders as paid for wholesale customers who pay on terms rather than at checkout. It exists to keep the warehouse moving without releasing goods to customers with unresolved invoices.",
    "scope": "Applies to all wholesale customers on the DSS Distro and Flavor Shot Shopify stores who hold a payment-terms agreement (30 days, 15 days, 24 hours, or other negotiated terms). Out of scope: retail orders paid at checkout, cash-on-delivery accounts, and accounting operations such as invoice reconciliation and tag clean-up, which are owned by Finance.",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Staff",
        "responsibility": "Verify payment terms and outstanding balances, mark orders as paid in Shopify, leave warehouse notes, and send weekly invoice batches for applicable accounts."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Owns this SOP, reviews first-occurrence non-compliance, approves exceptions, and is the escalation point when a customer lacks a signed agreement on file."
      },
      {
        "role": "Finance (Rosie)",
        "responsibility": "Removes the 'terms' and 'not paid' tags from customer accounts once payment clears; owns invoice reconciliation and tag clean-up."
      },
      {
        "role": "Director of Operations",
        "responsibility": "Receives escalations for recurring non-compliance breaches and may revoke the authority to mark orders as paid."
      }
    ],
    "cadence": "Daily (terms order verification and marking paid); Weekly (invoice batch send for applicable accounts such as Vap Boutique and Citronic)",
    "steps": [
      {
        "title": "Locate Customer Information",
        "detail": "Two systems hold the information needed to confirm a customer is on terms and verify their account status. (1) Customer Terms and Contracts file — Location: Public → !DSS → Customer Terms and Contracts → DSS Customer Terms and Contracts (Excel); Path: P:\\!DSS\\Customer Terms and Contracts. The file lists payment terms (30 days, 15 days, 24 hours, etc.), signed contracts and agreements, credit card authorization forms, and expiration dates. Note: some long-standing customers (close contacts of David) may not have a signed agreement or credit card form on file. Treat the absence of a contract as a flag, not a block — escalate to the CS Lead before refusing the order. (2) Shopify Admin (DSS or Flavor Shot) — Open the customer account from the Clients menu; check the customer tags on the right-hand side. The tag 'terms' identifies a customer who pays on terms. Without that tag, treat the order as a standard prepaid order."
      },
      {
        "title": "Identify Terms Orders in Shopify",
        "detail": "Both Shopify stores expose a saved view that filters orders down to customers on payment terms. This is the working list for the day. Steps: (1) In Shopify Admin (DSS or Flavor Shot), open Orders in the left-side menu. (2) Open the dropdown menu at the top of the order list and select 'Terms'. (3) The list displays every pending order from a terms customer that has not yet been marked as paid. Orders in this view can be marked as paid before the customer's payment is received, so long as they have no outstanding invoices, so the warehouse can pick and ship without delay. Every order in the view requires a payment-status check before it is released."
      },
      {
        "title": "Verify Outstanding Invoices",
        "detail": "Before marking any terms order as paid, verify that the customer has no overdue invoices or outstanding balances. Two signals carry this information. Signal 1 — Orders still showing in the Terms list: If a customer's earlier orders are still in the Terms list (still has the terms tag), payment has not been received. Finance (Rosie) removes the terms tag once payment clears. Filter the list by customer name (search field) to see every open order against that account before releasing the new one. If the order still has the terms tag but they are within those terms (e.g. 30 days), it is acceptable to mark their next order as paid. If the terms have passed and the tag is still present, the account is outstanding. Signal 2 — Customer tags and the Not Paid view: Open the customer account in Shopify and check tags for 'not paid'. This is usually used when customers have 1-day terms. Finance (Rosie) removes the 'not paid' tag once payment clears. If they are within the terms (1 day in this case), their next order can be marked as paid. Customer Success staff do not manage accounting tags directly; the responsibility is to read the tags correctly and confirm payment status before releasing an order."
      },
      {
        "title": "Mark the Order as Paid",
        "detail": "Once the verification steps in section 5 are complete and the customer has no outstanding balance, mark the order as paid so the warehouse can fulfil it. Steps: (1) Open the order from the Terms view. (2) Scroll to the Payment pending panel at the bottom of the order. (3) Click Collect payment → Mark as paid. (4) Confirm. The order moves to Paid status and is released to the warehouse queue."
      },
      {
        "title": "Apply Named-Account Procedures",
        "detail": "A small number of accounts have specific handling rules that override the general flow. Examples: (1) Sarmad Bahr Aluloom — 15-day terms. Reliable payer. If a payment is missed, send a reminder by email (phone is not effective for this account). Before marking a new order as paid, verify previous invoices are due-dated and paid. Check the order history for paid invoices (Payée • Traité) confirming the account is current; pending invoices (Paiement en attente) must be resolved first. (2) XO Vape Saint-Amable (Marc-Antoine) — 7-day terms. If an outstanding invoice exists, call Marc-Antoine directly. Provide invoice amount, order reference number, and invoice date. Payment usually arrives quickly by e-transfer. Mark the new order as paid only after Finance removes the unpaid tag. (3) Charles Espérance — 1-day terms, Trusted account. Reliable payer with a close relationship to David. Orders can generally be marked as paid immediately without follow-up. Reference file for additional special customer notes: P:\\Emna\\Copy of Customer Profiles & Order Details."
      },
      {
        "title": "Combine DSS and Flavour Shot Orders (When Applicable)",
        "detail": "DSS Distro and Flavor Shot are separate companies operating separate Shopify storefronts. Officially, orders are not shipped together. Operationally, they can be combined when ALL of the following conditions are met: (1) Same customer account. (2) Same shipping address. (3) Orders placed within a short window of one another (same day, typically). When combining orders, leave a note on each order so the warehouse picks and packs them together: On the DSS order write 'Combine with...' and on the Flavor Shot order write 'Combine with...'. Important: Do not write the order number when combining DSS and Flavor Shot orders together. Only write 'Combine with...'"
      },
      {
        "title": "Verify Shipping Charges",
        "detail": "If a terms order shows no shipping charge, confirm the reason before releasing it. Legitimate cases: (1) DSS free shipping — Order subtotal over $1,500 before tax. (2) Flavor Shot free shipping — Order subtotal over $1,000 before tax. (3) Combined shipment — Shipping charged on one order only when paired per the combining procedure. (4) Special agreement — Documented in the Customer Terms and Contracts file (example: Vape Société — free shipping on Flavor Shot orders over $250). Verify against the customer's contract entry before assuming shipping was simply forgotten. Anything outside these legitimate cases must be corrected before the order ships."
      },
      {
        "title": "Weekly Invoice Send (Applicable Accounts)",
        "detail": "Some accounts — Vap Boutique and Citronic, for example — receive invoices on a weekly batch instead of per order. At the end of each calendar week: (1) Download every invoice raised against the account that week. (2) File the invoices by customer and by week in the shared drive. (3) Send all outstanding invoices for the account in a single email as part of regular follow-up. If invoices were not downloaded before the orders were marked as paid, they can still be downloaded after the fact. The required outputs of this process are accurate follow-up, correct payment verification, and clear warehouse notes — the order in which the supporting documents are pulled does not change those outputs."
      }
    ],
    "notes": [
      "Non-Compliance: Releasing a terms order without completing the verification steps results in goods being shipped to a customer with an unresolved balance. The first occurrence is reviewed by the CS Lead; recurring breaches are escalated to the Director of Operations and may result in the loss of authority to mark orders as paid. Any shipment released to a delinquent account is reversed where possible and the variance is logged in the weekly CS review.",
      "Exceptions: Deviations from this SOP — for example, releasing an order to a customer with an outstanding balance because David has personally approved the exposure, or combining shipments outside the combining-orders criteria — require written approval from the CS Lead or David before the order is marked as paid. The approval (email or Teams message) is pasted into the order notes in Shopify so the decision trail stays with the order.",
      "Reference Files: Customer Terms and Contracts at P:\\!DSS\\Customer Terms and Contracts\\DSS Customer Terms and Contracts; Customer profiles and order details at P:\\Emna\\Copy of Customer Profiles & Order Details.",
      "Some long-standing customers (close contacts of David) may not have a signed agreement or credit card form on file. Treat the absence of a contract as a flag, not a block — escalate to the CS Lead before refusing the order.",
      "Customer Success staff do not manage accounting tags directly. The responsibility is to read the tags correctly and confirm payment status before releasing an order. Finance (Rosie) is responsible for removing 'terms' and 'not paid' tags once payment clears."
    ]
  },
  {
    "id": "cs-004-damaged-product",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-004",
    "title": "Damaged Product Credits and Refunds",
    "desc": "Defines how Customer Success handles damaged product claims for STLTH-branded items and L!X in-house manufactured bottles, covering credit application, refund processing, replacements, and quarterly reimbursement to suppliers.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-05-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-004_damaged-product-credits-refunds.pdf",
    "qrgPath": null,
    "purpose": "This SOP defines how Customer Success handles damaged product claims for two product groups: STLTH-branded items and L!X in-house manufactured bottles. The procedures differ because STLTH no longer accepts opened product back and no longer offers replacements, while L!X bottles are recalled to the warehouse whenever the recovered excise stamp value exceeds the cost of the return shipping label.",
    "scope": "Applies to every Customer Success agent who receives a damaged product report from a wholesale account. Covers STLTH disposables, STLTH Geek Bar, STLTH Loop Max and any L!X bottle manufactured in-house. Excludes carton-level damage claims, which are handled under standard returns; this SOP applies specifically to unit-level damage where the customer keeps the remainder of the carton.",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Agent",
        "responsibility": "Receives damaged product reports, collects required documentation, calculates credits, builds draft orders, notifies customers, tracks outstanding credits in the spreadsheet, and catches the customer's next order to apply the credit."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Owns this SOP, maintains the outstanding-credits spreadsheet, may waive photograph and stamp documentation for low-value claims, and may lower the $10 L!X recall threshold when a pickup is already scheduled. Reviews non-compliance quarterly."
      },
      {
        "role": "Operations (Josée)",
        "responsibility": "Receives inbound L!X bottle return notifications from Customer Success, confirms receipt of returned bottles, and validates the bottle count before refund or replacement is processed in Shopify."
      },
      {
        "role": "Finance",
        "responsibility": "Holds e-Transfer bank deposits when instructed by Customer Success until the discount is applied to the customer's next order."
      }
    ],
    "cadence": "As needed (per damaged product claim); quarterly STLTH reimbursement submission",
    "steps": [
      {
        "title": "Collect required documentation",
        "detail": "Before any credit, refund or replacement is processed, collect the following from the customer for every claim: (1) Photographs of every damaged unit, showing the defect clearly. (2) Lot number and excise stamp information for every damaged unit. (3) The customer's region, since stamp values and pricing differ between federal and provincial stocks. Without this evidence, the claim cannot be submitted to the supplier for reimbursement and cannot be processed."
      },
      {
        "title": "STLTH Step 1 — Look up the customer and confirm the region",
        "detail": "In Shopify, open Customers and search the account by name. Open the most recent paid order to confirm which region of stock the customer purchases (federal versus provincial). Pricing differs by region, so verify even if the billing address suggests one province; some accounts resell into other regions."
      },
      {
        "title": "STLTH Step 2 — Calculate the unit credit",
        "detail": "STLTH ships in cartons of four units. Divide the customer's carton price (taken from their most recent paid order in the same region and category) by four to obtain the net unit credit. Flavours within the same category share the same price, so a single category lookup covers every flavour in that category. Example calculation table: STLTH Geek Bar (Ice Mint): $127.89 carton ÷ 4 = $31.97/unit. STLTH Geek Bar (Purple Grape, same category): $127.89 ÷ 4 = $31.97/unit. STLTH Loop Max (Juicy Peach): $98.00 ÷ 4 = $24.50/unit. Worked total for a 1+1+1 unit claim = $88.44. Re-add the figures by hand once before continuing. A miscalculated credit cannot be quietly corrected later; the discount has already gone to the customer."
      },
      {
        "title": "STLTH Step 3 — Build the credit-applied draft order",
        "detail": "The credit is delivered as a custom discount on the customer's next order. Instruct the customer not to pay immediately so Customer Success can cancel the unpaid order, build a draft with the discount applied, and reissue an updated invoice. Steps: (1) When the customer's next pending order arrives, open it in Shopify → Orders and choose More actions → Duplicate. This creates a draft order with the same line items, address and shipping. (2) Open the new draft and choose More actions → Apply Wholesale Discounts. This is mandatory; without it the customer pays retail pricing. (3) Scroll to the Payment section and click Add a discount → Add custom order discount. Set the discount type to Amount, enter the calculated credit (e.g. $88.44) and write the reason in capitals: CREDIT FOR DAMAGED STLTH. (4) Confirm the Shipping line is populated. Never leave shipping blank. Match the carrier the customer selected on the original order (UPS, Purolator or Express). For orders over $1,500 the default rate is free; for orders under $1,500, select the same paid rate the customer originally chose. (5) Tick Payment due later, set the terms to Due on receipt, and click Create order. The customer receives the order confirmation and invoice automatically; resend the invoice manually if the confirmation does not arrive."
      },
      {
        "title": "STLTH Step 4 — Notify the customer",
        "detail": "Send the customer a written confirmation of the credit on the same business day. The message must state the credit amount, list the damaged items, and instruct the customer not to pay their next order immediately so the discount can be applied."
      },
      {
        "title": "STLTH Step 5 — Track the outstanding credit",
        "detail": "Add the customer and credit amount to the outstanding STLTH credits spreadsheet maintained by Customer Success. The credit remains the agent's responsibility to flag the moment the customer's next order arrives; the spreadsheet is the safety net, not the trigger. When the customer pays by e-Transfer, ask Finance not to accept the bank deposit until the discount is applied; if the payment has already cleared, ask the customer to cancel and resend after the new invoice is issued."
      },
      {
        "title": "STLTH Step 6 — Quarterly reimbursement claim to STLTH",
        "detail": "Once per quarter, submit a consolidated claim to STLTH listing every damaged unit not returned during the quarter. The submission contains the product name, unit count, photographs and stamp/lot information already collected per claim."
      },
      {
        "title": "STLTH Step 7 — Handle customer replacement requests",
        "detail": "If the customer asks for a like-for-like replacement, explain that STLTH has changed its returns program and no longer offers replacements. DSS cannot replace at the unit level because DSS sells in cartons; credit is the only available remedy."
      },
      {
        "title": "L!X Step 1 — Calculate stamp value and apply the threshold rule",
        "detail": "Multiply the stamp value for the customer's region by the unit count to obtain the stamp recovery. Subtract the cost of the return shipping label. If the net is at least $10, the bottles are recalled; if the net would be under $10, leave the bottles with the customer. Stamp value reference table: 30 mL bottles — Federal: $5.60, Provincial: $11.20. 60 mL bottles — Federal: $11.20, Provincial: $22.40. Worked example: six 60 mL bottles, federal stamps, customer in Saskatoon. Stamp recovery is 6 × $11.20 = $67.20. A Saskatoon return label typically runs about $25, leaving a net recovery of $42 — well above the $10 threshold, so the bottles are recalled."
      },
      {
        "title": "L!X Step 2 — Offer the customer their remedy",
        "detail": "Customer Success offers two of the following three remedies. The credit and refund options are mutually exclusive, decided by the payment method on the original order: (1) Replacement on the next order — available for any L!X bottle. The customer waits until their next order ships. (2) Credit on the next order — used when the customer paid by e-Transfer, bank deposit or any non-card method. Same mechanism as the STLTH credit. (3) Direct refund to the original payment method — used when the customer paid by credit card. Fastest remedy and the default when the customer is on card. Phrase the offer so the customer chooses between the replacement and the appropriate credit-or-refund option for their payment method. Never present credit and refund as alternatives in the same message."
      },
      {
        "title": "L!X Step 3 — Issue the return label and schedule pickup",
        "detail": "Steps: (1) Generate the return shipping label and email it to the customer. Apologise for the inconvenience in the same message. (2) Schedule the carrier pickup for the next business day. Check the customer's opening hours before booking the window; the default safe range is 12:00–17:00. If you cannot confirm hours, do not book a 10:00 pickup."
      },
      {
        "title": "L!X Step 4 — Notify Operations of the incoming return",
        "detail": "Email Josée in Operations, copying the Customer Success Lead, with the customer name, the order number, and the size, strength and quantity of each bottle being returned. Ask Josée to confirm receipt and that the count matches. Do not act on the refund or replacement in Shopify until that confirmation arrives."
      },
      {
        "title": "L!X Step 5 — Process the refund in Shopify (credit-card customers)",
        "detail": "Steps: (1) Open the original order and click Refund at the top of the page. (2) Enter the refund quantity per line item. Confirm with Operations' count, not the customer's claim. (3) Uncheck Restock items. Damaged bottles do not return to saleable stock. (4) Scroll to the bottom and write the reason in capitals: REFUND FOR DAMAGED/LEAKING BOTTLES or whatever it may be. The reason field is mandatory — do not skip it even when the page is short. (5) Click Refund at the top of the page. The customer receives the refund notification automatically."
      },
      {
        "title": "L!X Step 6 — Process the replacement order (any payment method)",
        "detail": "Steps: (1) In Shopify, open Orders → Create order and select the customer. Verify the shipping address matches the original order — Shopify defaults to the most recent address, which may not be where the replacement should go. (2) Add the replacement bottles (size, strength, stamp region, quantity). Apply wholesale discounts as per the STLTH credit draft process. (3) Add a custom order discount of Percentage = 100% with reason DAMAGED PRODUCT REPLACEMENT. This produces a $0 invoice. (4) In the Notes field, write: Ship with next order. Never leave the Notes field blank on a $0 invoice; the warehouse must know not to ship the replacement on its own. If the customer pushes back on waiting for the next order, convert the remedy to a refund. Do not ship a standalone replacement to satisfy the request."
      },
      {
        "title": "L!X Step 7 — Track the outstanding replacement or credit",
        "detail": "Add the customer and remedy to the outstanding credits spreadsheet alongside STLTH credits. Direct refunds do not need tracking once the refund is processed."
      },
      {
        "title": "Credit and replacement tracking (ongoing)",
        "detail": "Customer Success maintains a single outstanding-credits spreadsheet that lists every unsettled credit, regardless of product line. Every new credit is added to the spreadsheet on the day it is issued, and removed the day it is settled (i.e. the customer's next order ships with the credit applied). The agent assigned to the account is responsible for catching the customer's next order. The spreadsheet is the backstop, not the trigger; relying on the spreadsheet alone risks missing the window when the customer pays before the discount is applied."
      }
    ],
    "notes": [
      "Non-Compliance: Processing a credit, refund or replacement without photographs and stamp/lot information forfeits the quarterly reimbursement claim against STLTH and the excise stamp recovery on L!X bottles, transferring the loss to DSS.",
      "Non-Compliance: Skipping the wholesale discount step on a duplicated draft overcharges the customer at retail pricing and triggers a manual correction.",
      "Non-Compliance: Leaving the Shopify shipping field blank on a credit-applied draft, or omitting the 'Ship with next order' note on a $0 replacement, blocks the warehouse from fulfilling the order.",
      "Non-Compliance: Restocking damaged bottles places defective product back into saleable inventory.",
      "Non-Compliance: Each of these errors is recorded against the responsible agent in the Customer Success quarterly review.",
      "Exception: The Customer Success Lead may waive the photograph and stamp documentation requirement for low-value claims (single units, long-standing accounts in good standing) where the cost of evidence collection exceeds the value of the recovery.",
      "Exception: The $10 threshold for L!X recalls may be lowered on the Customer Success Lead's authority when the customer is already due a pickup at their address for another reason.",
      "Exception: All exceptions are noted in the outstanding-credits spreadsheet against the customer row, with the approving lead's initials and the date.",
      "STLTH credit tip: Re-add credit figures by hand once before continuing. A miscalculated credit cannot be quietly corrected later; the discount has already gone to the customer.",
      "L!X remedy rule: Never present credit and refund as alternatives in the same message. Always pair replacement with either credit or refund based on the customer's payment method."
    ]
  },
  {
    "id": "cs-004-pending-payments",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-004",
    "title": "Shopify Pending Payments and Follow-Up Process",
    "desc": "Defines how Customer Success identifies unpaid Shopify orders, determines when to follow up, and coordinates collection with Sales to secure revenue and maintain cash flow. Covers pending-payment, terms-based, and 1-day-terms wholesale orders.",
    "status": "Draft",
    "version": "v1.0",
    "effectiveDate": "2026-06-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-004_pending-payments-follow-up.pdf",
    "qrgPath": "./sops/QRG-CS-004_pending-payments-follow-up.pdf",
    "purpose": "This SOP defines how Customer Success identifies unpaid Shopify orders, decides when to follow up, and coordinates collection with Sales. The goal is to secure the sale, maintain cash flow, and prevent orders from sitting in pending payment long enough that the customer forgets the order or buys the same items elsewhere.",
    "scope": "Applies to all Customer Success team members handling Shopify orders for DSS Distro wholesale accounts. Covers pending-payment orders, terms-based orders (7-, 15-, and 30-day), and 1-day terms orders. Verification of the payment terms themselves is out of scope and is handled by SOP-CS-003 (payment-terms order verification).",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Team Member",
        "responsibility": "Identifies unpaid Shopify orders across the Pending, Terms, and Not Paid filters; determines when follow-up thresholds are met; coordinates with Sales before contacting customers; logs all handoffs and interactions."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Owns this SOP; reviews duplicate-contact incidents; approves any deviations from the SOP in writing (email or Teams message); escalates repeat non-compliance incidents to the Operations Manager."
      },
      {
        "role": "Sales Representative / Sales Team",
        "responsibility": "Must be consulted before CS contacts a customer about a pending payment. May already be working the account and can instruct CS to stand down. Acknowledges CS channel posts before calls are made."
      },
      {
        "role": "Operations Manager",
        "responsibility": "Receives escalations for repeated non-compliance incidents; may action consequences during performance reviews."
      }
    ],
    "cadence": "Daily (during quieter periods); full cleanup during end-of-month closing",
    "steps": [
      {
        "title": "Identify unpaid orders in Shopify",
        "detail": "Open the Shopify Orders view and apply three filters to surface unpaid orders. Together these three lists form the daily follow-up workload: (1) Pending orders — customers without payment terms where the order is placed but payment has not been received; (2) Terms — customers on payment terms (7, 15, or 30 days) where the order is tagged 'terms' until payment clears; (3) Not paid — customers on 1-day terms where the order is tagged 'not paid' until payment clears. Highlighted rows in the filtered view are examples of orders that have passed the follow-up threshold and require action."
      },
      {
        "title": "Determine whether follow-up is required",
        "detail": "Customer Success does not chase every order immediately. Follow-up is triggered by one of the following conditions. For Pending orders (no terms): the order has been in pending payment for more than 72 hours; the order is high-value; month-end closing is approaching; or there is a risk of losing the sale. Confirm with Sales before reaching out. For Terms / Not paid orders: the agreed term has passed and the order still carries the 'terms' or 'not paid' tag. Refer to SOP-CS-003 for verification of the term before following up. Note: waiting too long has predictable consequences — the customer forgets the order, or buys the same items from another supplier before payment is completed."
      },
      {
        "title": "Check special customer handling requirements",
        "detail": "Before reaching out, check the Shopify customer profile and ACT notes to confirm both the preferred contact channel and the correct contact person. Key considerations: some customers are hard to reach by phone but respond reliably to email; some customers ignore email but answer the phone; the payment contact is sometimes a different person than the account holder — do not assume the named contact is the right contact for collections."
      },
      {
        "title": "Coordinate with Sales before contacting the customer",
        "detail": "Duplicate follow-ups damage the customer relationship and waste team time. Always coordinate with the Sales team before contacting a customer about a pending payment — the sales rep may already be working the account. Steps: (1) Post a short note to the Sales team channel before calling, e.g. 'I'm going to call this customer about a pending payment order.' (2) Wait for acknowledgement from the rep who owns the account before calling. (3) If the rep is already handling it, log the handoff and move on."
      },
      {
        "title": "Follow up on the overdue order",
        "detail": "After Sales coordination is confirmed, contact the customer using the appropriate channel identified in Step 3 (phone or email, based on their profile and ACT notes). Follow-up is fitted around the rest of the Customer Success workload — there is no expectation that every pending order is called the same day it crosses the threshold. Prioritise high-value orders and any flagged by Sales over routine pending payments."
      },
      {
        "title": "Perform end-of-month cleanup",
        "detail": "During end-of-month closing, run a full cleanup of the Pending and Terms/Not paid lists. Ensure all overdue orders have been actioned, logged, or escalated. Any orders left unfollowed past 72 hours (without Sales coordination) are flagged at the month-end review and the responsible CS team member is identified."
      }
    ],
    "notes": [
      "Key takeaways: The Shopify Pending orders, Terms, and Not paid lists are the daily follow-up workload. Prioritise high-value and time-sensitive orders. Call when email is not effective, and email when phone is not effective. Do not let orders stay in pending payment longer than necessary.",
      "Non-Compliance: Failure to follow this SOP results in lost revenue, duplicate customer outreach, and damage to the customer relationship. Orders left unfollowed past 72 hours (without Sales coordination) are flagged at the next month-end review. Customer outreach made without first checking with Sales is logged as a duplicate-contact incident and reviewed by the CS Lead. Repeat incidents are escalated to the Operations Manager and may affect performance review.",
      "Exceptions: Deviations from this SOP are permitted only when the CS Lead approves them in writing (email or Teams message). Permitted grounds: (1) Sales has explicitly taken over the account and asked CS to stand down; (2) the customer is in a documented dispute or hold status (logged in ACT notes); (3) statutory holidays or system outages prevent normal follow-up — resume on the next business day.",
      "Why follow-up matters: Unfollowed orders create three predictable problems — orders remain stuck in Shopify and never convert to revenue; sales are delayed or lost outright when the customer's window of intent closes; customers forget their order, leaving the team to absorb the cost of resolution. Done consistently, follow-up secures the sale, maintains cash flow, and reduces lost orders."
    ]
  },
  {
    "id": "cs-005-customer-notes",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-005",
    "title": "General Customer Notes and Special Case: Out-of-Province Pickup Orders",
    "desc": "Covers how Customer Success handles the recurring special case of pickup orders for customers located outside Quebec, where Shopify incorrectly applies Quebec taxes. Also establishes the expectation that customer-specific notes in Shopify and the Customer Profiles document are reviewed before any order is processed.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-05-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-005_general-customer-notes-and-out-of-province-pickup-orders.pdf",
    "qrgPath": null,
    "purpose": "This SOP documents how Customer Success handles a recurring special case: pickup orders for customers located outside Quebec. Shopify's official pickup option recalculates taxes based on the Montreal head-office location and applies Quebec GST and QST, which produces an incorrect total for out-of-province buyers. The SOP also captures the broader expectation that customer-specific notes in Shopify and in the customer-profiles document are checked before any order is processed.",
    "scope": "Applies to every Customer Success representative who creates, edits, or invoices Shopify orders. Applies to any order flagged as pickup where the customer is not a Quebec resident and is arranging their own transportation. Out of scope: ordinary shipped orders that use carrier-calculated rates, and pickup orders where the customer is located in Quebec (Quebec taxes apply correctly in that case).",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Representative",
        "responsibility": "Checks customer-specific notes before processing any order, uses the correct custom shipping method for out-of-province pickup orders, communicates all changes transparently to the customer in writing, and documents every change in the Shopify order timeline and customer Notes panel."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Reviews repeated errors by the same representative, may escalate to a coaching plan, approves exceptions to the standard workflow (e.g., use of official pickup option for Quebec-based customers or other deviations with written approval and documented rationale)."
      }
    ],
    "cadence": "As needed",
    "steps": [
      {
        "title": "Check Customer-Specific Account Notes",
        "detail": "Before processing any order, check two sources of customer-specific instructions. First, consult the Customer Profiles & Order Details document located at P:\\Emna\\Copy of Customer Profiles & Order Details. This document captures rules such as invoicing every Friday, agreed shipping amounts, mandatory notes to add to Shopify orders, and approved payment methods. Also consult SOP-CS-003 Payment terms and order verification alongside this document. Second, open the customer's profile in Shopify and read the Notes panel before any order action. Note that the account name and day-to-day contact are not always the same person (e.g., the account may be registered to Amaan Panjwani while the purchasing manager is Dan). Notes also capture best time of day to call, who is in on which days, whether the customer prefers phone or email, and alternate phone numbers. Communicate with the Account Manager assigned to the customer, as they hold context that is not always written down."
      },
      {
        "title": "Identify Out-of-Province Pickup Orders",
        "detail": "Recognize when an order is set to Pickup from the Montreal head office for a customer located outside Quebec. When Shopify's official pickup option is used, it automatically applies Quebec GST and QST based on the fulfilment location, not the customer's province. This produces an incorrect tax amount and changes the final order total for any buyer outside Quebec. Tax rule: Selecting Shopify's official 'Pickup from Head Office' option forces Quebec taxes on the order regardless of the customer's billing or shipping address. Never use the official pickup option for an out-of-province customer."
      },
      {
        "title": "Create the Order Using the Correct Custom Shipping Method",
        "detail": "Use a custom shipping method instead of Shopify's official pickup option. The custom method leaves the tax calculation tied to the customer's address, producing the correct tax structure for the buyer's province. Steps: 1. Create the order in Shopify as normal, with the customer's correct shipping address selected. 2. At the shipping-method step, select Custom Shipping Method, set it at $0.00, and name it 'Pickup – Head Office'. Do not select the system-generated 'Pickup from Head Office' option. 3. Confirm that the tax line on the order matches the customer's province (for example, HST 13 percent for Ontario) and not Quebec GST plus QST. 4. Add the order note 'This order is for pickup.' in the Shopify order so the warehouse team knows the order is not to be shipped, even though the shipping method is no longer labelled 'Pickup' by Shopify. 5. Save the order and proceed to invoicing."
      },
      {
        "title": "Handle Payment if Order is Unpaid",
        "detail": "If the customer has not paid at the time the tax correction is made, offer the approved alternative payment methods (as illustrated by the Paul Counsell case where the customer had exceeded the limit on his credit card). Approved payment methods include: Credit card, E-transfer, Bank deposit, and other payment methods approved under SOP-CS-003 Payment terms and order verification. Attach the DSS Payment Information PDF to the email so the customer has the account details for e-transfer or bank deposit."
      },
      {
        "title": "Communicate Changes Transparently to the Customer",
        "detail": "Tax adjustments, total changes, and shipping-method changes are never made silently. The customer receives a written explanation covering what changed and why, before the new invoice is sent. Transparency rule: Never silently modify taxes, totals, or shipping methods. Always explain why the change was made, how taxes are calculated, and why the total changed. Cancel the previous invoice and issue a new one rather than editing the original in place. Use the reference email template, adapted to the specific customer, keeping the same four elements: acknowledge the customer's observation, explain why the original total was wrong, confirm the cancellation and reissue, and offer the alternative payment methods."
      },
      {
        "title": "Document All Changes in Shopify",
        "detail": "Every change made to a pickup order is recorded in the Shopify order timeline and in the customer notes so the next representative sees the history without needing to ask. Specifically: Add the pickup order note 'This order is for pickup.' to every pickup order, regardless of shipping method selected. Record the tax adjustment in the order comments with a brief explanation of the customer's province and the corrected tax line. If the cancellation-and-reissue flow is used, link the new invoice number in the order timeline so the trail is traceable. Update the customer's Notes panel if a recurring instruction emerges (for example, a customer who consistently arranges their own pickup transport). Review order history and status flags for context before any tax or shipping adjustment is made."
      }
    ],
    "notes": [
      "Pickup orders for customers outside Quebec require a manual workflow. The two non-negotiables are: use a custom shipping method instead of Shopify's official pickup option, and explain every change to the customer in writing before the new invoice is sent.",
      "Never use Shopify's official 'Pickup from Head Office' option for out-of-province customers — it forces Quebec GST and QST regardless of the customer's billing or shipping address.",
      "Always use a custom shipping method named 'Pickup – Head Office' set at $0.00 for out-of-province pickup orders.",
      "Always mark the order 'This order is for pickup.' in the notes so the warehouse team is informed.",
      "Document every change in the order timeline and the customer's Notes panel.",
      "Communicate transparently with the customer about what changed and why — never make silent tax or total adjustments.",
      "Non-Compliance: Using Shopify's official pickup option for an out-of-province customer produces an incorrect tax total and exposes DSS to a tax remittance error. The representative who issued the invoice is responsible for cancelling the incorrect invoice, reissuing the corrected one, and notifying the customer in writing the same business day the error is identified. Repeated occurrences of the same error by the same representative are reviewed by the Customer Success Lead and may be escalated to a coaching plan. Silent tax or total adjustments made without customer notification are treated as a breach of the transparency rule and are corrected by sending a follow-up explanation within one business day of detection.",
      "Exceptions: The Customer Success Lead may approve use of Shopify's official pickup option for a Quebec-based customer arranging their own transport, since Quebec taxes apply correctly in that case. Any other deviation — for example, applying Quebec taxes deliberately to an out-of-province order at the customer's written request — requires written approval from the Customer Success Lead and a note in both the order timeline and the customer's Shopify Notes panel explaining the basis for the exception."
    ]
  },
  {
    "id": "cs-006-csv-bulk-orders",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-006",
    "title": "CSV Bulk Order Entry for Wholesale Accounts",
    "desc": "Defines how Customer Success processes wholesale orders received as CSV or Excel attachments from B2B terms customers (e.g. Sir Vape-A-Lot, Flamingo). Covers CSV upload via Shopify Order Importer, stock verification against the Production File, draft order creation, and customer communication for partial or unavailable stock.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-05-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-006_csv-bulk-order-entry-wholesale.pdf",
    "qrgPath": "./sops/QRG-CS-006_csv-bulk-order-entry-wholesale.pdf",
    "purpose": "This SOP defines how Customer Success processes wholesale orders received as CSV or Excel attachments from terms customers such as Sir Vape-A-Lot and Flamingo accounts. It standardises CSV upload through the Shopify Order Importer, stock verification against the Production File, draft order creation, and customer communication when stock is partial or unavailable.",
    "scope": "Applies to every CSV or Excel order received at the DSS Info inbox from B2B terms customers. Covers single-customer orders (Sir Vape-A-Lot pattern) and multi-store rollups (Flamingo Manitoba, Alberta, and other Flamingo stores). There are other customers who place orders this way as well. Out of scope: retail web orders, EDI integrations, and credit-card-only customers, which follow SOP-CS-001 and SOP-CS-003.",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Team Member",
        "responsibility": "Picks up order emails from the shared DSS Info mailbox, downloads CSV attachments, uploads orders through the Shopify Order Importer, verifies stock against the Production File, creates draft orders, communicates partial fills to customers, and logs back-order opportunities in Missing Opportunities."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Owns this SOP. Approves exceptions such as shipping partially before completing the Excel mark-up and Missing Opportunities entry, with the back-fill logged the same day."
      },
      {
        "role": "David (Management/Operations)",
        "responsibility": "Approves release of security stock or unfinished inventory ahead of schedule. Decides stamping priorities, unfinished inventory holds, and province prioritisation. Point of escalation for unclear SKUs or new products not yet entered in the system."
      }
    ],
    "cadence": "As needed — triggered whenever a CSV or Excel wholesale order is received at the DSS Info inbox from a B2B terms customer.",
    "steps": [
      {
        "title": "Order Intake",
        "detail": "All customer orders arrive at the shared DSS Info mailbox so any team member can pick them up when the primary processor is absent. The order email normally contains the PDF purchase order, the CSV or Excel order file, and billing or shipping instructions. Open the email, confirm the PO or reference number, and download the CSV attachment to the local machine before opening Shopify. If the email is missing the CSV, reply to the customer and request it. Do not transcribe SKUs by hand."
      },
      {
        "title": "CSV Upload and Header Mapping in Shopify",
        "detail": "All CSV orders enter Shopify through the Order's up! CSV Order Importer app under Applications. Use the Single Order flow — not Pro Importer — for one customer per file. Steps: (1) In Shopify, open Applications > Order's up! CSV Order Importer > Single order. (2) Drag the CSV onto the Upload or Drop file here area. Accepted file types are .csv and .xlsx. (3) Wait for the file summary to populate (filename, lines, orders, fields). (4) Under Map headers, confirm sku -> SKU and qty -> Quantity. Click Auto map if either row is blank. (5) Review the Order Preview table. Every row must resolve to a barcode, a title, a quantity, a price, and a stock figure."
      },
      {
        "title": "Product and Stock Verification",
        "detail": "Pricing is managed automatically by Shopify, but stock must always be verified manually using the Production File. Cross-check every line before creating the draft. Sub-step 5.1 — Match the Excel file exactly: Follow the SKUs and quantities written in the customer's Excel file. Do not substitute SKUs or round quantities. For each line in the preview, confirm the SKU, the variant title, and the quantity match the source file. Sub-step 5.2 — Read the stock column: Positive stock that exceeds the order quantity means the line is safe to proceed. Negative or zero stock means flag the row — do not assume stock; check the Production File before confirming the line. Stock shown as Unknown or barcode shown as N/A means the SKU is missing or new — flag the line for manual lookup. Sub-step 5.3 — Confirm against the Production File: The Production File is the source of truth for available stock, unfinished inventory, and reserved quantities. Always refresh the file before reading it. Access the personal copy at Public > Emna > Production File – Emna (working from a personal copy avoids save conflicts). Search with Ctrl+F by full product name including province (e.g. 'Original Salt 30ML by Don Cristo Ontario'). For each flagged SKU, verify: unfinished inventory, reserved quantities, and remaining available stock. Sub-step 5.4 — Availability calculation: If a product is short in Shopify but unfinished inventory exists, calculate the real availability before deciding to invoice or back-order. Use the formula: Available = Unfinished inventory minus Reserved on other orders. Example: 50 unfinished, 25 reserved, 7 ordered = 25 available — sufficient to invoice in full. Note: A product that is mixed today but not yet bottled is normally available the next day at the earliest. If the customer needs same-day shipping, tell them the liquid is mixed but not ready and offer next-day instead. Stamping priorities, unfinished inventory holds, and province prioritisation are decided by David."
      },
      {
        "title": "Resolving Missing SKUs in Flamingo Orders",
        "detail": "Flamingo CSVs are grouped by store (Manitoba, Alberta, others). Because the same Flamingo SKU prefix is reused across provinces, missing variants are common and must be cleaned up before the draft is created. Steps: (1) In the order preview, look for Item warnings callouts and any line where the barcode is N/A or the stock is Unknown. (2) Flag those rows in the Excel file with a distinct highlight colour. Common root causes: incorrect SKU, missing customer or province code in the SKU. (3) In the draft order, delete the broken line by clicking the x beside the zero-priced product. (4) Use the Add product search to locate the correct variant by product name and province (e.g. 'Riot Blue Burst 60ml MB 3mg'). Tick the correct 3mg Manitoba or 6mg Manitoba variant and click Add. (5) If no variant matches, the product may be new or not yet entered. Ask David or check Teams > DSS Dashboard before promising the line to the customer."
      },
      {
        "title": "Highlight Confirmed Quantities in the Excel File",
        "detail": "Before creating the draft, mark up the source Excel so the audit trail matches the invoice. The marked-up file is the working record for the order and supports back-order communication. Actions: Highlight confirmed quantities in green or yellow. Mark partial fills in orange and add the actual shipped quantity in the Shopify or Production File column. Mark missing or unmatched SKUs in a distinct colour (typically orange or red). Annotate UNFINISHED or stamping notes for any line that is partially fillable today but more is on the way."
      },
      {
        "title": "Create the Draft Order and Verify the Customer",
        "detail": "Steps: (1) In the CSV importer, click Create Draft Order in the top right. (2) On the confirmation modal, click View order to open the draft. (3) In the draft order, double-check: customer name, shipping address, billing address, shipping method, and any customer notes. (4) Confirm the PO number is recorded in the order notes (e.g. #25887 for Sir Vape-A-Lot). (5) Confirm the customer tag and sales-rep tag (e.g. SIRVAPEALOT, GABRIEL) match the customer record. (6) If quantities differ from the customer's ask because of stock, edit them now to the actual shipped quantity. Do not invoice quantities we cannot ship. (7) Confirm the order is marked as paid or on terms as appropriate, then create the order."
      },
      {
        "title": "Customer Communication for Partial or Out-of-Stock Orders",
        "detail": "When the invoice ships short, the customer is told in the same email that carries the invoice. One clear email per order — no follow-up needed. Actions: Reply to the order email with the invoice attached. List each SKU that was not invoiced or was partially invoiced, with the reason (out of stock, not yet bottled, not yet stamped). For partial fills, state both the ordered quantity and the shipped quantity (e.g. 'you ordered 20, we invoiced 17'). If the product is coming back in stock, say so and commit to a follow-up only when stock returns — do not over-promise dates. Standard wording: 'Hello, thank you for your PO. Please find attached a copy of your invoice. Please note that we did not invoice <qty> of <product> as it is currently out of stock. We will keep you updated as soon as it is back in stock. Best regards, <name>.'"
      },
      {
        "title": "Tracking Missing or Back-in-Stock Opportunities",
        "detail": "Every short shipment becomes a sales opportunity once stock returns. Recording them keeps the next-order conversation easy and prevents missing repeat orders from large stores. Actions: Open Teams > DSS – Sales Hub > Missing Opportunities. Add the customer, SKU, ordered quantity, missed quantity, and the reason (out of stock, stamping, new product). When the SKU returns, contact the customer and offer them the chance to place a new order. Prioritise large accounts such as Alberta or Manitoba stores. If anything is unclear, ask David directly or post to the DSS Dashboard channel. Confirm stock before promising anything to a customer."
      }
    ],
    "notes": [
      "Non-Compliance: Skipping the Production File check, trusting Shopify stock alone, or invoicing SKUs that cannot ship the same day causes back-orders the customer learns about only after the invoice arrives. Consequences include refund or credit work, customer trust loss, and lost re-orders from large stores.",
      "Invoicing a quantity that cannot be shipped triggers a damaged-credit case under SOP-CS-004 and requires a refund or credit memo.",
      "Promising a delivery date for unfinished inventory without confirming the stamping or bottling stage will be flagged at the Sales review.",
      "Failing to record a back-order in Missing Opportunities forfeits the follow-up sale once stock returns.",
      "Exception — SKU substitution: Substituting a SKU at the customer's request requires written confirmation from the customer on the email thread and a note on the draft order.",
      "Exception — Security stock or unfinished inventory: Releasing security stock or unfinished inventory ahead of schedule must be approved by David only.",
      "Exception — Partial shipping before mark-up: Shipping partially before completing the Excel mark-up and Missing Opportunities entry must be approved by the Customer Success Lead, with the back-fill logged the same day.",
      "Workflow summary (10 steps): (1) Receive order email at DSS Info, download CSV. (2) Upload CSV through Order's up! Single Order. (3) Confirm header mapping and order preview. (4) Verify each line against the Production File. (5) Resolve missing or unknown SKUs (delete + manual add). (6) Highlight confirmed and partial rows in the Excel file. (7) Create Draft Order, then View order. (8) Verify customer, address, tags, PO number, quantities. (9) Email the invoice; document partial fills in the body. (10) Log missing or back-in-stock items in Missing Opportunities.",
      "Production stage note: A product that is mixed but not yet bottled is normally available the next day at the earliest. Same-day shipping cannot be promised for unfinished inventory. Stamping priorities and province prioritisation are decided by David."
    ]
  },
  {
    "id": "cs-008-product-swap",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-008",
    "title": "Product Swap Customer Outreach",
    "desc": "Defines how Customer Success contacts customers when a product on their order is out of stock and a replacement is required. The goal is to keep the order active, swap the missing item for an in-stock alternative, and ship the same day.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-06-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-008_product-swap-customer-outreach.pdf",
    "qrgPath": "./sops/QRG-CS-008_product-swap-customer-outreach.pdf",
    "purpose": "This SOP defines how Customer Success contacts customers when a product on their order is out of stock and a replacement is required. The objective is to keep the order active, swap the missing item for an in-stock alternative, and ship the same day without creating unnecessary accounting work.",
    "scope": "Applies to all Customer Success agents handling open wholesale and retail orders where one or more line items are flagged out of stock by the warehouse or by Shopify inventory. Out of scope: damaged or defective product issues (see SOP-CS-003), credit-only requests raised by the customer after a swap has been declined, and shipping carrier escalations that do not involve a stock substitution.",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Agent",
        "responsibility": "Identifies out-of-stock items, researches in-stock alternatives, contacts the customer, captures their decision, notifies the warehouse via Teams, and documents the resolution in order notes."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Owns this SOP, handles escalations when a customer insists on credit instead of a swap, pre-approves exceptions (credit-first approach or direct Shopify order modification), and reviews repeated deviations for coaching or performance action."
      }
    ],
    "cadence": "As needed — triggered whenever a line item on an open order is flagged out of stock by the warehouse or Shopify inventory",
    "steps": [
      {
        "title": "Overview of the swap flow",
        "detail": "The swap flow follows a fixed order: confirm the shortfall, identify in-stock alternatives, contact the customer, capture their decision, notify the warehouse via Teams, and document the resolution in the order notes. The order in Shopify is not modified directly — the warehouse swaps the inventory item at pick time while the order record remains unchanged. Example scenario referenced throughout: Juicy Peach Ice STLTH Loop Max Pod is out of stock on order DSS166519. The agent contacts the customer, who selects Peach Berry STLTH Loop Max Pod as the replacement. The warehouse is notified in Teams and ships the order the same day."
      },
      {
        "title": "Identify in-stock alternatives",
        "detail": "Before contacting the customer, open Shopify Stock and filter the product family of the out-of-stock SKU (for example, STLTH Loop MAX Pod) to see what is currently available in the customer's province. Note the available quantity for each candidate replacement — customers ask, and quoting numbers shortens the call. Filter by product family (e.g. Ice STLTH Loop MAX Pod) to surface comparable alternatives only. Filter by the customer's province so quoted stock matches the warehouse that will ship the order. Record at least three to five viable alternatives before reaching out — enough to give the customer real choice without overwhelming them."
      },
      {
        "title": "Contact the customer",
        "detail": "Reach out by the channel the customer responds to fastest. Phone works well for retail customers who manage inventory in real time, and especially well for accounts that place orders on a fixed weekly cadence (for example, Monday orders). Email is appropriate for customers who have asked to be contacted in writing or who are not reachable by phone within the same business hour. Check ACT for the customer's preferred contact method before choosing phone or email. Send the email in the customer's working language — English or French. Mark the email High importance and reference the order number (e.g. #DSS166567) in the subject line. List every viable alternative identified in the previous step. State that stock will be verified once the customer chooses. Close with a same-day shipping ask: 'Please let us know as soon as possible so we can ship your order today.'"
      },
      {
        "title": "Capture the customer's decision",
        "detail": "Once the customer confirms a replacement, record their choice in the order notes verbatim. If the reply arrives by email, the email thread itself is the audit trail — leave it intact and attach or reference it in the order. If the confirmation came by phone, type the customer's exact words into the order note before moving on. Example: customer confirms by email 'Nous allons prendre le Strawberry Kiwi ice.'"
      },
      {
        "title": "Notify the warehouse via Teams",
        "detail": "The warehouse acts only on instructions posted in the Teams 'Warehouse Questions' channel — not on email, not on Shopify notes, not on verbal handoffs. Post the swap instruction the same day the customer confirms so the order ships without delay. Steps: (1) Open Teams and navigate to the Warehouse Questions channel. (2) Locate the existing thread for the out-of-stock SKU, or start a new post tagged with the order number and the customer name. (3) Post the swap instruction using the standard phrasing: 'Swap for <replacement product>.' Example: 'Please swap to Peach Berry STLTH Loop MAX Pod.' (4) Wait for the warehouse acknowledgement (thumbs-up reaction or reply) before closing the thread."
      },
      {
        "title": "Handle shipping limitations",
        "detail": "Express shipping is occasionally unavailable on swap days — for example, the warehouse may confirm that no 1-day shipping is available and that only 2- to 3-day options remain. When this happens, inform the customer immediately, explain that the carrier limitation is outside DSS control, and capture their acknowledgement in the order note. Example note: 'Customer advised that only 2- to 3-day shipping options were available. Customer confirmed this was acceptable.'"
      },
      {
        "title": "Apply the swap-first decision rule",
        "detail": "The initial outreach offers a replacement product only — never credit, never refund. A swap keeps the sale active, ships faster, and avoids the accounting and tracking work a credit creates. If the customer insists on credit after the swap is offered, escalate the request to the Customer Success Lead and process the credit through the standard credit workflow rather than offering it up front."
      }
    ],
    "notes": [
      "Non-Compliance: Modifying the order directly in Shopify (changing line items, swapping SKUs) causes the warehouse pick list and the order record to drift apart and creates billing reconciliation work for Finance. Offering credit instead of a swap on the first contact extends the fulfilment cycle and triggers an accounting entry that the swap would have avoided. Failing to post the swap in Warehouse Questions the same day the customer confirms delays shipment and may push the order outside the customer's expected delivery window. Repeated deviations are reviewed by the Customer Success Lead and may result in coaching, reassignment of the account, or formal performance action.",
      "Exceptions: Credit may be offered on the first contact only when the customer has already declined every available alternative on a prior swap, or when the Customer Success Lead has pre-approved a credit-first approach for the account. The Shopify order may be modified directly only with explicit approval from the Customer Success Lead, and only after the warehouse has been notified that the original pick is cancelled. All exceptions are logged in the order note with the approver's name, the date, and the reason for the deviation.",
      "Always record at least three to five viable in-stock alternatives before contacting the customer to provide real choice.",
      "The warehouse acts only on instructions posted in the Teams Warehouse Questions channel — not on email, not on Shopify notes, not on verbal handoffs.",
      "Wait for warehouse acknowledgement (thumbs-up reaction or reply) in Teams before closing the swap thread."
    ]
  },
  {
    "id": "cs-009-refund-process",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-009",
    "title": "Refund Process for E-Transfer Payments Converted to Credit",
    "desc": "Defines how Customer Success processes refunds for orders originally paid by e-transfer. E-transfer payments are not refunded as cash; instead the amount is recorded as a credit on the customer's account and applied manually to a future order.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-06-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-009_refund-process-e-transfer-credit.pdf",
    "qrgPath": "./sops/QRG-CS-009_refund-process-e-transfer-credit.pdf",
    "purpose": "This SOP defines how Customer Success processes refunds for orders originally paid by e-transfer. E-transfer payments are not refunded back to the customer as cash; instead the amount is recorded as a credit on the customer's account and applied manually to a future order. The procedure ensures the credit is documented in Shopify and in the internal tracking sheet so Finance and CS can reconcile balances accurately.",
    "scope": "Applies to all Customer Success staff who handle refund requests for orders paid by Interac e-transfer. Covers credits raised for out-of-stock products, batch issues, fulfilment shortfalls, and warehouse-approved returns or adjustments. Out of scope: refunds for orders paid by credit card or Authorize.Net (refunded back to the original payment method) and overpayment credits handled directly by Finance.",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Staff",
        "responsibility": "Handle refund requests for orders paid by Interac e-transfer, raise credits in Shopify, log credits in the internal tracking sheet, notify the Cancelled Orders Teams channel, and communicate with the customer."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Owns this SOP, escalates repeat non-compliance instances, and reviews performance during the monthly CS performance check-in."
      },
      {
        "role": "Finance",
        "responsibility": "Uses the tracking sheet for accounting reconciliation and month-end customer balance reconciliation. Must provide prior written approval for direct e-transfer refunds (exceptions)."
      }
    ],
    "cadence": "As needed — triggered when a refund request is received for an order paid by Interac e-transfer.",
    "steps": [
      {
        "title": "Determine when to issue a credit",
        "detail": "Customer Success issues a credit on an e-transfer order when any of the following conditions apply: (1) The product is out of stock or has a batch issue. (2) The order cannot be fully fulfilled. (3) A return or adjustment is approved by the warehouse or operations team. Example: an order contains six bottles of Blueberry 6mg flagged with a batch issue by the warehouse — a credit equal to the value of the six bottles is required."
      },
      {
        "title": "Create the refund in Shopify",
        "detail": "Process the refund directly in the Shopify order record: (1) Open the order in Shopify using the order reference (e.g., DSS166642). (2) Click Refund / Credit on the order page. (3) Add the affected line items, including the product name (e.g., Blueberry 6mg) and the exact quantity (e.g., six bottles). (4) Enter a clear refund reason in the reason field using one of the standard approved reasons below, adding specifics where relevant. Approved refund reasons: Batch issue; Product quality issue; Warehouse request. Reasons must be specific enough to be traced later — 'Refund' or 'adjustment' on their own are not acceptable."
      },
      {
        "title": "Log the credit in the internal tracking sheet",
        "detail": "Every credit raised in Shopify is logged in the 'Copy of Customer Profiles & Order Details' Excel sheet located at Public > Emna > Copy of Customer Profiles & Order Details. Record the following: (1) Customer name and order reference number (e.g., James Refuse DSS166642). (2) Credit amount in CAD (e.g., $111.71). (3) Once the credit is applied to a future order, add the order number it was applied to, the amount of that order, and the remaining credit balance. New credit entries are appended at the bottom of the sheet. The tracking sheet supports three downstream uses: accounting reconciliation by Finance; order tracking by Customer Success; and future credit reconciliation when the customer places a new order."
      },
      {
        "title": "Notify the Cancelled Orders channel in Teams",
        "detail": "Go to the Cancelled Orders channel in Microsoft Teams. Post the order number followed by 'partial refund'. Example message: 'DSS166642 PARTIAL REFUND'."
      },
      {
        "title": "Send customer confirmation email",
        "detail": "Send the customer a confirmation email immediately after the credit is logged. Attach the Shopify refund PDF (file name format: refund_DSS<order_number>.pdf) so the customer has documented proof of the credit amount. Use the following standard confirmation email template: 'Hello, Please find attached the proof of your refund in the amount of $<amount>. This amount has been added to your account as a credit, which you can use on your next order. A little heads-up would be much appreciated if you can let us know which order you would like to apply this credit to in the future, so we can advise the accounting team. You would then only need to pay the remaining balance. Thank you.'"
      },
      {
        "title": "Apply credit to a future order (when requested)",
        "detail": "When the customer places a new order and asks to apply an existing credit: (1) Check the 'Copy of Customer Profiles & Order Details' sheet to confirm the customer has available credit and note the amount. (2) Add an order note to the new Shopify order indicating the credit amount being applied and the original credit reference. (3) Advise the customer that they must pay the remaining balance only. (4) Update the tracking sheet to mark the credit as applied, including the new order reference. Worked example: Order total $100.00 minus available credit $9.00 — customer pays $91.00. Another example: $1,231.36 order total minus $1,203.61 credit applied = $27.75 customer pays."
      }
    ],
    "notes": [
      "Credits are not automatically tracked or applied for future use. The customer must inform Customer Success when they want to use the credit, as Shopify will not deduct it from a new order automatically. Always leave clear notes in the tracking sheet at the time the credit is raised, and always include the 'let us know' line in the customer confirmation email so the customer is prompted to flag the credit on their next order.",
      "Documentation discipline — for a credit to be honoured later, all four records must be in place: (1) Shopify refund is logged with a specific reason on the original order. (2) Tracking sheet has a row for the credit amount and order reference. (3) Customer confirmation email is sent with the refund PDF attached. (4) Customer is reminded to mention the credit on their next order. Clear notes at the time of the refund prevent accounting errors and customer-facing confusion months later.",
      "Non-Compliance: Refunds processed in Shopify without a corresponding entry in the tracking sheet are treated as untracked credits. Untracked credits cause two recurring problems: Finance cannot reconcile the customer balance at month-end, and the credit cannot be applied to a future order because there is no internal record of it. Repeat instances are escalated to the Customer Success Lead and reviewed during the monthly CS performance check-in. Refunds entered with a vague reason ('refund', 'adjustment', blank) are corrected on the spot and the agent who raised them is coached.",
      "Exceptions: A direct e-transfer refund (rather than a credit) is permitted only with prior written approval from Finance, recorded in the tracking sheet alongside the order reference. Typical grounds: the customer has explicitly closed their account, the credit amount is below the cost of a future minimum order, or the original payment was made in error. The CS agent must capture the Finance approval message (screenshot or copy of the email) in the tracking sheet row before issuing the e-transfer."
    ]
  },
  {
    "id": "cs-010-popa-vape",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-010",
    "title": "Popa Vape Flavour Shot Order Processing",
    "desc": "Defines the manual workflow for processing Popa Vape Flavour Shot (FLVR SHOT) orders received by email, covering intake, draft order creation, stock verification, discounting, invoicing, and customer communication. Required because the Flavour Shot catalogue is not integrated with the main Shopify configuration.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-06-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-010_popa-vape-flavour-shot.pdf",
    "qrgPath": "./sops/QRG-CS-010_popa-vape-flavour-shot.pdf",
    "purpose": "This SOP defines the manual workflow for processing Popa Vape Flavour Shot (FLVR SHOT) orders received by email. The Flavour Shot catalogue is not integrated with the main Shopify configuration, so every order is entered, verified, and invoiced by hand. The procedure exists to prevent stock errors, mis-shipments, and billing mistakes that cannot be caught automatically.",
    "scope": "Applies to Customer Success staff handling Flavour Shot orders for Popa Vape stores in Quebec and Ontario. Covers email intake, draft order creation in the FLVR SHOT Shopify store, stock verification, discount and shipping rules, invoicing, and customer communication. Out of scope: Popa Vape orders placed directly on Shopify by the customer (those flow through the standard order path) and DSS Distro orders, which follow SOP-CS-006 for CSV bulk entry.",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Staff",
        "responsibility": "Handle end-to-end Flavour Shot order processing: intake from the POPA VAPE ORDERS Outlook folder, manual draft order entry in the FLVR SHOT Shopify store, stock verification, discount and shipping application, address verification, invoicing, and customer email communication."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Owns this SOP; approves exceptions such as free shipping below the $1,000 threshold and combining Flavour Shot with DSS Distro shipments; receives escalations for repeated non-compliance."
      },
      {
        "role": "David",
        "responsibility": "Manages Flavour Shot inventory and incoming stock; the authoritative contact for restock timelines and written confirmation required before holding an order for a future restock."
      }
    ],
    "cadence": "As needed — triggered upon receipt of a Popa Vape Flavour Shot order email",
    "steps": [
      {
        "title": "Open and review the incoming order email",
        "detail": "Open the POPA VAPE ORDERS Outlook folder and select the incoming order email. Save the CSV attachment locally and confirm the requesting store address from the email."
      },
      {
        "title": "Understand the CSV format and box rule",
        "detail": "Each line of the CSV follows the structure: Product Title : Quantity. Examples: 'BlackBerry Mojito Exotic : 1' or 'Sweet Mango Mojito : 2'. Customers cannot purchase single bottles — all Flavour Shot products ship in boxes of 10 units. Verify that every quantity follows the box rule before adding any line to the draft order. For large orders with many lines, use the Excel filter inside the CSV file to group products by quantity (e.g. Qty = 1, Qty = 3, Qty = 4) before entry."
      },
      {
        "title": "Create a new draft order in the FLVR SHOT Shopify store",
        "detail": "Open the FLVR SHOT Shopify store and click Create order from the Orders dashboard."
      },
      {
        "title": "Select the correct customer account",
        "detail": "Search for and select the customer account 'Popa Vape'. Do not select any accounts that include a city name (e.g. Popa Vape Matane). The generic Popa Vape account must be used."
      },
      {
        "title": "Enter each product line manually",
        "detail": "Search by flavour name (for example 'Watermelon Lime') and select the 'Box of 10' variant — never the single-bottle variant. Enter the requested quantity in boxes, not bottles (e.g. 1 = 1 box of 10)."
      },
      {
        "title": "Verify available stock for every line",
        "detail": "Check the Available stock count for each Box of 10 variant before confirming the line. The Available column inside the Shopify product picker is authoritative. Treat any value of 0 or below as out of stock and do not invoice that flavour. Never assume stock is available. If a flavour is unavailable: do not invoice it, mention the shortage clearly in the customer email, do not reserve inventory or monitor restocks automatically, and if the customer asks when stock will return, check with David."
      },
      {
        "title": "Apply discount and shipping rules",
        "detail": "Apply the 10% VIP discount to the order — every Popa Vape customer is eligible. Apply shipping fees normally. Free shipping applies only when the order total reaches $1,000 before tax; below that threshold the customer pays shipping. Flavour Shot orders ship separately from DSS Distro orders and are never combined automatically. The older practice of waiting for a DSS order to combine shipments is discontinued because payment timing varies too much between the two streams."
      },
      {
        "title": "Verify shipping and billing addresses",
        "detail": "Before saving the draft, verify all four address fields: shipping address, billing address, unit or apartment number, and postal code. Procedure: (1) Open the customer account (Popa Vape). (2) Click the three-dot menu on the right and open the shipping section. (3) Search the saved addresses and match the entry that corresponds to the requesting store (e.g. 489 Rue Notre-Dame Ouest, Montréal, QC H4C 1A7). (4) If multiple saved addresses match, confirm against the store name and PO before selecting one."
      },
      {
        "title": "Run the draft order verification checklist",
        "detail": "Before generating the invoice, confirm every item on the checklist: (1) Products — every requested flavour is present and matches the customer CSV. (2) Quantities — only boxes of 10 are selected, no single bottles. (3) Discounts — 10% VIP discount is applied. (4) Shipping fees — free shipping is applied only if the order is $1,000 or more before tax. (5) Shipping address — matches the requesting store in the email; unit and postal code are correct. (6) Billing address — matches the Popa Vape billing address in the email. (7) Tags — PO number is recorded in the notes, 'Gabriel' is in tags. (8) Out-of-stock items — removed from the invoice and flagged for the customer email. After the checklist is complete, add the PO number in the order note and 'Gabriel' in the tags, then save the draft."
      },
      {
        "title": "Generate the invoice PDF",
        "detail": "Generate the invoice from the saved draft using the Vify Order Printer app. Use the Print Invoice option to download the PDF and attach it to the customer email."
      },
      {
        "title": "Send the customer email",
        "detail": "Reply to the original order email (do not create a new email thread) and change the subject to the standard format: 'Facture Flavor Shot – <Store Location> – <PO number> – <date>' (example: 'Facture Flavor Shot – Montréal St. Henri – PO12345 – May 7'). Always include factures@popavape.com on every reply. Attach the invoice PDF. Use the French email body template: 'Bonjour [Prénom], Merci pour votre PO. Vous pouvez trouver en pièce jointe une copie de votre facture. Veuillez noter que nous n'avons pas facturé les saveurs suivantes en raison d'une rupture de stock : [Saveur 1], [Saveur 2]. Merci de nous aviser si vous avez des questions. Cordialement,' — remove the rupture-de-stock paragraph if every requested flavour was invoiced. After entry, review the full order one more time to confirm every product is present and every quantity matches the customer PO."
      }
    ],
    "notes": [
      "Always verify stock manually before adding a product line. The Available column in Shopify is authoritative; treat 0 or below as out of stock.",
      "Always select the 'Box of 10' variant — never the single-bottle variant. Entering a single-bottle variant instead of a Box of 10 results in incorrect pricing and a short shipment.",
      "Always include factures@popavape.com on every customer email reply. Omitting this address breaks the customer's internal accounting workflow.",
      "Free shipping applies only when the order total reaches $1,000 before tax. Applying free shipping below this threshold reduces margin and triggers a finance review.",
      "Flavour Shot orders ship separately from DSS Distro orders. Do not wait to combine shipments — the older practice of combining is discontinued.",
      "For restock timelines, check with David only. Do not promise restock dates without David's written confirmation.",
      "Non-compliance consequences: invoicing an out-of-stock flavour forces a refund or credit note and damages the customer relationship; repeated breaches are escalated to the Customer Success Lead and logged against the responsible agent for coaching.",
      "Exceptions require prior approval: (1) Free shipping below $1,000 — requires Customer Success Lead approval, recorded as a note on the draft order. (2) Combining Flavour Shot with a DSS Distro shipment — requires both Customer Success Lead and David's approval; not permitted for new orders without written confirmation. (3) Holding an order for a future restock — only when David confirms incoming stock in writing; otherwise process as out of stock and let the customer reorder.",
      "Document the order with screenshots when an unusual case arises."
    ]
  },
  {
    "id": "cs-010-warehouse-questions",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-010",
    "title": "Warehouse Questions and Back-Order Resolution",
    "desc": "Defines how the Customer Success team handles warehouse questions, back orders, customer communication, refunds, draft orders, and email procedures for DSS Distro and FLVR SHOT orders. Standardizes decisions for discontinued or out-of-stock items to ensure same-day shipments and proper customer notification.",
    "status": "Active",
    "version": "1.0",
    "effectiveDate": "2026-06-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-010_warehouse-questions-resolution.pdf",
    "qrgPath": null,
    "purpose": "This SOP defines how the Customer Success team handles warehouse questions, back orders, customer communication, refunds, draft orders, and email procedures. It standardizes decisions made when items are discontinued or out of stock, so shipments leave the warehouse the same day and customers are informed in their preferred language.",
    "scope": "Applies to every member of the Customer Success team handling DSS Distro and FLVR SHOT (Flavor Shot) orders. Covers Microsoft Teams monitoring, warehouse question resolution, customer outreach, refunds, draft orders, sample swaps, and email standards. Pricing approvals, credit-limit changes, and wholesale account onboarding are out of scope and handled under separate SOPs.",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Team Member",
        "responsibility": "Monitor the Warehouse Questions Teams channel continuously, resolve warehouse questions before 3:00 PM, contact customers about discontinued or out-of-stock items, process refunds, document all interactions in Act, and maintain brand separation between DSS Distro and Flavor Shot communications."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Owns this SOP, approves exceptions (e.g., refunding e-transfer payments as outbound transfers, holding warehouse decisions past 3:00 PM), and escalates repeated non-compliance to performance reviews. Reviews approved exceptions monthly to identify patterns warranting permanent SOP updates."
      },
      {
        "role": "Warehouse Staff",
        "responsibility": "Post questions to the Warehouse Questions Teams channel when an order contains a discontinued or out-of-stock item, and action the CS team's decisions (hold, split-ship, or swap) to meet same-day shipping cutoffs."
      },
      {
        "role": "Warehouse Manager",
        "responsibility": "May decide sample replacements internally without requiring customer approval for substitutions on free samples."
      }
    ],
    "cadence": "Continuous (Warehouse Questions channel monitored at all times); daily priority checks each morning and after each break; urgent decisions resolved before 3:00 PM daily.",
    "steps": [
      {
        "title": "Monitor Teams Channels",
        "detail": "Microsoft Teams is the main communication platform. Monitor the following channels daily: Warehouse Questions (discontinued/out-of-stock items, swaps, holds — continuous, priority monitoring), Missed Opportunities (quoted orders not converted; recovery actions — daily review), General (company-wide announcements — daily review), Sales Meeting (pre-read and outcomes for sales sync — as scheduled), SOPs and Policies (process updates — on change), Cancelled Orders (internal notes confirming refunds completed — on refund). The Warehouse Questions channel must be monitored continuously — urgent shipping decisions are often required within minutes."
      },
      {
        "title": "Read and Assess the Warehouse Question Post",
        "detail": "Open the Warehouse Questions Teams channel and read the post in full. Note the order reference, customer name, item, and quantity. Posts follow a standard format: order reference, customer name, item, quantity affected, and a short note."
      },
      {
        "title": "Review Customer Order History",
        "detail": "Review the customer's order history before deciding. Confirm whether the customer already has another back order so shipments can be combined. Avoid refunding the full back-ordered quantity before checking order history — if the customer has another open back order, combining shipments and partial swaps usually keeps the customer whole."
      },
      {
        "title": "Determine the Cause",
        "detail": "Determine whether the issue is due to a discontinued item (item will not return to stock) or an out-of-stock item (temporary, expected to return). This distinction drives the resolution path offered to the customer."
      },
      {
        "title": "Contact the Customer and Obtain a Decision",
        "detail": "Contact the customer with a clear, professional message that includes the order number, product name, and the specific reason for the issue. For discontinued items: state plainly that it will not return to stock and offer alternatives where a comparable SKU exists. For out-of-stock items: offer to hold or split-ship. Use French for Quebec customers and English for all other customers. Lead with the action being taken (swap, refund, hold) before the explanation. Offer at least one alternative when an item is discontinued and a comparable SKU exists. Reference the order number in every message — never a vague 'your order'. For FLVR SHOT orders, use the official Flavor Shot email address and keep Flavor Shot brand identity separate from DSS Distro."
      },
      {
        "title": "Process Refund if Required",
        "detail": "Refunds follow the original payment method whenever possible. Credit card: process the refund directly to the original card (refer to SOP-CS-001). E-transfer: issue the refund as a customer account credit instead of attempting an outbound transfer (refer to SOP-CS-009). Notify the customer by email once the refund is processed. Add an internal note confirming the refund in the Cancelled Orders Teams channel."
      },
      {
        "title": "Post Resolution Back to Warehouse Questions Channel",
        "detail": "Post the customer's decision back to the Warehouse Questions channel with the order reference, the action taken, and any refund or credit applied. If the customer response cannot be obtained before 3:00 PM, post a follow-up note to the warehouse channel so the warehouse team can hold or split-ship the order accordingly."
      },
      {
        "title": "Document Swaps and Samples",
        "detail": "Free samples do not always require customer approval for substitutions — warehouse managers may decide sample replacements internally. All swaps, whether sample or paid, are documented on the Warehouse Questions Teams channel with the order reference and the SKUs swapped."
      },
      {
        "title": "Apply FLVR SHOT Order Rules",
        "detail": "Flavor Shot orders use a separate brand identity, email address, and ordering rules. Distinguish Flavor Shot orders from DSS Distro orders on every interaction. Flavor Shot wholesale customers must order full boxes, not individual units. Only end consumers may order individual bottles. Use the official Flavor Shot email address for all Flavor Shot communications. Document discontinued Flavor Shot items carefully, as some customers may still have old back orders against them. Keep communication standardized for consistency across the Flavor Shot customer base."
      },
      {
        "title": "Follow Email Best Practices",
        "detail": "Use templates whenever possible to save time and keep tone consistent. Every customer email must be professional, clear, and concise. Always include the order reference number in the subject line and body. Send from the correct company email address: DSS Distro email for DSS orders, Flavor Shot email for Flavor Shot orders. Mark messages as high importance only when an urgent decision is required. For Quebec customers, use the standard French refund-notification template. Example French template: 'Bonjour [Customer], Nous souhaitons vous informer que nous avons procede au remboursement de l'item figurant dans votre commande puisque cette saveur a ete discontinuee. Afin de ne pas retarder votre commande d'aujourd'hui, le remboursement a ete effectue directement sur votre carte Visa. Merci et bonne journee, L'equipe Flavor Shot.'"
      },
      {
        "title": "Execute Daily Priority Checklist",
        "detail": "1. Check the Warehouse Questions Teams channel first thing in the morning and after each break. 2. Handle urgent shipping decisions before 3:00 PM so the warehouse can process same-day. 3. Follow up on open back orders and discontinued items — verify whether stock has returned or alternatives are available. 4. Update customers proactively when their order status changes — do not wait for the customer to chase. 5. Verify stock in Shopify/Production file before confirming any new order or replacement SKU. 6. Document every customer interaction in Act — swaps, refunds, holds, and language preferences."
      }
    ],
    "notes": [
      "CRITICAL DEADLINE: All warehouse questions must be resolved before 3:00 PM whenever possible so changes can be processed and shipped the same day.",
      "COMMON MISTAKE: Refunding the full back-ordered quantity before checking order history. If the customer already has another open back order, combining shipments and partial swaps usually keeps the customer whole — a blind refund costs a sale that could have been saved.",
      "NON-COMPLIANCE — Unanswered Questions: Warehouse questions left unanswered past 3:00 PM force the warehouse to hold the affected order to the next business day, which delays the entire customer order and triggers re-pick labour.",
      "NON-COMPLIANCE — Missing Refund Notes: Refunds processed without an internal note in the Cancelled Orders channel create accounting reconciliation gaps at month-end.",
      "NON-COMPLIANCE — Brand Separation: Sending DSS Distro communications from the Flavor Shot email address (or vice versa) confuses customers and violates brand separation. Repeated non-compliance is escalated to the Customer Success Lead and reflected in the next performance review.",
      "EXCEPTIONS: The Customer Success Lead may approve deviations — for example, refunding an e-transfer payment back as an outbound transfer for a top-tier wholesale account, or holding a warehouse decision past 3:00 PM when the customer is unreachable and the order is non-urgent. Every approved exception must be logged in the Cancelled Orders or Warehouse Questions Teams channel with the approver's name and the reason. Exceptions are reviewed monthly to identify recurring patterns that may warrant a permanent SOP update.",
      "LANGUAGE RULE: Use French for Quebec customers and English for all customers outside Quebec on every outbound communication.",
      "FLVR SHOT RULE: Flavor Shot wholesale customers must order full boxes only; individual bottles are reserved for end consumers only.",
      "REFUND METHOD RULE: Credit card refunds go back to the original card (SOP-CS-001); e-transfer refunds are issued as account credit, not outbound transfers (SOP-CS-009)."
    ]
  },
  {
    "id": "cs-011-vape-street",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-011",
    "title": "Vape Street Holdings Order Recreation",
    "desc": "Defines how Customer Success recreates Vape Street Holdings franchise orders under the parent Pamela Tremblay account so that billing, payment, and reporting consolidate against the single account on file. Covers express shipping, credit-card billing, and franchise-cancellation rules.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-06-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-011_vape-street-holdings-orders.pdf",
    "qrgPath": "./sops/QRG-CS-011_vape-street-holdings-orders.pdf",
    "purpose": "Vape Street Holdings operates nine franchise locations that place orders under individual store names. This SOP defines how Customer Success recreates each franchise order under the parent Pamela Tremblay account so that billing, payment, and reporting consolidate against the single account on file. The procedure also captures the express shipping rule, the credit-card billing source, and the franchise-cancellation rules that keep store-level staff out of the notification loop.",
    "scope": "Applies to every Shopify draft or order placed under any Vape Street Holdings franchise account, including but not limited to Vape Street Burrard, Vape Street Langford, and Vape Street Convenience (Langley). Out of scope: standalone retail customers, wholesale accounts unrelated to Vape Street Holdings, and B2B Wholesale Hub imports that already post under the Pamela Tremblay account.",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Agent",
        "responsibility": "Recreates the draft, applies billing and shipping, verifies discounts, and cancels the original franchise order."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Owner of this SOP. Approves deviations and audits the cancelled-order log weekly."
      },
      {
        "role": "Account Manager (Gabriel Jean)",
        "responsibility": "Escalation point for franchise pricing questions and credit-card authorisation file disputes."
      }
    ],
    "cadence": "As needed — triggered whenever an order is placed under any Vape Street Holdings franchise account",
    "steps": [
      {
        "title": "Confirm Required Data on File",
        "detail": "Before starting, confirm the following references are accessible. If any item is missing, stop and escalate to the Customer Success Lead: (1) Pamela Tremblay customer record in Shopify — used as the account on the recreated draft. (2) Angela Araujo credit-card authorisation from the Authorisation file on the CS shared drive — used for billing address and payment method. (3) Original franchise draft in Shopify draft orders (B2B Wholesale Hub import) — source of products and shipping address. (4) Vape Street Holdings rule row from the Order processing reference file — confirmation of express rule and $25 fee. The binding rules are: when an order comes in under Vape Street, duplicate the order using the same shipping address; for the billing address, use the one associated with the credit card; change the account to Pamela Tremblay; always ship via Express; if the order total is under the free shipping threshold, apply a custom Express shipping rate of $25; use the credit card on file under Angela Araujo for payment; cancel the original order; uncheck 'send notification to the customer' when cancelling."
      },
      {
        "title": "Duplicate the Franchise Order",
        "detail": "1. Open the original franchise draft in Shopify (for example, DSS166523 under Vape Street Burrard). 2. Click 'More actions' at the top right and select 'Duplicate'. 3. Shopify creates a new draft (for example, #D80283) with all line items copied from the franchise order."
      },
      {
        "title": "Remove the Franchise Customer from the Draft",
        "detail": "4. On the new draft, open the customer card menu (...) in the Client panel. 5. Click 'Remove customer'. The draft now has no customer attached."
      },
      {
        "title": "Assign the Pamela Tremblay Account",
        "detail": "6. Search 'Pamela Tremblay' in the customer field and attach her as the customer of the draft. 7. Confirm the email on file is invoices@vapestreetcanada.com and the order count refreshes to Pamela Tremblay's history. 8. Click Save before doing anything else — Shopify will lose unsaved customer changes if you continue editing."
      },
      {
        "title": "Keep the Original Shipping Address",
        "detail": "9. In the Client panel, open the menu (...) and select 'Edit shipping address'. 10. Verify the shipping fields still show the original franchise location (for example, Vape Street Langford, 739 McCallum Rd #101). WARNING: When the dialog opens, Shopify lists Pamela Tremblay's saved addresses (Vape Street Burrard and others). Do NOT pick one of these saved addresses. Leave the fields as they came from the franchise draft. Shipping must match the franchise location that placed the order. 11. Click Save on the dialog."
      },
      {
        "title": "Set the Billing Address from the Authorisation File",
        "detail": "12. Open the Client panel menu and select 'Edit billing address'. 13. Enter the billing address recorded against the credit card on file under Angela Araujo (2071 Kingsway Avenue #313, Port Coquitlam BC V3C 6N2). 14. Click Save."
      },
      {
        "title": "Apply Express Shipping",
        "detail": "15. In the order body, click 'Add shipping or delivery'. 16. Select 'Custom shipping'. Set Name to EXPRESS SHIPPING and price to $25.00 when the order subtotal is below the free-shipping threshold. If the order is at or above the threshold, set the price to $0.00 but still name the line EXPRESS SHIPPING. 17. Click Done. 18. In the Notes panel, add 'SHIP EXPRESS!' so the warehouse picks the express lane."
      },
      {
        "title": "Verify Discounts",
        "detail": "Some franchise items have automatic discounts; all Vape Street orders carry the wholesale discount; specific SKUs may carry special pricing. Confirm each discount line before saving: (a) Confirm the automatic VAPESTREET discount appears on every eligible line. (b) Confirm the wholesale discount has not dropped off the draft during duplication. (c) Cross-check unit prices against the customer's agreed special pricing where applicable."
      },
      {
        "title": "Save and Create the Order",
        "detail": "19. Review the draft end-to-end: customer is Pamela Tremblay, shipping matches the franchise, billing is Angela Araujo, note reads 'SHIP EXPRESS!', and the EXPRESS SHIPPING line is present. 20. Click 'Create order'. Send the invoice to invoices@vapestreetcanada.com."
      },
      {
        "title": "Cancel the Original Franchise Order",
        "detail": "1. Open the original franchise draft (the one duplicated in step 6.1). 2. Click 'Cancel order' from the More actions menu. 3. Keep 'Restock inventory' checked so the items return to stock for the warehouse. 4. Uncheck 'Send notification to customer' — franchise locations must not receive cancellation emails. 5. Add an internal note: 'Order recreated under Pamela Tremblay account.' 6. Click 'Cancel order' to confirm."
      },
      {
        "title": "Final Confirmation",
        "detail": "Once payment is captured against the credit card on file, Shopify emails the payment confirmation automatically to the Pamela Tremblay address. Confirm the following before closing the task: (a) Payment status on the new order shows Paid. (b) The draft has been promoted to a real order (it no longer appears under Drafts). (c) The express shipping note is visible on the order. (d) The original franchise order is marked Cancelled with the internal note attached and the customer notification suppressed."
      }
    ],
    "notes": [
      "Non-Compliance: Orders left under a franchise account distort the Pamela Tremblay credit ledger and break the Vape Street consolidated reporting.",
      "Non-Compliance consequence — Order remains attached to the franchise account: credit-card payment fails because the franchise account has no card on file. Order is held until manually corrected.",
      "Non-Compliance consequence — Shipping address swapped to a Pamela Tremblay address: shipment routes to the wrong franchise and triggers a return-to-sender, billed at standard reshipment rates.",
      "Non-Compliance consequence — Cancellation notification sent to the franchise: store staff receive a cancellation email they were never meant to see, requiring an apology from the Customer Success Lead.",
      "Non-Compliance consequence — Missing internal note on the cancelled order: the audit cannot link the cancelled franchise order back to the recreated Pamela Tremblay order. The CS Lead must reconstruct the link manually.",
      "Non-Compliance consequence — Express shipping line omitted on orders under the free shipping threshold: the warehouse defaults to ground and the franchise receives stock two to four business days late.",
      "Exception — Different shipping destination: only when the franchise explicitly requests a one-time alternate address by email. Forward the email to the CS Lead and attach it to the order notes.",
      "Exception — Alternate payment method: only when Angela Araujo confirms in writing that a different card is to be charged. Record the authorisation reference in the order notes.",
      "Exception — Standard shipping in place of Express: NOT permitted. There is no approved exception to the express rule for Vape Street Holdings orders.",
      "All approved exceptions are logged in the Customer Success exceptions register with the order number, the approver, and the date.",
      "Deviations from this SOP require written approval from the Customer Success Lead before the order is created."
    ]
  },
  {
    "id": "cs-012-order-modification",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-012",
    "title": "Order Modification — Additions",
    "desc": "Defines the process for Customer Success to handle wholesale customer requests to add products to an already-placed order before it ships, using either a duplicate draft order or a supplementary combine order in Shopify.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-06-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-012_order-modification-additions.pdf",
    "qrgPath": "./sops/QRG-CS-012_order-modification-additions.pdf",
    "purpose": "This procedure defines how Customer Success handles a wholesale customer request to add products to an order that has already been placed. The goal is a clean, traceable change that keeps invoicing, inventory commitments, and shipping accurate — without leaving a confusing trail behind in Shopify.",
    "scope": "Applies to every wholesale order where the customer emails Customer Success after placement asking to add products before the order ships. Out of scope: product removals, quantity reductions, refunds, and address changes — those are covered by their own SOPs.",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Representative",
        "responsibility": "Receives the customer request, verifies stock and eligibility, builds the updated draft or supplementary order, cancels the original order if applicable, and sends the confirmed invoice to the customer."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Approves exceptions to the standard draft-rebuild flow (e.g. when the original order has already been picked or partially fulfilled), logs non-compliance instances, and reviews repeated occurrences during monthly performance check-ins."
      }
    ],
    "cadence": "As needed",
    "steps": [
      {
        "title": "Locate the original order and verify status",
        "detail": "Locate the original order in Shopify and copy the order reference number (e.g. DSS166599). Verify the order status — confirm it has not yet been fulfilled or shipped."
      },
      {
        "title": "Choose a modification method",
        "detail": "Never modify the original Shopify order directly. Direct modification sometimes works, sometimes corrupts notifications, and is hard to audit later. Choose one of two methods: Method 1 (preferred) — Duplicate as a new draft order: (1) Duplicate the order to create a new draft order. (2) Rebuild the order so it contains both the original line items and the additional requested products. (3) Cancel the previous order once the new draft is confirmed and the customer accepts the updated invoice. Method 2 — Create a supplementary order to combine: (1) Create a new order containing only the additional items requested. (2) In the order note (top right), write 'COMBINE WITH DSS______' or 'COMBINE WITH ORDER', referencing the original order number. (3) Confirm wholesale discounts are applied on the supplementary order. (4) Match the shipping and billing addresses to the original order exactly. (5) Do not charge shipping — the customer is already paying shipping on the original order or has reached the free-shipping threshold. Both methods are clearer, easier to track, and safer for invoicing than editing the original Shopify order."
      },
      {
        "title": "Verify product availability",
        "detail": "Before adding any item to the draft, confirm that the requested product is available in the correct provincial variant. Open Shopify > Products > Inventory and search for the product name. Check four columns: Unavailable, Committed, Available, and On hand. Confirm the Available value covers the requested quantity for the customer's province variant."
      },
      {
        "title": "Quantity and eligibility check",
        "detail": "Before adding the items, validate four things: (1) Requested quantities — confirm against the customer's email word for word. (2) Packaging rules — verify that pack size and carton multiples are respected (e.g. 3-pack vs single). (3) Customer province — the variant must match the ship-to province (Ontario, Alberta, Federal Stamp). (4) Shipping eligibility — confirm whether free shipping applies (e.g. Ontario customer over the wholesale threshold)."
      },
      {
        "title": "Build the draft order",
        "detail": "Open the duplicated draft order and confirm the original items appear with the correct line-item discounts. Click 'Add a product' to open the product selection modal. Search for the requested product, select the correct provincial variant, and click Add. Repeat for every additional product the customer requested. Important Shopify behaviour: Newly added products usually appear at the bottom of the line-item list. Before generating the invoice, scroll to confirm quantities, discounts, shipping line, and final total are correct."
      },
      {
        "title": "Reply to the customer",
        "detail": "Reply to the customer once the draft order is finalized. In the reply: (1) Restate the products and quantities added — verbatim from the customer's request. (2) Confirm that the previous order was cancelled and a new updated invoice generated. (3) Attach the updated PDF invoice and double-check that it matches the customer's order number before sending. (4) Invite the customer to proceed with payment at their convenience. Example reply: 'Hi Ryan, thank you for reaching out. We have taken care of it and added 3 packs of Stlth Ropecut Skipper and 3 packs of Stlth Ropecut Loose Cannon to your order. We have cancelled the previous order and created a new one. Please find the updated invoice attached for your reference. You may proceed with the payment at your convenience. Let us know if you need anything else.'"
      },
      {
        "title": "Final checklist before sending",
        "detail": "Verify all of the following before sending: Stock verified for the correct provincial variant. Quantities confirmed against the customer's email. Draft order updated with all original and additional items. Shipping verified — not double-charged, threshold respected. Invoice regenerated and attached. Previous order cancelled. Correct attachment confirmed — no other customer's file. Quantities restated in writing in the reply. No confidential data exposed in the email body or attachment."
      }
    ],
    "notes": [
      "Non-Compliance: Direct edits to the live Shopify order, attaching another customer's invoice, double-charging shipping, or sending an unverified attachment are non-compliant. Each instance is logged by the Customer Success Lead, the rep is required to re-issue the corrected invoice to the customer the same day, and repeated occurrences are reviewed during the rep's monthly performance check-in.",
      "Exceptions: An exception to the draft-rebuild flow may be approved by the Customer Success Lead when the original order has already been picked or partially fulfilled — in that case the supplementary-order method (Method 2) must be used and the original order is not cancelled. The exception is recorded in the order note and in the Customer Success log.",
      "Important Shopify behaviour: Newly added products usually appear at the bottom of the line-item list. Before generating the invoice, scroll to confirm quantities, discounts, shipping line, and final total are correct.",
      "The shipping threshold referenced in documentation examples (free shipping for orders over $1,500 before tax) has since changed — always verify the current applicable threshold."
    ]
  },
  {
    "id": "cs-013-product-availability",
    "deptId": "customer-success",
    "sopCode": "SOP-CS-013",
    "title": "Product Availability Inquiries",
    "desc": "Defines how Customer Success agents verify product inventory in Shopify before responding to customer availability questions. Ensures customers receive accurate, first-time answers without promises made against non-existent stock.",
    "status": "Active",
    "version": "1.0",
    "effectiveDate": "2026-06-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-CS-013_product-availability-inquiries.pdf",
    "qrgPath": "./sops/QRG-CS-013_product-availability-inquiries.pdf",
    "purpose": "Customers regularly contact the Customer Success team to ask whether a specific product is in stock and, if not, when it will be available. This SOP defines how the Customer Success agent verifies inventory in Shopify before responding, so the customer receives an accurate answer the first time and no order is promised against stock that does not exist.",
    "scope": "This SOP applies to every Customer Success agent who handles inbound product availability questions, regardless of channel — email, phone, or any other direct customer contact. It covers all SKUs sold by DSS Distro. Out of scope: bulk wholesale availability commitments, custom purchase orders, and freight quotes, which follow their own SOPs.",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Agent",
        "responsibility": "Handle inbound product availability inquiries via email, phone, or any direct customer contact channel. Must verify inventory in Shopify before replying and follow all steps in this SOP."
      },
      {
        "role": "Customer Success Lead",
        "responsibility": "Owns this SOP. Approves exceptions, reviews non-compliant replies, coaches and re-certifies agents on the procedure, and oversees the Customer Success shared notebook where exceptions are logged."
      }
    ],
    "cadence": "As needed",
    "steps": [
      {
        "title": "Open Shopify Inventory",
        "detail": "Open Shopify and navigate to Products > Inventory."
      },
      {
        "title": "Search for the Product",
        "detail": "In the search field at the top of the Inventory page, type the product the customer is asking about (for example: chubby gorilla). The list filters to matching SKUs."
      },
      {
        "title": "Check the Available Column",
        "detail": "Check the Available column for the exact SKU and variant the customer requested. Match on both size and colour (for example CG30MLCLEAR — 30 ml stubby, all clear)."
      },
      {
        "title": "Confirm In-Stock Status",
        "detail": "If Available >= 1, the product is in stock. Proceed to step 6 (replying to the customer)."
      },
      {
        "title": "Handle Out-of-Stock Products",
        "detail": "If Available = 0, the product is out of stock. Find out when the next shipment arrives before replying. The method depends on the product: check the Purchase Orders tab in Shopify for an expected delivery date, or contact the supplier directly if no PO is on file. Do not give the customer an ETA you have not confirmed."
      },
      {
        "title": "Reply to the Customer",
        "detail": "Reply to the customer in the same language they used — French or English. If in stock, confirm availability and invite them to place their order. If out of stock, give the confirmed restock date and offer to follow up when the product arrives."
      },
      {
        "title": "Close the Loop",
        "detail": "Wait for the customer's confirmation that they will place the order, then close the loop with the appropriate team: Order Entry for new orders, Operations for restock follow-ups."
      },
      {
        "title": "Phone Inquiries",
        "detail": "The procedure is identical when the customer calls instead of emails. Open Shopify Inventory on screen while the customer is on the line, verify availability the same way, and quote stock or restock dates based only on what the inventory page shows. If a restock date cannot be confirmed during the call, take the customer's contact details and follow up by email or phone once the date is known. Do not estimate verbally."
      },
      {
        "title": "Language Standard",
        "detail": "Reply in the language the customer used in their original message — French inquiries get French replies; English inquiries get English replies. Match tone to the channel: professional and concise for email, conversational for phone. Use the DSS Distro email signature on every email reply."
      }
    ],
    "notes": [
      "Do not reply with a stock confirmation until the Shopify inventory check is complete.",
      "Do not give the customer an ETA that has not been confirmed via the Purchase Orders tab in Shopify or directly with the supplier.",
      "Non-Compliance: Replying to a customer without first checking Shopify inventory is considered Non-Compliance. The most common failure is promising availability based on memory or assumption, then having to retract the promise when the order cannot ship.",
      "Non-Compliance — First incident: the agent's reply is reviewed with the Customer Success Lead and a corrected message is sent to the customer the same day.",
      "Non-Compliance — Repeat incidents: the agent is removed from inbound inquiry rotation until coached and re-certified on this SOP by the Customer Success Lead.",
      "Non-Compliance — Quoting a restock date that was never confirmed with the supplier or Purchase Orders tab is treated the same way as promising non-existent stock.",
      "Exception — Shopify unavailable: The agent may confirm availability using the most recent inventory export, noting in the reply that the figure is as of the export timestamp.",
      "Exception — Account-specific reservations: Where stock has been earmarked for a named wholesale account, availability is quoted from the reservation list, not the public Available column.",
      "All exceptions require advance approval from the Customer Success Lead and must be logged in the Customer Success shared notebook with the date, customer, SKU, and approving manager."
    ]
  },
  {
    "id": "ops-002-excise-stamps",
    "deptId": "operations",
    "sopCode": "SOP-OPS-002",
    "title": "Excise Stamp Ordering",
    "desc": "Defines the standard monthly procedure for ordering excise vaping stamps from the Canada Revenue Agency through the Excise Stamping System. Ensures predictable replenishment across all eight active jurisdictions with a consistent 45-day inventory cushion.",
    "status": "Active",
    "version": "1.0",
    "effectiveDate": "2026-04-30",
    "owner": "Operations Manager",
    "pdfPath": "./sops/SOP-OPS-002_Excise_Stamp_Ordering.pdf",
    "qrgPath": null,
    "purpose": "This SOP defines the standard procedure for ordering excise vaping stamps from the Canada Revenue Agency through the Excise Stamping System. It ensures stamp inventory is replenished on a predictable cycle, prevents production stoppages caused by stockouts, and maintains a consistent 45-day cushion across all provinces.",
    "scope": "Applies to all vaping product excise stamps ordered by DSS Distro across the eight active jurisdictions: Alberta, Canada (federal), Manitoba, New Brunswick, Nova Scotia, Ontario, Prince Edward Island, and Quebec. The procedure is executed in CannTrack and the CRA Excise Stamping System.",
    "definitions": [],
    "roles": [
      {
        "role": "Operations Manager",
        "responsibility": "Owns the SOP, executes the monthly stamp ordering procedure, and files CRA confirmation emails under the corresponding PO#."
      },
      {
        "role": "Operations Coordinator",
        "responsibility": "Backup executor; cross-trained on the full procedure to cover in the Operations Manager's absence."
      },
      {
        "role": "Finance",
        "responsibility": "Reconciles the stamp invoice against the PO# upon receipt of stamps."
      }
    ],
    "cadence": "Monthly — last working day of month",
    "steps": [
      {
        "title": "Log into CannTrack and pull stamp inventory snapshot",
        "detail": "Log into CannTrack and navigate to Inventory → Stamp Inventory. The current snapshot lists Total, Applied, Unused, Spoiled, Received Bad, and Destroyed stamps for each jurisdiction across all eight active provinces."
      },
      {
        "title": "Export and trim the inventory CSV",
        "detail": "Click EXPORT CSV on the Stamp Inventory page. Save the file locally (location does not matter — it is a working file). Open the CSV and remove every column except Stamp Type, Region, and Unused. These are the only fields needed for the planning sheet."
      },
      {
        "title": "Pull current month usage from B300 report",
        "detail": "In CannTrack, navigate to Reports → B300/B600/B267 Report. Select the current month. This report shows stamps received, stamps used (Column C), and unusable stamps by region."
      },
      {
        "title": "Note per-jurisdiction usage figures",
        "detail": "Expand the Vaping row by clicking the down arrow to reveal all eight jurisdictions. Note the value in Column C (Stamps used for products) for each region — this is current-month usage to date."
      },
      {
        "title": "Build the planning sheet — add calculation columns",
        "detail": "In the working CSV file, add four columns to the right of Unused: Current Month Usage, Need, Difference, and Order. Populate the Current Month Usage column from the B300 report using VLOOKUP or manual entry."
      },
      {
        "title": "Calculate Need and Difference",
        "detail": "Calculate Need as Current Month Usage × 1.5. Calculate Difference as Need − Unused. A negative or zero Difference means no order is required for that jurisdiction."
      },
      {
        "title": "Calculate rounded Order quantities",
        "detail": "Round each positive Difference up to the next 1,000-stamp increment in the Order column. For Canada, Quebec, and Ontario (high-volume SKUs), round up to the next 5,000-stamp increment instead. The Order column is the final quantity to enter in the Excise Stamping System. Example from planning sheet: Alberta Unused=657, Usage=730, Need=1095, Diff=438, Order=1000; Canada Unused=5856, Usage=10070, Need=15105, Diff=9249, Order=10000; Manitoba Unused=2247, Usage=716, Need=1074, Diff=-1173, Order=0; New Brunswick Unused=545, Usage=300, Need=450, Diff=-95, Order=0; Nova Scotia Unused=2234, Usage=264, Need=396, Diff=-1838, Order=0; Ontario Unused=7551, Usage=7422, Need=11133, Diff=3582, Order=5000; Prince Edward Island Unused=642, Usage=276, Need=414, Diff=-228, Order=0; Quebec Unused=19301, Usage=30166, Need=45249, Diff=25948, Order=30000."
      },
      {
        "title": "Navigate to the Excise Stamping System",
        "detail": "Return to CannTrack → Stamp Inventory and click the ORDER STAMPS button at the bottom of the page. Log in to the CRA Excise Stamping System when prompted."
      },
      {
        "title": "Identify the next sequential PO number",
        "detail": "Select Create Stamp Order from the left navigation. Identify the next sequential PO number by reviewing the most recent order under View Stamp Orders. The format is #stmp### (e.g. if the last order was #stmp029, the next is #stmp030)."
      },
      {
        "title": "Configure the order header",
        "detail": "Set the order header fields as follows: Adhesive Option = Adhesive Stamps (always — never test stamps); Shipment Location = ADHESIVE CBN — Digital Smoke Supplies, Ottawa; Manufacturer PO# = next sequential number (e.g. #stmp030); Comments = 'Shipping Brinks LVP, S2 adhesive' (copy from the previous order)."
      },
      {
        "title": "Add line items for each jurisdiction",
        "detail": "Click ADD LINE ITEM (top-right of the Product Information section). For each jurisdiction with a non-zero Order quantity, select the product as [Region] — Vaping — Bundle (500 stamps). Enter Quantity of Bundles equal to the Order quantity divided by 500. Repeat for each jurisdiction requiring stamps."
      },
      {
        "title": "Verify order totals before submitting",
        "detail": "Verify that the total Quantity of Stamps shown in the order matches the sum of the Order column in the planning sheet. The system displays running totals at the bottom of the line items list. This check is critical — once submitted, an order cannot be edited; corrections require cancelling the PO with CRA and resubmitting under a new PO number."
      },
      {
        "title": "Submit the order",
        "detail": "Click CREATE ORDER (top-right). Enter your password when prompted to confirm submission."
      },
      {
        "title": "Confirm and file CRA email confirmations",
        "detail": "CRA sends two emails: the first confirms the order has been received; the second confirms the order has been approved and is being processed. File both emails in the Operations shared inbox under the corresponding PO# folder."
      }
    ],
    "notes": [
      "Schedule: Execute this procedure on the last working day of every month, before end-of-day. Stamps typically arrive within 5–7 business days of CRA approval, so ordering at month-end keeps the following month fully covered without holding excess inventory.",
      "Cushion rule: Target inventory equals 1.5× the previous month's usage — roughly 45 days of cover. Always round order quantities up to the next 1,000-stamp increment. For high-volume SKUs (Canada, Quebec, Ontario), round up to the next 5,000.",
      "Reference data: Cushion factor = 1.5× of previous month's usage; Standard rounding = 1,000 stamps (all low-volume jurisdictions); High-volume rounding = 5,000 stamps (Canada, Quebec, Ontario); Bundle size = 500 stamps (fixed by CRA); Adhesive option = Adhesive Stamps (always — never test stamps); Shipment location = ADHESIVE CBN Ottawa, Digital Smoke Supplies.",
      "CRITICAL — Before clicking CREATE ORDER: Verify the running Quantity of Stamps total at the bottom of the line items list matches the sum of the Order column on your planning sheet. Once submitted, an order cannot be edited — corrections require cancelling the PO with CRA and resubmitting under a new PO number.",
      "Non-compliance: Failure to execute this SOP on schedule risks stamp stockouts, which halt production and trigger downstream shipment delays to customers. Late or incorrect orders that result in unbudgeted expedited shipping costs will be reviewed by the Operations Manager and may be charged back to the responsible department.",
      "Exceptions: Mid-cycle ad-hoc orders are permitted when actual usage runs materially ahead of forecast (e.g. unexpectedly large customer order). The Operations Manager must approve the off-cycle order and document the trigger in the Comments field of the PO. The 1.5× cushion rule still applies to the rolling forecast."
    ]
  },
  {
    "id": "ops-003-flavour-ordering",
    "deptId": "operations",
    "sopCode": "SOP-OPS-003",
    "title": "Monthly Flavour Ordering",
    "desc": "Defines how Operations places the monthly e-liquid flavouring concentrate order by pairing recipe-based ML demand against on-hand and unfinished-goods inventory with a safety buffer, then translating the gap into supplier-specific order quantities.",
    "status": "Draft",
    "version": "v1.0",
    "effectiveDate": "2026-05-01",
    "owner": "Operations Manager (purchasing)",
    "pdfPath": "./sops/SOP-OPS-003_monthly-flavour-ordering.pdf",
    "qrgPath": null,
    "purpose": "This SOP defines how Operations places the monthly e-liquid flavouring concentrate order. It exists to keep production running by pairing recipe-based ML demand against on-hand inventory, unfinished-goods inventory and premix, then translating the gap into supplier-specific increments with a 10% safety buffer (or 90 days of coverage for slow suppliers). Stockouts on core SKUs — Loose Cannon, Skipper, Dark 30 — are the highest-impact failure mode and are not acceptable.",
    "scope": "Applies to the Operations purchasing role responsible for monthly flavouring concentrate orders across all suppliers (Flavour Art, Capella, Flavora, TFA, Lorann, Innawera, Mullenberry, Bryson Flavorah, Dvine Laboratories, DIY E-Juice, and the Bulk US channel). Out of scope: bottle, PG, VG and nicotine ordering; label and packaging procurement; mid-month emergency top-ups (handled per-incident under the Exceptions section).",
    "definitions": [],
    "roles": [
      {
        "role": "Operations Manager (purchasing)",
        "responsibility": "Owns the SOP; approves any extension of coverage beyond 90 days or mid-cycle supplier switches; reviews stockout incidents on core SKUs as process failures."
      },
      {
        "role": "Buyer",
        "responsibility": "Executes the monthly ordering cycle: pulls all data into the master workbook, calculates ML need, generates the Flavour Ordering plan, prints copies, and sends orders to suppliers."
      },
      {
        "role": "Jose (Receiving)",
        "responsibility": "Receives the Receiving copy of the printed Flavour Ordering Plan and checks off items as shipments arrive."
      },
      {
        "role": "Sales",
        "responsibility": "Supplies outstanding international customer orders for the current month so they can be added on top of historical sales in the plan."
      }
    ],
    "cadence": "Monthly — first business day after the previous month's physical inventory is closed in both the warehouse and unfinished-goods locations.",
    "steps": [
      {
        "title": "Gather inputs and prerequisites",
        "detail": "Confirm the following are ready before starting: (1) Master Flavour Ordering Excel workbook in the Operations OneDrive folder — this file owns the recipes, inventory snapshots, sales data and the auto-calculated ML need per flavour. (2) Erply access with rights to Reports › Sales and Inventory › Stock Replenishment for both the Warehouse and Unfinished Goods Warehouse locations. (3) Closed physical inventory for the month — the pull date for unfinished and warehouse must match the inventory date exactly, otherwise on-hand and unfinished totals double-count. (4) Previous month's order list, used to clear column K in the Flavour Ordering ING tab before the new month's quantities are entered. (5) Outstanding international customer orders for the current month, supplied by Sales (added on top of historical sales)."
      },
      {
        "title": "Pull international sales (last month)",
        "detail": "International customer sales are entered manually because the order pattern is concentrated in a few SKUs with explicit forward orders. Prefer the safer side: extra flavouring on hand is reusable, a missed production run is not. Steps: (1) In Erply, open Reports › Sales. (2) Set Customer group to International Customers, Period to Last month. (3) Open Item Sales › By Product (Excel) and download the report. (4) In the master workbook, duplicate the most recent International tab, rename it for the current month, update the date header, and replace sales values by SKU using the downloaded report. (5) Add outstanding current-month customer orders on top of historical sales — baseline coverage for Loose Cannon, Skipper and Dark 30 plus any specific open orders (e.g. 50 × Blue Cannon 50 ML, 60 × Dark 30, 80 × Skipper)."
      },
      {
        "title": "Pull Concord stock replenishment (last 60 days)",
        "detail": "Concord sales do not directly drive demand, but the master workbook depends on Concord stock and replenishment values populating on every tab — missing data here propagates blanks through the plan. Steps: (1) Log into the Concord Erply tenant. (2) Open Inventory › Stock Replenishment and pull the last 60 days. (3) Save the export to the OneDrive Concord last 60 file location — keep the same filename so existing workbook links resolve. (4) If the workbook does not auto-refresh, in Excel go to Data › Edit Links and re-point the source to the saved file. Note: Use Stock Replenishment, not Products in Stock — the standard report omits zero and negative values, and a clear picture of inventory must include both."
      },
      {
        "title": "Pull unfinished-goods inventory at month-end",
        "detail": "Unfinished-goods on hand must be subtracted from total need so the order is not inflated by stock that is already mixed but not yet labelled. Steps: (1) In Erply, open Inventory › Stock Replenishment. (2) Set Location to Unfinished Goods Warehouse. (3) Set Date to the last day of the previous month — the same date the physical inventory was taken. (4) Click Stock Replenishment Report (CSV) to download. (5) Open the CSV, select all (Cmd+A / Ctrl+A), copy, and paste into the Unfinished tab of the master workbook. Date alignment is non-negotiable: if the unfinished pull is from a different day than the warehouse pull, the master plan double-counts or under-counts available stock."
      },
      {
        "title": "Pull Concord and warehouse sales (last 60 days)",
        "detail": "Concord sales: (1) In Concord Erply, open Reports › Sales. (2) Set Customer group to Canada, Period to Last 60 days. (3) Open By Product and copy the data into the Concord Sales tab of the master workbook. Warehouse sales: (1) In the DSS Erply tenant, open Inventory › Stock Replenishment. (2) Set Location to Warehouse, Date to the last day of the previous month, Period to last 60 days. (3) Copy the report data into the Warehouse Sales tab of the master workbook. Note: The Quantity Delivered Canada tab is no longer maintained — leave the tab in place but skip the refresh. Self-flavouring sales are now captured through pod sales tracking instead."
      },
      {
        "title": "Calculate ML need per flavour",
        "detail": "Once every white tab in the master workbook is refreshed, the plan tab auto-calculates ML need per flavour by SKU using recipe percentages and bottle volumes. Walk every row in order: (1) Available for Canada minus units sold gives units needed. (2) Subtract unfinished-goods units — if the result is negative, ML need for that SKU is zero. (3) Where multiple SKUs share a flavouring (e.g. strawberry-watermelon, strawberry-pineapple variants), the plan aggregates ML across all SKUs that draw on it before the ordering tab. (4) The plan does not subtract premix or already-mixed flavouring at this stage — that subtraction happens on the Flavour Ordering ING tab."
      },
      {
        "title": "Generate the Flavour Ordering plan",
        "detail": "Steps: (1) Open the Flavour Ordering ING tab (ING stands for ingredient). (2) Clear all filters and save. (3) Verify that Flavouring on hand, Liquid on hand, Premix in use and Usage planning columns are populated from the upstream tabs. (4) In column K, erase last month's order quantities before entering the new month's. Sort or filter to Quantity to order > 0 to focus the work, but do not re-sort the recipe rows — they must remain in source order. (5) Open the Flavour Ordering Plan tab. Right-click the pivot table and choose Refresh. Select all, then unselect the zero and blank rows. The remaining list, broken down by supplier, is the order. Print runs and supplier emails work directly from this tab."
      },
      {
        "title": "Apply order increments per supplier",
        "detail": "Round each line up to the supplier's standard increment. Order in the smaller increment only when usage planning for the next 60 days is well under the larger one and there is no recurring shortage history. Standard increments by supplier: Flavour Art — 1 kg (1000 g), buy in 1 kg only. TFA — Gallon (3785 mL); 16 oz = 473 mL, 32 oz = 946 mL when usage is genuinely small. Capella — 16 oz (473 mL) for most flavours; gallon for skipper-tier usage (e.g. Pralines & Cream). Flavora (via DIY) — 250 mL or 500 mL; default to 500 mL to stay safe. Lorann — 16 oz (473 mL); buy via DIY when volumes are small, direct from Lorann when consolidating. Innawera — small jar, bought via DIY (single source for low-volume flavourings). Mullenberry — buy via DIY; direct shipping is uneconomic. Bryson Flavorah — direct email order, volumes vary by recipe. Riot Squad (Bulk US) — 60 or 90 day plan; plan 90 days because lead time is ~30 days, never run a 60-day plan. Dvine Laboratories — direct, used for the Great Lakes raspberry SKU. Sweetener / Pralines & Cream — always round up to the larger increment as these run out almost every month."
      },
      {
        "title": "Use Usage Planning to break ties",
        "detail": "When the calculated need lands between two increments, use the Usage Planning column (next-month projected use) as the tie-breaker: (1) If usage planning for the next month is at or above the smaller increment, round up to the larger. (2) If usage planning is well below the smaller increment (under ~50%), the smaller increment is fine. (3) For Riot Squad and other long-lead Bulk US suppliers, always round up — a 30-day re-order window is too narrow to recover from a shortfall. (4) Pralines & Cream, Sweet Strawberry, Super Sweet, RY4 Double, Sweetener, Menthol, and Mentha (Capella V2) consistently consume a full gallon per cycle — default to gallon regardless of marginal need."
      },
      {
        "title": "Account for the ML-adjusted weight discrepancy",
        "detail": "When new flavouring is logged in Erply by gross weight, the ML-adjusted value (final amount after subtracting the empty-container weight) systematically reads ~5% lower than the supplier-stated volume. A 5000 g receipt typically books as 4750 mL on hand. Build this into supply planning against monthly ML need — do not assume gross receipts equal usable mL. If a row's ML-adjusted value reads negative (e.g. –1143 mL), the tare weight on that container is wrong — flag it to Operations for correction before relying on the row in any plan."
      },
      {
        "title": "Print and distribute the order list",
        "detail": "Print three copies of the Flavour Ordering Plan pivot, 8.5 × 11, double-sided: (1) Buyer copy — marked up as orders are confirmed. (2) Receiving copy — handed to Jose so receipts can be checked off as items arrive. (3) Operations Manager copy — cross-reference for production blockers and partial deliveries."
      },
      {
        "title": "Send orders to suppliers",
        "detail": "All suppliers except TFA receive their order by email. TFA orders are placed through the supplier portal at https://shop.perfumersapprentice.com/ using the credentials stored in the shared Operations password vault. Supplier contact list: Flavour Art — orders.fana@flavourart.it; Capella — hugo@capellaflavors.com (alt: tanya@capellaflavors.com); DIY E-Juice — support@diy-ejuice.com; Bryson Flavorah — bryson@flavorah.com; Lorann (direct) — ShelbyH@lorannoils.com; Dvine Laboratories — sales@dvinelabs.com; TFA — web portal https://shop.perfumersapprentice.com/; Bulk US (Riot) — mattc@bemoreriot.com; Bulk US (PGVG) — accounting@pgvgdistribution.com. If the TFA portal password rotates, update the vault entry and notify the buyer; do not re-issue this SOP for credential changes."
      }
    ],
    "notes": [
      "Non-Compliance: Skipping the unfinished-goods pull, mismatching the inventory date between the warehouse and unfinished pulls, or failing to clear column K before the new month produces a corrupted plan that either over-orders (working capital tied up in flavouring) or under-orders (production blocks). Stockouts on Loose Cannon, Skipper or Dark 30 attributable to a missed monthly cycle are tracked as a process failure and reviewed by the Operations Manager.",
      "Exceptions: Extending coverage to 90 days for slow suppliers such as Riot Squad is standing practice and does not require approval. Extending to 120 days or more, or switching a supplier from DIY to direct mid-cycle to consolidate freight, requires approval from the Operations Manager before the order is placed. Mid-month emergency top-ups are placed per-incident when a production block is imminent and are recorded on the next month's plan as an out-of-cycle line.",
      "Date alignment is non-negotiable: the unfinished-goods inventory pull and the warehouse pull must be from the exact same date (last day of previous month); mismatched dates cause double-counting or under-counting of available stock.",
      "The Quantity Delivered Canada tab is no longer maintained — leave the tab in place but skip the refresh. Self-flavouring sales are now captured through pod sales tracking instead.",
      "ML-adjusted weight discrepancy: flavouring logged by gross weight in Erply reads approximately 5% lower than the supplier-stated volume after tare deduction. Plan against usable mL, not gross receipts. Negative ML-adjusted values indicate a wrong tare weight — flag to Operations before using the row in any plan.",
      "Core SKUs with highest stockout risk: Loose Cannon, Skipper, Dark 30. These must always have baseline coverage built in, including forward open orders from international customers.",
      "High-consumption flavourings that default to gallon every cycle regardless of marginal need: Pralines & Cream, Sweet Strawberry, Super Sweet, RY4 Double, Sweetener, Menthol, and Mentha (Capella V2)."
    ]
  },
  {
    "id": "ops-004-return-shipping",
    "deptId": "operations",
    "sopCode": "SOP-OPS-004",
    "title": "Return Shipping Label Process for Damaged Bottles",
    "desc": "Defines how Customer Success generates a return shipping label in Freightcom when a customer reports damaged (cracked or leaking) e-liquid bottles. Ensures replacements are only sent after the damaged product is received and the correct quantity is confirmed.",
    "status": "Draft",
    "version": "1.0",
    "effectiveDate": "2026-05-01",
    "owner": "Customer Success Lead",
    "pdfPath": "./sops/SOP-OPS-004_return-shipping-label-damaged-bottles.pdf",
    "qrgPath": null,
    "purpose": "This SOP defines how Customer Success generates a return shipping label when a customer reports damaged bottles — typically cracked or leaking units. This process ensures replacements are sent only after we receive the damaged product and the correct quantity is confirmed, so DSS Distro avoids over-shipping high-cost freight on the basis of an unverified claim.",
    "scope": "Applies to every return label created in Freightcom to return damaged e-liquid bottles previously delivered to a wholesale customer. Covers verification of the damage claim, approval, shipment creation, carrier selection, pickup scheduling, warehouse co-ordination, and delivery of the label to the customer. Out of scope: initial customer-complaint intake (covered by SOP-CS-003 Handling customer quality product issues), credit-note or refund processing, and freight claims with the carrier for in-transit damage.",
    "definitions": [],
    "roles": [
      {
        "role": "Customer Success Agent",
        "responsibility": "Requests photo evidence from the customer when needed. Verifies the damaged-bottle quantity, creates the Freightcom shipment, schedules the pickup, sends the label to the customer. Notifies Warehouse Lead that we are expecting a return."
      },
      {
        "role": "Warehouse Lead",
        "responsibility": "Receives return and counts bottles, notifies Customer Success that return was successfully received. Picks and packs the replacement order once notified, hands the package to the carrier at the scheduled pickup window."
      }
    ],
    "cadence": "As needed",
    "steps": [
      {
        "title": "4.1 Verify the Damage Claim",
        "detail": "Before generating any label, clarify the situation with the customer and the original order. Shipping costs are high and an inflated claim cannot be reversed once the freight is on the road. Confirm whether the customer reports one bottle or multiple bottles as damaged. Ask the customer to confirm the exact quantity of damaged units, per SKU. Request photos of the cracked or leaking bottles if the claim is not already documented. Do not generate a shipping label while any of the above is unclear. Reference the original Shopify order with per-SKU quantities to verify the damaged count before proceeding."
      },
      {
        "title": "4.2 Log In to Freightcom",
        "detail": "Open https://app.freightcom.com/ in a browser. Sign in with the shared DSS Distro Freightcom credentials (Username: digitalsmokes, Password: shipping123). Do not store the password in the browser on a shared workstation."
      },
      {
        "title": "4.3 Create the Replacement Shipment",
        "detail": "From the Freightcom dashboard, open the Ship menu and start a new shipment. Use the original Shopify order as the source of truth for the customer's address. Steps: (1) Click Ship → Create New Shipment. (2) Under Packaging Type, select Package (should already be selected automatically). Click Swap. (3) In Shipping From, enter the customer's address exactly as it appears on the original Shopify order (e.g., Vape Rock Forest, 4394 Boulevard Bourque, Sherbrooke QC J1N 1S3). (4) In Shipping To, the warehouse address (our address) should automatically be populated."
      },
      {
        "title": "4.4 Enter Dimensions and Weight",
        "detail": "Use the box-size and weight reference below. Choose the row that matches the total bottle count in the return. Mark the units as Imperial (in & lbs). In the Description field, enter 'e-liquid'. Reference table: Small (under 25 bottles) — 6in L x 6in W x 6in H, 4 lbs. Medium (25 to 50 bottles) — 12in L x 6in W x 6in H, 8 lbs. Large (50 to 100 bottles) — 14in L x 10in W x 6in H, 15–18 lbs."
      },
      {
        "title": "4.5 Get Rates and Choose the Carrier",
        "detail": "Click Get Rates and review the carrier options. Only select Purolator Ground or UPS; check if the customer has a preference. Select the cheapest option between the two (or the preferred carrier between the two, if applicable). Do not add Freightcom additional insurance without Customer Success approval."
      },
      {
        "title": "4.6 Confirm Quantity with Customer",
        "detail": "Make sure you have confirmed the quantity in writing with the customer before booking. If the customer claims 10 bottles damaged, confirm 10 in your email reply before booking for 10. If the quantity changes after re-confirmation, return to step 4.4 and update the box size and weight before booking. Note: once the return is received, the Warehouse will count and confirm that the amount matches what the customer stated — sometimes customers claim 10 and only send 5."
      },
      {
        "title": "4.7 Schedule the Pickup",
        "detail": "Once the customer has re-confirmed and the rate is selected, schedule the carrier pickup before booking the shipment. Pickup windows must match store hours. Steps: (1) Scroll to Ready for Pickup and select Schedule pickup now. (2) Set the pickup contact to Warehouse Lead with the warehouse phone number on file. (3) Set the pickup location to Front Door. (4) Choose a pickup date no earlier than the next business day (in some cases it can be same day, but for the most part, next business day). (5) Set times that fit the hours of the store that is returning the bottles (e.g., 10 AM–5 PM or 12 PM–5 PM — 12 PM–5 PM is the default if store hours are unknown). Hours can be looked up if there is time. (6) Click Book Shipment Now to confirm the pickup and generate the label."
      },
      {
        "title": "4.8 Download the Label",
        "detail": "On the confirmation screen, capture the shipment identifiers and download the carrier label PDF. Record the Tracking #. Click Shipping Label → Download and save the PDF locally; keep the file name and add the store name after it. Verify the destination on the label matches the customer's Shopify address before sending."
      },
      {
        "title": "4.9 Notify the Warehouse",
        "detail": "Notify the warehouse that we are expecting a return from this customer. The return needs to be confirmed received before creating a replacement order. Send an email to the Warehouse Lead. Include the customer name, the products being returned and quantity (e.g., Flavorless Red SALTS 30ml by Gogo Juice — 20mg — Qty: 2). Attach the carrier label PDF and kindly request them to notify you when received."
      },
      {
        "title": "4.10 Send the Label to the Customer",
        "detail": "Reply to the customer's original email where they notified us of the damaged/leaking bottles. Reference the number of bottles and the scheduled pickup date and time in the email body. Check the tracking number on UPS or Purolator periodically to make sure the process is going smoothly. The warehouse is very busy so it may take time for them to confirm receipt. If the tracking shows the shipment was delivered to DSS, you can double-check with the warehouse team."
      }
    ],
    "notes": [
      "Verification Checklist: (1) Damaged bottle count is confirmed in writing by the customer. (2) Photo evidence is on file or has been explicitly waived by Customer Success. (3) Box size and weight match the bottle count per the reference table in section 4.4. (4) Pickup window fits the store's hours. (5) Warehouse Lead has been notified with the label PDF attached. (6) Customer email on the outgoing label notification matches the Shopify record.",
      "Once the return is received and the warehouse confirms the correct quantity of bottles, proceed with the next steps (replacement order or credit/refund). Replacements are shipped with the customer's next order, not alone — specific cases where they can be shipped alone require discussion with Pamela first. How to handle those options is covered in SOP-CS-004_damaged-product-credits-refunds.",
      "Non-Compliance: Booking a Freightcom shipment before the customer has re-confirmed quantity, or without Customer Success approval, is treated as an operations incident. The Operations Coordinator absorbs the carrier cost of any cancelled or over-shipped label against their team's quarterly freight budget, the incident is logged in the Operations weekly review, and a repeat occurrence triggers a written warning from the Operations Manager. Do not skip the warehouse notification step (4.9) as it causes confusion — the warehouse needs to know what is coming in and DSS needs confirmation of receipt to resolve with the customer.",
      "Exceptions: Two deviations are pre-approved. (1) When the customer is a long-standing key account and the damaged quantity is one or two bottles, the Customer Success Lead may waive photo evidence; the waiver is noted on the Shopify order. (2) When a customer requires same-day dispatch, the Operations Manager may approve booking the shipment before written re-confirmation, provided the quantity is documented verbally with the Customer Success Lead and the approval is logged in the Operations weekly review. All other deviations require written approval from the Operations Manager before the label is booked."
    ]
  },
  {
    "id": "ops-005-mixed-unit-count",
    "deptId": "operations",
    "sopCode": "SOP-OPS-005",
    "title": "Adjusting Mixed Unit Count After Final Mixing Volume Change",
    "desc": "This SOP guides the Mixing Operator through updating both the Production Plan and the Flavor Ordering workbook whenever the final produced bottle count differs from the planned count after mixing is complete, keeping both records in sync.",
    "status": "Active",
    "version": "v2.0",
    "effectiveDate": "2026-05-01",
    "owner": "Mixing Operator",
    "pdfPath": "./sops/SOP-OPS-005_adjusting-mixed-unit-count.pdf",
    "qrgPath": null,
    "purpose": "This procedure keeps the Production Plan and the Flavor Ordering workbook synchronised when the final mixed bottle count differs from the planned count. Both records must reflect the same number of units so downstream replenishment, flavouring orders, and inventory reporting stay accurate.",
    "scope": "Applies to the Mixing Operator whenever the final produced bottle count differs from the planned count after mixing is complete. Triggers include volume adjustments, flavour corrections, ingredient variances, and any other factor that changes the final mixed volume. Out of scope: planned-count changes made before mixing begins, which are handled by the standard production planning process.",
    "definitions": [],
    "roles": [
      {
        "role": "Mixing Operator",
        "responsibility": "Run this procedure immediately after final mixing whenever the produced unit count differs from the planned count. Update both the Production Plan (column AQ — Mixed UNITS) and the Flavor Ordering file (Mixing tab, column E — Qty) in the same session. Notify the Operations Manager immediately if the Flavor Ordering file cannot be opened in the same session."
      },
      {
        "role": "Operations Manager",
        "responsibility": "Receives notification if the Flavor Ordering file cannot be updated in the same session. Records the deferred update in the daily handover note and completes the Flavor Ordering edit before the start of the next mixing shift. Receives escalation and conducts retraining for repeated failures to update both files in the same session."
      }
    ],
    "cadence": "As needed — immediately after final mixing whenever the produced unit count differs from the planned count",
    "steps": [
      {
        "title": "Open the Production Plan",
        "detail": "Navigate to P:\\_Pamela\\Stock Replenishment\\1 - Production Plan - Automation\\. Open the current Production Plan workbook (example: Jan 1st PRODUCTION PLAN Final version 2.0.xlsm)."
      },
      {
        "title": "Filter by product name",
        "detail": "Click the filter arrow on column O — 'Product'. Search for and select the product being adjusted, then apply the filter. The view should now show only rows matching that product."
      },
      {
        "title": "Confirm the correct row",
        "detail": "Scroll right to column AP — 'Mixing Date'. Verify the date matches today's mixing date to confirm you are editing the right row."
      },
      {
        "title": "Update Mixed Units",
        "detail": "In column AQ — 'Mixed UNITS', click the cell in the confirmed row and enter the new unit count (example: 100). Do not close the Production Plan. Keep it open and move to Step 5."
      },
      {
        "title": "Open the Flavor Ordering file",
        "detail": "Navigate to the current month's folder: P:\\_Pamela\\Order Flavouring\\2026\\[Month Number] - [Month Name]\\. Open the most recent file in that folder (example for May: P:\\_Pamela\\Order Flavouring\\2026\\5 - May\\Flavor Ordering - April 30th.xlsx). Note: a new file is created each month — always open the most recent file in the current month's folder."
      },
      {
        "title": "Keep both files open at the same time",
        "detail": "Both the Production Plan and the Flavor Ordering file must be open simultaneously. These files are sometimes synchronised. If the sync is active, the Flavor Ordering file may update automatically once the change in Step 4 has been made."
      },
      {
        "title": "Go to the Mixing tab",
        "detail": "In the Flavor Ordering file, click the Mixing tab at the bottom of the screen."
      },
      {
        "title": "Find the correct row",
        "detail": "Using the mixing date and product name, locate the correct row in the Mixing tab."
      },
      {
        "title": "Update Qty (if needed)",
        "detail": "Check column E — 'Qty' on the located row. If the file is synchronised: the value may have already updated automatically — verify it matches the new unit count and no further action is required. If the sync is off: click the cell in column E and manually enter the new quantity to match the value entered in Step 4 (Mixed UNITS in column AQ of the Production Plan)."
      }
    ],
    "notes": [
      "After completion: Save both workbooks before closing them. Confirm the Mixed UNITS value in the Production Plan (column AQ) matches the Qty value in the Flavor Ordering Mixing tab (column E) on the corresponding row. Close both files once values are confirmed in sync.",
      "Both workbooks must be updated in the same session. Do not defer the Flavor Ordering update to a later shift — a partial update leaves the two files out of sync and corrupts the next ordering cycle.",
      "Non-Compliance: Updating only one of the two workbooks leaves the Production Plan and Flavor Ordering records out of sync. The next flavouring order will be sized against the wrong unit count, producing either a stock shortage or surplus and a manual reconciliation task for the Operations Manager. Repeated failures to update both files in the same session are escalated to the Operations Manager for retraining.",
      "Exception: If the Flavor Ordering file cannot be opened in the same session (file lock, network outage, or the workbook is being edited by another user), the Mixing Operator notifies the Operations Manager immediately. The Operations Manager records the deferred update in the daily handover note and completes the Flavor Ordering edit before the start of the next mixing shift. No other deviations from this procedure are permitted without written approval from the Operations Manager."
    ]
  },
  {
    "id": "ops-006-shopify-continue-deny",
    "deptId": "operations",
    "sopCode": "SOP-OPS-006",
    "title": "Shopify Continue or Deny Inventory Updates",
    "desc": "This procedure updates Shopify product availability based on the latest warehouse and unfinished inventory levels, determining whether each product continues selling when inventory reaches zero or is denied further sales until stock is available. It runs end-to-end without manual judgement once the input files are refreshed.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-06-01",
    "owner": "Operations Manager",
    "pdfPath": "./sops/SOP-OPS-006_shopify-continue-or-deny.pdf",
    "qrgPath": "./sops/QRG-OPS-006_shopify-continue-or-deny.pdf",
    "purpose": "This procedure updates Shopify product availability based on the latest warehouse and unfinished inventory levels. The process determines whether each product continues selling when inventory reaches zero or whether Shopify denies further sales until stock becomes available again. The procedure runs end-to-end without manual judgement once the input files are refreshed. Incorrect inventory settings cause customers to purchase products that are not available, or block customers from ordering products that should remain available — both outcomes generate refund work and reputational damage.",
    "scope": "This SOP applies to any DSS employee responsible for maintaining Shopify inventory settings. The procedure runs whenever Shopify availability requires updating, and as part of the regular website maintenance routine. Out of scope: product creation, pricing changes, image updates, and Shopify catalogue restructuring. Those follow separate procedures.",
    "definitions": [],
    "roles": [
      {
        "role": "Operations Manager",
        "responsibility": "Owns this SOP, approves any deviations from the procedure in writing before imports are executed, and maintains the Operations log of exceptions."
      },
      {
        "role": "DSS Operations Employee",
        "responsibility": "Executes the procedure by refreshing the inventory input files, running the automation workbook, generating the Shopify import file, and completing the import and verification steps in Shopify."
      }
    ],
    "cadence": "As needed — whenever Shopify availability requires updating, and as part of the regular website maintenance routine",
    "steps": [
      {
        "title": "Step 1 — Update the warehouse inventory file",
        "detail": "Open the Stock Replenishment report. Set Location = Warehouse and generate the report. Once the report finishes, save the file and overwrite the existing Warehouse Inventory.csv at the path: P:\\- Power Bi\\1 -Data Base\\Back on Stock\\Warehouse Inventory.csv. Expected result: Warehouse Inventory.csv now contains the latest warehouse quantities."
      },
      {
        "title": "Step 2 — Update the unfinished inventory file",
        "detail": "Open the same Stock Replenishment report. Set Location = Unfinished Warehouse and generate the report. Save the file and overwrite the existing Unfinished inventory.csv at the path: P:\\_Pamela\\Stock Replenishment\\1 - Production Plan - Automation\\Data\\Unfinished inventory.csv. Expected result: Unfinished inventory.csv now contains the latest unfinished stock quantities."
      },
      {
        "title": "Step 3 — Validate inventory data",
        "detail": "Open Unfinished inventory.csv in Excel. Review the In Stock column and confirm no products have negative inventory values. If negative values exist, stop the process and investigate before continuing. Expected result: all inventory quantities are valid and no negative values exist."
      },
      {
        "title": "Step 4 — Export products from Shopify",
        "detail": "Log in to the Shopify Admin portal. Navigate to Products → Export. Select All products and start the export. Shopify sends the file by email when ready. Expected result: a complete Shopify product export is available for download by email."
      },
      {
        "title": "Step 5 — Download and prepare the Shopify export",
        "detail": "Open the export email from Shopify and download the file. Open the exported CSV in Excel and delete the following columns: AV — Included / Canada; AW — Price / Canada; AX — Compare At Price / Canada. Save and overwrite the original export file. Expected result: the Shopify export is cleaned and ready for the automation."
      },
      {
        "title": "Step 6 — Open the Continue or Deny automation",
        "detail": "Navigate to P:\\- DSS Tools\\2. Website Inventory Update (Shopify)\\2.1 Shopify Inventory Tools\\2.1.1 Continue or Deny Shopify Automation. Open Shopify - Continue Or Deny MSTR File Automation.xlsm. Allow the workbook to fully load before continuing. Expected result: the automation workbook is open and ready to refresh."
      },
      {
        "title": "Step 7 — Refresh the automation data",
        "detail": "Run a data refresh on the workbook and wait until all queries finish. Run a second refresh after the first completes. WARNING: Do not use the computer while the refresh is running. Switching windows, opening files, or cancelling the refresh produces incomplete or incorrect data that corrupts the Shopify import. Expected result: all data sources are refreshed with the latest inventory information."
      },
      {
        "title": "Step 8 — Generate the Shopify import file",
        "detail": "Run the macro Export Products Import Shopify. The macro processes the inventory information and creates the Shopify import file in the Daily Upload folder. Expected result: a new Shopify import file is generated in the Daily Upload folder."
      },
      {
        "title": "Step 9 — Import the file into Shopify",
        "detail": "In Shopify, navigate to Products → Import. Browse to the latest generated file and select it. Example: P:\\_Pamela\\Unfinished Upload\\Daily upload\\products_export_1 June 10 2026.csv. Expected result: the file is loaded into Shopify and ready for import."
      },
      {
        "title": "Step 10 — Verify import settings",
        "detail": "Before starting the import, Shopify displays import options. Set them exactly as required — these settings are required for the inventory update to behave correctly. Check the first option. Uncheck the second option. Expected result: import settings match DSS standards."
      },
      {
        "title": "Step 11 — Run the import",
        "detail": "Click Import products and allow Shopify to process the file. Do not close the browser until Shopify confirms the import has completed successfully. Expected result: the inventory availability updates are applied to Shopify."
      },
      {
        "title": "Step 12 — Perform verification import",
        "detail": "Run the exact same import a second time. Confirm that Shopify reports no errors and that all product updates were applied during the first import. Expected result: Shopify completes the second import successfully and reports no errors."
      }
    ],
    "notes": [
      "Required files and access: Three files must be accessible before starting — (1) Warehouse Inventory at P:\\- Power Bi\\1 -Data Base\\Back on Stock\\Warehouse Inventory.csv (main warehouse stock counts); (2) Unfinished Inventory at P:\\_Pamela\\Stock Replenishment\\1 - Production Plan - Automation\\Data\\Unfinished inventory.csv (work-in-progress stock counts); (3) Automation Workbook at P:\\- DSS Tools\\2. Website Inventory Update (Shopify)\\2.1 Shopify Inventory Tools\\2.1.1 Continue or Deny Shopify Automation\\Shopify - Continue Or Deny MSTR File Automation.xlsm (generates the Shopify import file). All paths are on the P: drive and require Operations team permissions.",
      "Completion checklist — before closing the procedure, confirm all of the following: Warehouse inventory file updated; Unfinished inventory file updated; No negative inventory values found; Shopify export downloaded; Required columns (AV, AW, AX) removed from the export; Automation workbook refreshed twice; Export Products Import Shopify macro completed; First Shopify import completed without errors; Verification import completed without errors.",
      "Non-Compliance — Skipping the inventory validation step results in negative quantities being pushed to Shopify, which silently disables products that should remain available. Customers cannot order, and the team only discovers the problem when sales drop. Affected SKUs must be re-enabled manually.",
      "Non-Compliance — Interrupting the workbook refresh produces partial data. The generated import file then sets the wrong continue / deny state on an unpredictable subset of products, which requires a full re-run of the procedure to correct.",
      "Non-Compliance — Skipping the second verification import allows silent partial-import failures to ship to production. Any product whose update did not apply behaves incorrectly on the storefront until the next run.",
      "Exceptions — Deviation from this procedure requires written approval from the Operations Manager before the import is executed. The approval, the reason, and the SKUs or settings affected are recorded in the Operations log alongside the run date.",
      "Exceptions — Emergency Shopify availability changes outside this procedure (for example, immediately disabling a recalled product) follow the incident-response flow and are reconciled at the next scheduled run of this SOP."
    ]
  },
  {
    "id": "ops-007-stock-replenishment-process",
    "deptId": "operations",
    "sopCode": "SOP-OPS-007",
    "title": "Stock replenishment process",
    "desc": "This procedure explains how to execute the complete Stock Replenishment process, from purchase extraction through ERPLY import.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "June 2026",
    "owner": "Operations Lead",
    "pdfPath": "./sops/SOP-OPS-007_stock-replenishment-process.pdf",
    "qrgPath": null,
    "purpose": "This procedure explains how to execute the complete Stock Replenishment process, from purchase extraction through ERPLY import. Following it ensures replenishment quantities are accurately entered, purchase returns are generated correctly, and inventory orders are successfully imported into ERPLY.",
    "scope": "This SOP applies to any DSS employee responsible for generating Stock Replenishment purchase returns. It covers the full weekly cycle from extracting purchasing data to verifying imported purchase returns inside ERPLY. Tasks performed outside the Stock Replenishment Automation workbook — such as supplier negotiation, freight booking, or receiving — are out of scope.",
    "definitions": [],
    "roles": [],
    "cadence": "Weekly",
    "steps": [
      {
        "title": "Run purchase extraction",
        "detail": "Navigate to the Stock Replenishment Automation folder and run the extraction batch script. Folder:  P:\\DSS Tools\\5. Stock Replenishment System\\5.1 Stock Replenishment Automation Run:  RunPurchaseExtraction.bat When prompted, enter yesterday’s date as the extraction date. Allow the extraction process to complete before proceeding to Step 2. Expected result — the latest purchasing and inventory information has been extracted and is ready for use in the replenishment process."
      },
      {
        "title": "Open Stock Replenishment Automation",
        "detail": "Open the automation workbook from the same folder. File:  Replenishment Automation.xlsm Once the workbook is open, select Data → Refresh All and allow every query to finish refreshing. Save the workbook when the refresh completes. Expected result — the automation workbook is updated with the latest extracted data and is ready for replenishment processing."
      },
      {
        "title": "Open the weekly Stock Replenishment file",
        "detail": "Navigate to the replenishment archive and open the file for the current cycle. Folder:  P:\\_Pamela\\Replenishment\\2026\\<Year>\\<Month>\\<Week>\\ Open the weekly Stock Replenishment file inside that folder. Expected result — the weekly Stock Replenishment file is ready for quantity entry."
      },
      {
        "title": "Enter replenishment quantities",
        "detail": "Using the Stock Replenishment papers, enter all required replenishment quantities into the weekly file. Review all entries carefully before proceeding. Verify that: •\tQuantities match the paperwork. •\tNo rows were skipped. •\tNo quantities were entered in the wrong location. Save the file after completing all entries. Expected result — the weekly Stock Replenishment file contains all replenishment quantities required for the current purchasing cycle."
      },
      {
        "title": "Review Add-On products",
        "detail": "Review the Add-On products listed on the final page of the Stock Replenishment paperwork. These products are not always included automatically and must be reviewed separately. Locate each Add-On product within the weekly Stock Replenishment file. Enter the required quantities for all applicable Add-On products, then save the file. Expected result — all required Add-On products have been included in the replenishment process."
      },
      {
        "title": "Refresh and validate the weekly file",
        "detail": "After all quantities and Add-On products have been entered, perform one final refresh by selecting Data → Refresh All. Allow every query to finish loading. Review the file and confirm: •\tReplenishment quantities were entered correctly. •\tAdd-On products were included. •\tNo unexpected errors appear. •\tAll calculations update successfully. Expected result — the weekly Stock Replenishment file is finalised and ready for processing."
      },
      {
        "title": "Validate province assignments",
        "detail": "Before generating purchase returns, verify that all province assignments are correct. Review every province-specific product and confirm it is assigned to the correct province. Pay special attention to ON, QC, AB, MB, NB, PEI, and NS. Expected result — all products are assigned to the correct province."
      },
      {
        "title": "Run the Extract macro",
        "detail": "Return to Replenishment Automation.xlsm and locate the Extract button. Click Extract. When prompted, browse to and select the weekly Stock Replenishment file completed in Steps 3–7. Wait for the extraction to finish. Expected result — all replenishment quantities are loaded into the Purchase Return Generator."
      },
      {
        "title": "Run the Generate macro",
        "detail": "Once the extraction is complete, locate and run the Generate macro. Allow the macro to finish processing. This step creates the purchase return records required for ordering. Expected result — purchase returns are generated and ready for review."
      },
      {
        "title": "Review generated purchase returns",
        "detail": "Review the generated purchase returns carefully before exporting. Verify: •\tProduct quantities. •\tProduct costs. •\tSupplier assignments. •\tProvince assignments. •\tPurchase return totals. If any discrepancies are identified, correct them before proceeding. Expected result — all generated purchase returns are accurate and ready for export."
      },
      {
        "title": "Compare totals",
        "detail": "Review the Summary sheet totals and compare them against the Label-only totals generated by the automation. The totals should match. If differences exist, investigate and resolve them before continuing. Expected result — Summary totals and Label-only totals match."
      },
      {
        "title": "Run the Export macro",
        "detail": "Once validation is complete, run the Export macro. Allow the export to finish completely. The export generates the files required for the ERPLY import in Step 14. Expected result — purchase return import files are successfully created."
      },
      {
        "title": "Run the Delete macro",
        "detail": "After confirming the export completed successfully, run the Delete macro. This removes temporary processing data and prepares the workbook for the next replenishment cycle. Expected result — temporary processing data has been cleared successfully."
      },
      {
        "title": "Import purchase returns into ERPLY",
        "detail": "Navigate back to the Stock Replenishment Automation folder and run the import script. Run:  Erply_Import_PurchaseReturn.py Allow the script to complete. Monitor the console window during the import and review any warnings or errors before closing the script. Expected result — purchase returns are imported into ERPLY successfully."
      },
      {
        "title": "Final verification",
        "detail": "Log into ERPLY and verify that: •\tPurchase returns were created successfully. •\tQuantities match the generated files. •\tSuppliers are assigned correctly. •\tNo products are missing. •\tNo import errors occurred. Once verification is complete, the Stock Replenishment process is finished. Expected result — the replenishment cycle is closed and ready to repeat next week."
      }
    ],
    "notes": []
  },
  {
    "id": "sales-001-missing-opportunities",
    "deptId": "sales",
    "sopCode": "SOP-SALES-001",
    "title": "Missing Opportunities and Back in Stock Follow-Up",
    "desc": "Defines the process for logging customer requests for out-of-stock or missing products, monitoring back-in-stock status on the DSS Dashboard, and converting those records into upsell opportunities once stock returns.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-05-01",
    "owner": "Sales Lead",
    "pdfPath": "./sops/SOP-SALES-001_missing-opportunities-back-in-stock.pdf",
    "qrgPath": null,
    "purpose": "When a product is missing or out of stock and the customer shows interest, the Sales team logs the request so it can be followed up later and converted into a sale once stock returns. This SOP defines where the log lives, how to add a customer, how to monitor back-in-stock status on the DSS Dashboard, and how to action the resulting upsell opportunity.",
    "scope": "Applies to every member of the Sales team who fields customer requests for products that are out of stock, missing from the warehouse pick, or otherwise unavailable at the time of order. Also applies to the Sales Lead, who monitors the log and chases follow-ups when stock returns. Out of scope: dashboard maintenance, SKU-level inventory updates, and decisions about whether to re-stock a discontinued product. Those sit with Operations and the Dashboard owner.",
    "definitions": [],
    "roles": [
      {
        "role": "Sales Rep",
        "responsibility": "Fields customer requests for out-of-stock or missing products, logs the request in the Missing Opportunities Excel file (with Customer ID from Shopify and all manual order detail fields), checks the Back in Stock section of the DSS Dashboard, and actions green rows by contacting customers the same day."
      },
      {
        "role": "Sales Lead",
        "responsibility": "Monitors the Missing Opportunities log, chases follow-ups when stock returns, reviews requests in the Teams General group, approves any exceptions to skipping rows (recorded with initials, date, and reason as a comment on the affected row), and addresses repeated omissions in rep one-on-ones."
      },
      {
        "role": "Dashboard Owner (Juan)",
        "responsibility": "Maintains the DSS Dashboard. Sales reps report missing products, stamps, or quantities to Juan and confirm whether a dashboard update is needed before continuing follow-ups."
      }
    ],
    "cadence": "Every Monday (primary check); a second pass later in the week during a quieter period. Green rows must be actioned the same day they are identified.",
    "steps": [
      {
        "title": "Find the Missing Opportunities Log",
        "detail": "Open the log from Microsoft Teams: (1) Open Teams. (2) Open the DSS – Sales Hub channel. (3) Click the Missing Opportunities tab on the top menu. (4) Open the Excel file from the tab."
      },
      {
        "title": "Get the Customer ID from Shopify",
        "detail": "Step 1 of adding a customer to the log. (1) Open Shopify Admin. (2) Search for the customer (e.g., Derek Young). (3) Open the customer record and copy the Customer ID from the URL in the address bar. The Customer ID is the numeric segment in the URL after /customers/."
      },
      {
        "title": "Paste the Customer ID into the Excel Log",
        "detail": "Step 2 of adding a customer. Paste the Customer ID into the next empty row of the log. The sheet auto-populates two fields automatically — do not type them manually: Customer name and Email address."
      },
      {
        "title": "Fill In the Order Details by Hand",
        "detail": "Step 3 of adding a customer. Complete every field before closing the row. Manual columns required: Order number/PO, Order date, Brand, Product name, Stamp (province/type, e.g. ON, QC), SKU, and Backorder quantity (BO qty)."
      },
      {
        "title": "Check Back in Stock Products on the DSS Dashboard",
        "detail": "Back-in-stock status is published on the DSS Dashboard inside Teams. (1) Open Teams. (2) Open the DSS › General channel. (3) Open the DSS Dashboard tab. (4) Scroll to the bottom of the dashboard and look for the Back in Stock section."
      },
      {
        "title": "Interpret and Action the Back in Stock Information",
        "detail": "The Back in Stock section shows three pieces of information for each SKU: Stock status, Back-in-stock detail (date and source), and Quantities available and any notes. Colour coding signals the next action: Green highlight — the item is back in stock and can be offered to the customer; action the same day. Red highlight — the item is still out of stock; keep the row in the log and check again next cycle. Partial-quantity example: if the customer needed 20 units but only 13 are back, offer the partial fill explicitly — e.g., 'Only 13 units are currently available. Would you like to proceed with those?'"
      },
      {
        "title": "Convert Back-in-Stock Rows into Upsell Opportunities",
        "detail": "When stock returns, every back-in-stock row is also a chance to grow the order. Use these three plays: (1) Combine outstanding back orders for the same customer to reduce shipping cost. (2) Suggest adding complementary products to round out a full order. (3) Increase the order value at the moment of confirmation, while the customer is already engaged."
      },
      {
        "title": "Handle Missing or Incorrect Dashboard Information",
        "detail": "When a product, stamp, or quantity is missing or looks wrong on the dashboard: (1) Speak to Juan (Dashboard owner) and report the missing product or column. (2) Confirm whether a dashboard update is needed before continuing the follow-up. (3) Post the question in the Missed Opportunities Teams channel so the rest of the team sees the answer."
      },
      {
        "title": "Seek Support When Needed",
        "detail": "Anyone who needs extra time, training, or context to keep the log current can ask in the Teams General group. The Sales Lead reviews requests there and pairs the rep with whoever can unblock them."
      }
    ],
    "notes": [
      "Why this matters: Missing products become future sales opportunities once stock returns. Customers who showed interest can be contacted directly when their item is back. Production cycles change frequently because manufacturing is lab-based, so today's out-of-stock SKU may return next week. A current log is the source of every upsell call once stock comes back.",
      "Non-Compliance: Customer requests for out-of-stock products that are not entered in the Missing Opportunities log are treated as lost sales and counted against the Sales team's recovery metrics. Repeated omissions surface in the Sales Lead's weekly review and are addressed in the rep's next one-on-one. Knowingly clearing rows from the log without a confirmed customer outcome is a documented performance issue.",
      "Exceptions: Skipping a row is permitted only when the customer has already cancelled the request in writing or has been refunded for the missing units. The Sales Lead approves any other deviation in advance, and the approval is recorded as a comment on the affected row in the Excel log (initials, date, reason)."
    ]
  },
  {
    "id": "sales-002-account-management",
    "deptId": "sales",
    "sopCode": "SOP-SALES-002",
    "title": "Customer Account Management",
    "desc": "Defines how the Sales team assigns new and dormant customer accounts to account managers, tracks account ownership, and coordinates monthly outreach to open accounts. Ensures rotation is transparent, prevents duplicate coverage, and keeps DSS Distro's outreach consistent.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "2026-05-01",
    "owner": "Sales Manager",
    "pdfPath": "./sops/SOP-SALES-002_customer-account-management.pdf",
    "qrgPath": null,
    "purpose": "This SOP defines how the Sales team assigns new and dormant customer accounts to account managers, how account ownership is tracked, and how monthly outreach to open accounts is coordinated. The goal is to make rotation transparent, prevent two reps from working the same account at the same time, and keep DSS Distro's outreach consistent from the customer's point of view.",
    "scope": "Applies to every active account manager on the Sales team and to every customer account flagged as Open in ACT the CRM. Out of scope: customers already assigned to an account manager and currently in a live sales cycle — those remain with the assigned rep and are not re-rotated under this SOP.",
    "definitions": [
      {
        "term": "Open account",
        "meaning": "A customer account with no sales in the last twelve months. Open accounts have no assigned account manager and are part of the rotation pool."
      },
      {
        "term": "Act",
        "meaning": "Our Customer Relation Management system (CRM)."
      },
      {
        "term": "Contact attempted",
        "meaning": "A documented outbound phone call where the rep could not reach the customer (no answer, voicemail, hung up, or spoke only to a staff member)."
      },
      {
        "term": "Contact reached",
        "meaning": "A documented outbound phone call where the rep spoke directly with the decision-maker at the account."
      },
      {
        "term": "Mass email",
        "meaning": "A monthly marketing email sent to all Open accounts. A mass email does NOT count as a contact attempt for rotation purposes."
      },
      {
        "term": "Customer activation spreadsheet",
        "meaning": "The shared sheet that records whose turn is next, all prior account assignments, and the contact history that drives rotation decisions."
      }
    ],
    "roles": [
      {
        "role": "Account Managers",
        "responsibility": "Log every call attempt and reach in the CRM, respect another rep's in-progress account, and take their turn when a new customer or unowned Open account lands."
      },
      {
        "role": "Customer Success",
        "responsibility": "Owns the customer activation tracker, assigns the next rep when a new customer or unowned Open account is received, and resolves rotation disputes."
      },
      {
        "role": "Marketing / Sales Support",
        "responsibility": "Schedules the monthly email blast to Open accounts and inserts the rotating sender name for each cycle."
      }
    ],
    "cadence": "Monthly (email blasts); As needed (account assignments and contact logging)",
    "steps": [
      {
        "title": "Maintain the Customer Activation Spreadsheet",
        "detail": "The customer activation spreadsheet is the single source of truth for rotation. It is visible to every account manager so each rep can see whose turn is next and review the history of past assignments. The spreadsheet has two tabs: Tab 1 — SOP reference: a copy of this SOP (or a link to it) so every rep can confirm the rules without leaving the sheet. Tab 2 — Whose turn is next: the rotation log, where each row records the customer assigned, the rep who received the assignment, the date, and the trigger (new customer, Open/Act pickup, or mass-email reply). Reps are expected to backtrack against their prior rows to make sure every assigned request has been closed out before taking on the next one. New customer requests in particular should be prioritised — they are warmer leads and are easier to convert."
      },
      {
        "title": "Assign New Customer and Unowned-Account Requests",
        "detail": "Account managers alternate. When a request lands, the Sales Manager consults Tab 2 of the customer activation spreadsheet and assigns the request to the rep whose turn is next. New customer requests are assigned to the next rep in rotation with no preconditions, and recorded immediately in Tab 2 so the rotation pointer advances. For Open or Act accounts coming back to DSS: (1) Check the account's contact history in ACT. (2) If no rep has attempted or reached the customer by phone, treat the account as new and assign it to the next rep in rotation. (3) If a rep has already attempted or reached the customer by phone, the account stays with that rep so they can carry on the work they started — other reps do not approach the account. (4) Mass-email activity is ignored at this step; anything that was a mass email is considered uncalled, not called, and does not establish ownership."
      },
      {
        "title": "Apply the Three-Month Re-Opening Rule",
        "detail": "Ownership of an Open account is not permanent. If the rep who claimed the account has had no phone activity — attempt or reach — on that account for three full months, the account returns to the rotation pool and any other rep may pick it up. The three months runs from the date of the most recent logged phone activity, not from the date of the first contact. This rule applies only to Open Act accounts in the rotation and does not apply to a rep's assigned customers — those remain with the assigned rep regardless of call cadence. Worked example: A rep logs a phone attempt on an Open account on 15 January. That rep does not log any further phone activity for the rest of January, February, March, or April. On 16 April, the three-month window has closed and any other rep may now claim and call the account. Mass-email sends in the intervening period do not reset the clock — only logged phone attempts or phone reaches count."
      },
      {
        "title": "Send Monthly Email Blasts to Open Accounts",
        "detail": "DSS sends one mass email per month to all Open accounts. The blast is sent under the name of an individual sales rep — not a generic mailbox — and the sending rep rotates from one month to the next. The rotation is recorded in the customer activation spreadsheet. Rotating the sender protects fairness between reps and protects DSS's image with the customer: the customer does not receive back-to-back outreach from different DSS reps in the same month, which would look uncoordinated."
      },
      {
        "title": "Route Mass-Email Replies and Establish Ownership",
        "detail": "Replies to monthly blasts are routed using these rules: (1) Direct reply to the blast — the customer is assigned to the rep whose name was on that month's blast; the reply lands in that rep's inbox and the account is theirs. (2) Indirect or out-of-band response — if a customer reaches out independently and the response cannot be tied to a specific recent blast, the account goes to whichever rep is next in rotation per Tab 2."
      },
      {
        "title": "Log All Phone Contact in ACT",
        "detail": "Rotation only works if contact history is recorded accurately and consistently. The legacy practice of marking Shopify customer notes with informal flags (e.g. 'Eric was here') is retired. All phone activity is logged in ACT with hard data. Every logged call entry records: the customer account, the rep who placed the call, the date of the call, and the outcome — either Reached (spoke with the decision-maker) or Attempted (no answer, voicemail, hung up, or spoke only to a staff member). Reps working high-value accounts (referred to internally as 'whales') keep ownership by logging at minimum one phone attempt or reach per month. Once three months pass without a logged phone activity, the account returns to the pool regardless of account value."
      }
    ],
    "notes": [
      "Non-Compliance: Reps who approach an Open or Act account that is still inside another rep's three-month window forfeit any commission tied to that account for the cycle, and the account stays with the original rep. Reps who fail to log phone attempts in the customer activation spreadsheet lose protection of their claim — if the activity is not in the sheet, it did not happen, and the three-month clock cannot be backdated. Persistent or repeat violations are escalated to the Sales Manager for review at the rep's next one-on-one.",
      "Exceptions: The Sales Manager may override rotation in writing when a customer explicitly requests a specific rep, when continuity with a prior rep is required to close an in-flight deal, or when onboarding a new rep who needs leads to work. Every exception is recorded as a row in Tab 2 of the customer activation spreadsheet with the reason in the trigger column, so the rotation log remains a complete history.",
      "Mass emails do NOT count as a contact attempt for rotation purposes and do not reset the three-month ownership clock. Only logged phone attempts or phone reaches count.",
      "New customer requests should be prioritised over Open account pickups as they are warmer leads and easier to convert."
    ]
  },
  {
    "id": "sales-003-update-sales-dashboards",
    "deptId": "sales",
    "sopCode": "SOP-SALES-003",
    "title": "Update sales dashboards (DSS / FLVRS / ACT)",
    "desc": "This procedure ensures every DSS sales reporting surface — DSS Sales, FLVRS Sales, ACT Dashboard, Missing Opportunities, Back In Stock, and the Power BI dashboard — is refreshed from the same source extract on a consistent cadence.",
    "status": "Active",
    "version": "v1.0",
    "effectiveDate": "June 2026",
    "owner": "Sales Reporting Analyst",
    "pdfPath": "./sops/SOP-SALES-003_update-sales-dashboards.pdf",
    "qrgPath": "./sops/QRG-SALES-003_update-sales-dashboards.pdf",
    "purpose": "This procedure ensures every DSS sales reporting surface — DSS Sales, FLVRS Sales, ACT Dashboard, Missing Opportunities, Back In Stock, and the Power BI dashboard — is refreshed from the same source extract on a consistent cadence. Running the steps in order keeps the numbers across dashboards reconciled and the published Power BI report in sync with the underlying Excel automations.",
    "scope": "This SOP applies to any DSS employee responsible for maintaining sales reporting, business intelligence, or Power BI dashboards. Out of scope: designing new dashboard visuals, modifying the underlying Power BI semantic model, and creating new automation macros — those changes go through the BI lead before any refresh run.",
    "definitions": [],
    "roles": [],
    "cadence": "Weekly",
    "steps": [
      {
        "title": "Run sales data extraction",
        "detail": "Navigate to the sales report automation folder and launch the extraction batch file. Folder:  P:\\- DSS Tools\\3. Sales & Reporting\\3.1 Sales Report Automation Run:  Run_Sales_Reports_Data_Extraction.bat Wait for the batch window to complete before continuing. The downstream macros assume the extract has finished."
      },
      {
        "title": "Refresh the sales report workbook",
        "detail": "Open the sales report workbook. Open:  P:\\_Pamela\\!Sales, Samples & Reports\\1 - Sales Report Automation\\Sales Report.xlsm Select Data → Refresh All. Let the queries complete before moving on."
      },
      {
        "title": "Validate SKU updates",
        "detail": "Inside the refreshed workbook, review the validation tabs: •\tSKUs for Update — confirm new or changed SKUs are recognised. •\tFLVRS Checker — confirm FLVRS line-item mapping is current. If either tab flags unresolved items, correct the source list before running the dashboard macros."
      },
      {
        "title": "Review supporting databases",
        "detail": "If any of the supporting databases need to be updated this cycle, update them now. The dashboard macros pull from these files."
      },
      {
        "title": "Clean the FLVRS weekly sales report",
        "detail": "Open the FLVRS weekly sales sheet. Review the transaction list and remove any retail transactions — wholesale-only data should reach the dashboard."
      },
      {
        "title": "Update DSS dashboards",
        "detail": "From the sales report workbook, run the DSS dashboard macros in order:"
      }
    ],
    "notes": []
  }
];

// ---- TOOLS ----
// Only tools with video tutorials are kept here.
// The tool detail page (tool.html) renders from this array.
const tools = [
  {
    id: "globe-11-orders",
    deptId: "sales",
    version: "1.1",
    name: "Globe 11 Orders Automation",
    desc: "Generates and manages Globe 11 purchase orders by province, including SKU breakdown and formatting for supplier submission.",
    tags: ["Orders", "Excel", "VBA", "Globe 11"],
    path: "P:\\- DSS Tools\\1. Order Creation\\1.1 Globe 11 Orders\\Globe 11 Orders Automation.xlsm",
    when: [
      "When Globe 11 needs a new purchase order prepared.",
      "When you need standardized output for Globe 11 ordering by province."
    ],
    inputs: [
      "Latest inventory/sales info (if applicable to the file).",
      "Globe 11 product list or export used by the tool."
    ],
    steps: [
      "Open the workbook and enable macros.",
      "Refresh data (if the tool has Power Query connections).",
      "Review the suggested order quantities by province.",
      "Export or copy the final order to the required format (email/PO/export tab).",
      "Save and archive the output if needed."
    ],
    outputs: [
      "Prepared Globe 11 order broken down by province.",
      "Exportable order format depending on the tool setup."
    ],
    issues: [
      { problem: "Refresh fails / prompts for file location.", fix: "Check network drive access (P:). If prompted, point to the required source files/folders." },
      { problem: "Numbers look wrong (too high/low).", fix: "Confirm the data source is updated and the correct date range/filters are selected." }
    ]
  }
];

// ---- TUTORIALS ----
// videoId → YouTube video ID (part after ?v=). Set as UNLISTED on YouTube.
const tutorials = [
  {
    id: "tut-globe-11-orders",
    toolId: "globe-11-orders",
    deptId: "sales",
    title: "Globe 11 Orders — Full Walkthrough",
    desc: "Step-by-step walkthrough of the Globe 11 Orders automation workbook: setup, data refresh, and order export.",
    tags: ["Orders", "Excel", "VBA"],
    videoId: "WqWoRFdUf8w",
    url: "https://www.youtube.com/watch?v=WqWoRFdUf8w"
  }
];
