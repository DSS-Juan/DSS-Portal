// ============================================================
// DSS Portal v2 — Single Source of Truth
// All data lives here. index.js, tool.js, and docs.js all
// read from this one file. To add a tool: add ONE object here.
// ============================================================

const departments = [
  {
    id: "accounting",
    number: 1,
    name: "Accounting",
    icon: "🧾",
    color: "#0071e3",
    desc: "Financial reconciliation, compliance reporting, and stamp accounting workflows."
  },
  {
    id: "sales",
    number: 2,
    name: "Sales",
    icon: "💼",
    color: "#5e5ce6",
    desc: "Sales reporting, CRM updates, and customer analytics tools."
  },
  {
    id: "laboratory",
    number: 3,
    name: "Laboratory",
    icon: "🔬",
    color: "#30d158",
    desc: "Lab formulations, testing workflows, and R&D tools."
  },
  {
    id: "ops",
    number: 4,
    name: "Ops",
    icon: "⚙️",
    color: "#ff9f0a",
    desc: "Operational workflows and cross-department process automation."
  },
  {
    id: "marketing",
    number: 5,
    name: "Marketing",
    icon: "📣",
    color: "#ff375f",
    desc: "Marketing campaigns, content management, and promotional tools."
  },
  {
    id: "warehouse",
    number: 6,
    name: "Warehouse",
    icon: "🏭",
    color: "#ffd60a",
    desc: "Inventory management, stock control, and discontinued SKU workflows."
  },
  {
    id: "production",
    number: 7,
    name: "Production",
    icon: "⚗️",
    color: "#64d2ff",
    desc: "Production planning, recipe mixing, and manufacturing workflows."
  },
  {
    id: "supplies-ordering",
    number: 8,
    name: "Supplies Ordering",
    icon: "📋",
    color: "#bf5af2",
    desc: "Purchase order creation and supplier ordering workflows."
  },
  {
    id: "dss-shopify",
    number: 9,
    name: "DSS Shopify",
    icon: "🛍️",
    color: "#e10600",
    desc: "Shopify inventory management, policy updates, and website upload workflows."
  }
];

// ---- TOOLS ----
// Each tool lives here ONCE. Both the card on the homepage
// and the full detail page read from this same object.
// Fields: id, deptId, version, name, desc, tags, path,
//         when, inputs, steps, outputs, issues
const tools = [
  {
    id: "globe-11-orders",
    deptId: "supplies-ordering",
    version: "1.1",
    name: "Globe 11 Orders",
    desc: "Create and organize Globe 11 orders using the automation workbook.",
    tags: ["Orders", "Excel", "VBA"],
    path: "P:\\- DSS Tools\\1. Order Creation\\1.1 Globe 11 Orders\\Globe 11 Orders Automation.xlsm",
    when: [
      "When Globe 11 needs a new purchase order prepared.",
      "When you need standardized output for Globe 11 ordering."
    ],
    inputs: [
      "Latest inventory/sales info (if applicable to the file).",
      "Any Globe 11 product list/export used by the tool."
    ],
    steps: [
      "Open the workbook.",
      "Refresh data (if the tool has Power Query connections).",
      "Review the suggested order quantities.",
      "Export or copy the final order to the required format (email/PO/export tab).",
      "Save and archive the output if needed."
    ],
    outputs: [
      "Prepared Globe 11 order (tabs inside the workbook).",
      "Exportable order format depending on the tool setup."
    ],
    issues: [
      { problem: "Refresh fails / prompts for file location.", fix: "Check network drive access (P:). If prompted, point to the required source files/folders." },
      { problem: "Numbers look wrong (too high/low).", fix: "Confirm the data source is updated and the correct date range/filters are selected." }
    ]
  },

  {
    id: "stlth-orders",
    deptId: "supplies-ordering",
    version: "1.2",
    name: "STLTH Orders",
    desc: "Generate STLTH orders with the standardized workflow and tabs.",
    tags: ["Orders", "Excel", "VBA"],
    path: "P:\\- DSS Tools\\1. Order Creation\\1.2 STLTH Orders\\STLTH Orders.xlsm",
    when: [
      "When STLTH requires a new order to be created.",
      "When the team needs a consistent ordering format with validation."
    ],
    inputs: [
      "Any STLTH inventory/sales inputs referenced by the workbook.",
      "Latest product list if the tool uses lookups."
    ],
    steps: [
      "Open the workbook.",
      "Refresh/update inputs (if any).",
      "Review quantities and adjust if needed.",
      "Generate the final order output (tab/export).",
      "Save and share the result."
    ],
    outputs: [
      "Final STLTH order in the workbook (and/or export tab)."
    ],
    issues: [
      { problem: "Co-brand / unknown items not categorized.", fix: "Update mapping tables (if present) or verify SKU naming in the source data." },
      { problem: "Export button/macro not working.", fix: "Enable macros and ensure the file is opened as .xlsm (not protected view)." }
    ]
  },

  {
    id: "shopify-continue-deny-automation",
    deptId: "dss-shopify",
    version: "2.1.1",
    name: "Continue or Deny Shopify (Automation)",
    desc: "Automated Continue/Deny master file workflow for Shopify inventory updates.",
    tags: ["Shopify", "Inventory", "Automation"],
    path: "P:\\- DSS Tools\\2. Website Inventory Update (Shopify)\\2.1 Shopify Inventory Tools\\2.1.1 Continue or Deny Shopify Automation\\Shopify - Continue Or Deny MSTR File Automation.xlsm",
    when: [
      "When you need to update Shopify inventory policy decisions at scale.",
      "When you want to generate a clean master file to upload/apply."
    ],
    inputs: [
      "Shopify products export (CSV/Excel depending on workflow).",
      "Warehouse/ERPLY stock export (if used in the logic)."
    ],
    steps: [
      "Open the workbook and enable macros.",
      "Import/refresh the Shopify export and stock sources.",
      "Review the Continue/Deny results (exceptions first).",
      "Generate/export the master output file.",
      "Use the output in the next step of the Shopify workflow."
    ],
    outputs: [
      "Master Continue/Deny output file (ready for next workflow step).",
      "Review tabs for exceptions/validation."
    ],
    issues: [
      { problem: "Export columns don't match Shopify format.", fix: "Verify you used the correct Shopify export version and didn't remove required columns." },
      { problem: "Some products missing from output.", fix: "Check filters (samples/misc) and confirm SKU formats match between sources." }
    ]
  },

  {
    id: "shopify-continue-deny-manual",
    deptId: "dss-shopify",
    version: "2.1.2",
    name: "Continue or Deny Shopify (Manual)",
    desc: "Manual comparison file for Continue/Deny decisions in Shopify.",
    tags: ["Shopify", "Inventory"],
    path: "P:\\- DSS Tools\\2. Website Inventory Update (Shopify)\\2.1 Shopify Inventory Tools\\2.1.2 Continue or Deny Shopify Manually\\Shopify - Continue Or Deny Comparison.xlsx",
    when: [
      "When you want to manually validate Continue/Deny decisions.",
      "When you are troubleshooting automation results."
    ],
    inputs: [
      "Shopify export.",
      "Any stock/inventory reference file used for comparison."
    ],
    steps: [
      "Open the comparison workbook.",
      "Load/paste the Shopify export and the reference stock data into the expected tabs.",
      "Review the comparison results and make decisions.",
      "Copy/export the final decision list."
    ],
    outputs: [
      "Manual decision list for Continue/Deny."
    ],
    issues: [
      { problem: "Formulas show #N/A or blanks.", fix: "Confirm SKU codes match and there are no extra spaces; verify the correct columns were pasted." }
    ]
  },

  {
    id: "dss-upload-cart",
    deptId: "dss-shopify",
    version: "2.2",
    name: "DSS Upload Cart Automation",
    desc: "Build and upload cart data for DSS Shopify updates.",
    tags: ["Shopify", "Uploads"],
    path: "P:\\- DSS Tools\\2. Website Inventory Update (Shopify)\\2.2 DSS Upload Cart Automation\\DSS Upload Cart Automation.xlsx",
    when: [
      "When you need to generate upload-ready cart data for DSS Shopify.",
      "When preparing bulk changes that require a structured upload file."
    ],
    inputs: [
      "Source list of products/changes to be applied.",
      "Any required Shopify template/export used by the tool."
    ],
    steps: [
      "Open the workbook.",
      "Paste or refresh the source input data.",
      "Validate quantities/fields.",
      "Generate the upload file output."
    ],
    outputs: [
      "Upload-ready cart file/tab."
    ],
    issues: [
      { problem: "Upload rejects rows in Shopify.", fix: "Confirm required columns and formats match Shopify's template. No empty required fields." }
    ]
  },

  {
    id: "sales-report",
    deptId: "sales",
    version: "3.1",
    name: "Sales Report Automation",
    desc: "Refresh the sales reporting model using the shortcut.",
    tags: ["Reporting", "Power Query"],
    path: "P:\\- DSS Tools\\3. Sales & Reporting\\3.1 Sales Report Automation\\Sales Report - Shortcut.lnk",
    when: [
      "Weekly/monthly reporting refresh.",
      "When you need totals by customer, product, province, or time period."
    ],
    inputs: [
      "Latest DSS sales exports used by the model.",
      "Any supporting mapping tables (SKU master, product groups, etc.)."
    ],
    steps: [
      "Open the shortcut (or the workbook it points to).",
      "Refresh all queries.",
      "Wait for refresh to complete (check for errors).",
      "Review key tabs/dashboards and export if needed."
    ],
    outputs: [
      "Updated report tables, pivots, and charts in the workbook."
    ],
    issues: [
      { problem: "Refresh is slow or hangs.", fix: "Close other Excel files; refresh again; confirm network connection to P: drive." },
      { problem: "New SKUs not grouped correctly.", fix: "Update mapping tables (SKU master/product group database) and refresh again." }
    ]
  },

  {
    id: "canntrack-stamp-recon",
    deptId: "accounting",
    version: "3.3",
    name: "CannTrack vs Purchase – Stamp Reconciliation",
    desc: "Reconcile CannTrack vs Purchase records and validate stamp movements.",
    tags: ["Compliance", "Reconciliation", "Excel"],
    path: "P:\\- DSS Tools\\3. Sales & Reporting\\3.3 CannTrack vs Purchase – Stamp Reconciliation\\Canntrack VS Purchase Automation - NEW.xlsm",
    when: [
      "When doing compliance reconciliation for stamps.",
      "When validating differences between CannTrack and purchase records."
    ],
    inputs: [
      "CannTrack export/report.",
      "Purchase/export file used for comparison."
    ],
    steps: [
      "Open the workbook and enable macros.",
      "Import/paste CannTrack data into the expected tab.",
      "Import/paste Purchase data into the expected tab.",
      "Run the reconciliation (button/macro if available).",
      "Review mismatches and investigate exceptions."
    ],
    outputs: [
      "Reconciliation results tab (matches/mismatches).",
      "Summary of differences for follow-up."
    ],
    issues: [
      { problem: "Columns don't align after import.", fix: "Use the expected template export format; don't rearrange headers." },
      { problem: "Too many mismatches.", fix: "Check date ranges and verify both exports cover the same period." }
    ]
  },

  {
    id: "discontinued-skus-manufactured",
    deptId: "warehouse",
    version: "4.1",
    name: "Discontinued SKUs Tool (Manufactured Products)",
    desc: "Identify discontinued manufactured products still showing online and generate action lists.",
    tags: ["Inventory", "Shopify", "ERPLY", "Manufactured"],
    path: "P:\\- DSS Tools\\4. Inventory Management (ERPLY + Shopify)\\4.1 STLTH Discontinued SKUs Tool\\Discontinued SKUs Tool Automation.xlsm",
    when: [
      "When you need to clean up discontinued manufactured products in Shopify.",
      "When you want HOLD/REMOVE lists based on stock."
    ],
    inputs: [
      "Shopify export (products/variants).",
      "Warehouse/ERPLY inventory export."
    ],
    steps: [
      "Open the workbook and refresh data.",
      "Review HOLD list (discontinued but has stock).",
      "Review REMOVE list (discontinued and no stock).",
      "Export/copy the action lists for execution."
    ],
    outputs: [
      "HOLD list (still has stock).",
      "REMOVE list (no stock).",
      "Cleaned tables sorted for execution."
    ],
    issues: [
      { problem: "Sales date columns change names after updates.", fix: "Keep the query logic flexible or rename the column back to the expected name before refresh." },
      { problem: "Items missing from candidates.", fix: "Verify the discontinued flag/status in source exports and confirm filters (samples/misc) are correct." }
    ]
  },

  {
    id: "discontinued-skus-stlth",
    deptId: "warehouse",
    version: "4.1b",
    name: "STLTH Discontinued SKUs Tool",
    desc: "Identify discontinued STLTH items still showing online and generate HOLD/REMOVE action lists.",
    tags: ["Inventory", "Shopify", "ERPLY", "STLTH"],
    path: "P:\\- DSS Tools\\4. Inventory Management (ERPLY + Shopify)\\4.1 STLTH Discontinued SKUs Tool\\STLTH Discontinued SKUs Tool Automation.xlsm",
    when: [
      "When you need to clean up discontinued STLTH products in Shopify.",
      "When you want HOLD/REMOVE lists based on warehouse stock."
    ],
    inputs: [
      "Shopify export (STLTH items).",
      "Warehouse inventory export."
    ],
    steps: [
      "Open the workbook and refresh all data.",
      "Review the HOLD and REMOVE outputs.",
      "Export/copy the action lists to execute in Shopify."
    ],
    outputs: [
      "HOLD list (discontinued but still has stock).",
      "REMOVE list (discontinued and no stock)."
    ],
    issues: [
      { problem: "Wrong items are marked HOLD/REMOVE.", fix: "Confirm stock column mapping (WH available) and ensure inventory export is updated." }
    ]
  },

  {
    id: "stock-replenishment",
    deptId: "production",
    version: "5.1",
    name: "Stock Replenishment Automation",
    desc: "Generate a replenishment and production plan based on inventory levels and sales velocity.",
    tags: ["Replenishment", "Production", "Excel"],
    path: "P:\\- DSS Tools\\5. Stock Replenishment System\\5.1 Stock Replenishment Automation\\Stock Replenishment Automation.xlsm",
    when: [
      "Weekly replenishment planning.",
      "When generating production plans and label-only plans."
    ],
    inputs: [
      "Warehouse inventory export.",
      "Sales data exports (last X days).",
      "SKU master / product group database (if used)."
    ],
    steps: [
      "Open the workbook and refresh all sources.",
      "Review replenishment recommendations.",
      "Adjust exceptions if required.",
      "Export production plan outputs."
    ],
    outputs: [
      "Production plan tables (machine plan/label-only plan depending on setup)."
    ],
    issues: [
      { problem: "Refresh errors due to file paths.", fix: "Confirm the source files exist and paths are correct (P: drive mapped)." },
      { problem: "Quantities too high/low.", fix: "Verify sales window (last 60/120 days) and min/max logic settings used by the tool." }
    ]
  },

  {
    id: "recipes-automation",
    deptId: "production",
    version: "6.2",
    name: "Recipes Automation",
    desc: "Generate recipe mixing cards and printing output (shortcut).",
    tags: ["Production", "Recipes", "Printing"],
    path: "P:\\- DSS Tools\\6. Production & Recipes\\6.2 Recipes Automation\\Recipe Mixing printing Final - Base on ml V.10 - Shortcut.lnk",
    when: [
      "When creating mixing cards from the mixing order.",
      "When printing recipe cards for production."
    ],
    inputs: [
      "Mixing Order sheet/table (inside the workbook or linked file).",
      "Recipe database/SKU mapping (if used)."
    ],
    steps: [
      "Open the shortcut/workbook.",
      "Update the Mixing Order data.",
      "Run the macro to generate mixing cards (tabs).",
      "Print or export the cards to PDF if required."
    ],
    outputs: [
      "Mixing card tabs generated per batching/grouping logic.",
      "Printable/exportable cards for production."
    ],
    issues: [
      { problem: "Cards generate in wrong grouping.", fix: "Check the grouping rules (product name, nicotine level) and verify duplicates logic." },
      { problem: "PDF export not working.", fix: "Confirm Mac/PC export macro version and that sheets are not protected." }
    ]
  },

  {
    id: "act-import-update",
    deptId: "sales",
    version: "7.1",
    name: "Act Import Update Data Base Automation",
    desc: "Create Act-ready import files and update the Act database workflow.",
    tags: ["Act", "Imports", "Automation"],
    path: "P:\\- DSS Tools\\7. Act\\7.1 Act Import Update Data Base Automation\\Act Data Updated - Import Automation Tool.xlsm",
    when: [
      "When you need to update Last Order Date/Amount in Act.",
      "When preparing Act import files for the team."
    ],
    inputs: [
      "Final customer table (Contact, Last Order Date, Last Order Amount).",
      "Any Act export used to match/update records (if needed)."
    ],
    steps: [
      "Open the workbook and refresh/update the source table.",
      "Validate the required columns (Contact, Last Order Date, Last Order Amount).",
      "Run the export macro to generate the import file.",
      "Import the file into Act using the standard mapping."
    ],
    outputs: [
      "Act import file (Excel/CSV depending on your workflow)."
    ],
    issues: [
      { problem: "Act merge skips records.", fix: "Verify the key field matches exactly (email/contact ID) and data types are correct." },
      { problem: "Dates or amounts not updating.", fix: "Confirm mapping in the import tool and ensure no transformation is blocking the fields." }
    ]
  }
];

// ---- TUTORIALS ----
// Each tutorial links to a tool via toolId.
// videoId  → YouTube video ID (the part after ?v= in the URL)
//            Set the video as UNLISTED on YouTube so it can be embedded.
// url      → full YouTube watch link (used as fallback / open in YouTube)
const tutorials = [
  {
    id: "tut-globe-11-orders",
    toolId: "globe-11-orders",
    deptId: "supplies-ordering",
    title: "Globe 11 Orders — Full Walkthrough",
    desc: "Step-by-step walkthrough of the Globe 11 Orders automation workbook: setup, data refresh, and order export.",
    tags: ["Orders", "Excel", "VBA"],
    videoId: "WqWoRFdUf8w",
    url: "https://www.youtube.com/watch?v=WqWoRFdUf8w"
  }
  // Add more tutorials here as you upload them to YouTube.
  // Example:
  // {
  //   id: "tut-sales-report",
  //   toolId: "sales-report",
  //   deptId: "sales",
  //   title: "Sales Report Automation: Refresh + Filters",
  //   desc: "How to refresh the model and read the weekly/monthly results.",
  //   tags: ["Reporting", "Power Query"],
  //   videoId: "YOUR_VIDEO_ID_HERE",
  //   url: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID_HERE"
  // },
];

// ---- PROCESS GUIDES / SOPs ----
// Add new SOPs here. Fields: id, deptId, title, desc, steps[], lastUpdated
const docs = [
  {
    id: "shopify-inventory-sop",
    deptId: "dss-shopify",
    title: "Shopify Inventory Update — Full Workflow",
    desc: "End-to-end SOP for running the Continue/Deny update and uploading changes to Shopify.",
    steps: [
      "Export all products from Shopify (Products → Export → All products).",
      "Run the Continue or Deny Automation tool (2.1.1) with the Shopify export.",
      "Review the exception tabs and handle any flagged items manually.",
      "Export the master output file from the automation tool.",
      "Use the Upload Cart Automation (2.2) to push the changes to Shopify.",
      "Verify the update applied correctly in the Shopify admin."
    ],
    lastUpdated: "2025-01-01"
  },
  {
    id: "replenishment-sop",
    deptId: "production",
    title: "Weekly Stock Replenishment Process",
    desc: "Step-by-step guide for running the weekly replenishment and production planning workflow.",
    steps: [
      "Pull the warehouse inventory export from ERPLY.",
      "Pull sales data for the required window (last 60 or 120 days).",
      "Open the Stock Replenishment Automation workbook (5.1).",
      "Refresh all data sources.",
      "Review and adjust replenishment quantities as needed.",
      "Export the production plan for the production team."
    ],
    lastUpdated: "2025-01-01"
  },
  {
    id: "canntrack-sop",
    deptId: "accounting",
    title: "CannTrack Stamp Reconciliation — SOP",
    desc: "Compliance reconciliation process for matching CannTrack vs. Purchase stamp records.",
    steps: [
      "Export the CannTrack report for the period being reconciled.",
      "Export the purchase records for the same period.",
      "Open the CannTrack vs Purchase Automation workbook (3.3) and enable macros.",
      "Paste the CannTrack export into the expected tab.",
      "Paste the purchase data into the expected tab.",
      "Run the reconciliation macro.",
      "Review all mismatches and document exceptions.",
      "Submit the reconciliation summary to the compliance team."
    ],
    lastUpdated: "2025-01-01"
  }
];
