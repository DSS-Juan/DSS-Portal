// ============================================================
// DSS Portal v2 — Single Source of Truth
// All data lives here. index.js, tool.js, and docs.js all
// read from this one file. To add a tool: add ONE object here.
// ============================================================

const departments = [
  {
    id: "sales",
    number: 1,
    name: "Sales",
    icon: "💼",
    color: "#5e5ce6",
    desc: "Order creation, sales reporting, customer analytics, and opportunity tracking tools."
  },
  {
    id: "accounting",
    number: 2,
    name: "Accounting & Finance",
    icon: "🧾",
    color: "#0071e3",
    desc: "Payment reconciliation, tax reporting, financial extract scripts, and compliance workflows."
  },
  {
    id: "operations",
    number: 3,
    name: "Operations",
    icon: "⚙️",
    color: "#ff9f0a",
    desc: "Stock replenishment, Shopify inventory management, and operational automation tools."
  },
  {
    id: "production",
    number: 4,
    name: "Production",
    icon: "⚗️",
    color: "#64d2ff",
    desc: "Production planning, batch scheduling, recipe mixing, and manufacturing workflows."
  },
  {
    id: "erp-integration",
    number: 5,
    name: "ERP / System Integration",
    icon: "🔌",
    color: "#30d158",
    desc: "ERPLY API imports/exports, matrix data handling, and ERP-to-system conversion tools."
  },
  {
    id: "data-automation",
    number: 6,
    name: "Data & Automation",
    icon: "🤖",
    color: "#bf5af2",
    desc: "Cross-platform automation scripts, data pipelines, and productivity tools."
  }
];

// ---- TOOLS ----
// Each tool lives here ONCE. Both the card on the homepage
// and the full detail page read from this same object.
// Fields: id, deptId, version, name, desc, tags, path,
//         when, inputs, steps, outputs, issues
const tools = [

  // =====================================================
  // SALES TEAM
  // =====================================================
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
  },

  {
    id: "stlth-orders",
    deptId: "sales",
    version: "1.2",
    name: "STLTH Orders Tool",
    desc: "Creates and processes STLTH orders with structured product and provincial segmentation.",
    tags: ["Orders", "Excel", "VBA", "STLTH"],
    path: "P:\\- DSS Tools\\1. Order Creation\\1.2 STLTH Orders\\STLTH Orders.xlsm",
    when: [
      "When STLTH requires a new order to be created.",
      "When the team needs a consistent ordering format with provincial segmentation."
    ],
    inputs: [
      "STLTH inventory/sales inputs referenced by the workbook.",
      "Latest product list if the tool uses lookups."
    ],
    steps: [
      "Open the workbook and enable macros.",
      "Refresh/update inputs (if any).",
      "Review quantities by product and province; adjust if needed.",
      "Generate the final order output (tab/export).",
      "Save and share the result."
    ],
    outputs: [
      "Final STLTH order with provincial segmentation (and/or export tab)."
    ],
    issues: [
      { problem: "Co-brand / unknown items not categorized.", fix: "Update mapping tables (if present) or verify SKU naming in the source data." },
      { problem: "Export button/macro not working.", fix: "Enable macros and ensure the file is opened as .xlsm (not in protected view)." }
    ]
  },

  {
    id: "missing-opportunities",
    deptId: "sales",
    version: "3.2",
    name: "Missing Opportunities Tool",
    desc: "Identifies missed sales opportunities based on historical sales and customer behavior.",
    tags: ["Sales", "Analytics", "Excel"],
    path: "P:\\- DSS Tools\\3. Sales & Reporting\\Missing Opportunities.xlsm",
    when: [
      "When reviewing which customers have dropped off or reduced orders.",
      "When preparing targeted outreach based on missed revenue opportunities."
    ],
    inputs: [
      "Sales history export for the relevant period.",
      "Customer list or CRM export (if applicable)."
    ],
    steps: [
      "Open the workbook and enable macros.",
      "Refresh or paste the latest sales data into the expected tab.",
      "Review the opportunity list generated by the tool.",
      "Filter and sort by rep, region, or product category as needed.",
      "Export the final list for follow-up."
    ],
    outputs: [
      "List of customers with missed or reduced order opportunities.",
      "Summary by rep/region for action planning."
    ],
    issues: [
      { problem: "Customers not showing up in results.", fix: "Verify the sales export date range covers the required comparison period." },
      { problem: "Values seem off.", fix: "Confirm the correct sales source was used and no filters are excluding key accounts." }
    ]
  },

  {
    id: "indemnity-signatures-missing",
    deptId: "sales",
    version: "3.4",
    name: "Indemnity Signatures Missing Tool",
    desc: "Tracks customers missing indemnity agreements required for compliance.",
    tags: ["Compliance", "Sales", "Excel"],
    path: "P:\\- DSS Tools\\3. Sales & Reporting\\Indemnity Signatures Missing.xlsm",
    when: [
      "When auditing which customers are missing signed indemnity agreements.",
      "When preparing compliance reports for the sales team."
    ],
    inputs: [
      "Customer list or CRM export.",
      "Signed indemnity agreement tracker/log (if used by the tool)."
    ],
    steps: [
      "Open the workbook.",
      "Refresh or paste the latest customer and signature data.",
      "Review the list of customers flagged as missing signatures.",
      "Export or share the list with the relevant reps for follow-up."
    ],
    outputs: [
      "List of customers missing indemnity signatures.",
      "Summary by rep or territory for compliance reporting."
    ],
    issues: [
      { problem: "Customers incorrectly flagged.", fix: "Verify the signature log is up to date and customer names/IDs match exactly." },
      { problem: "File won't open.", fix: "Confirm P: drive is mapped and macros are enabled." }
    ]
  },

  // =====================================================
  // ACCOUNTING & FINANCE
  // =====================================================
  {
    id: "rosie-all-in-one",
    deptId: "accounting",
    version: "13.1",
    name: "Rosie – All In One Tool",
    desc: "Consolidates payment data from ERPLY, Shopify, and EMT into a unified dataset for reconciliation.",
    tags: ["Reconciliation", "Shopify", "ERPLY", "Excel", "VBA"],
    path: "P:\\- DSS Tools\\13. Accounting\\Rosie\\All_In_One.xlsm",
    when: [
      "When running monthly or weekly payment reconciliation.",
      "When consolidating ERPLY, Shopify, and EMT payment sources into one view."
    ],
    inputs: [
      "ERPLY sales extract (from Rosie_Erply_sales_master_extract.py).",
      "Shopify payment transactions export (from Rosie_Shopify_Payment_Transactions.py).",
      "EMT payment file for the same period."
    ],
    steps: [
      "Run the ERPLY and Shopify extract scripts to pull the latest data.",
      "Open All_In_One.xlsm and enable macros.",
      "Load the ERPLY, Shopify, and EMT data into the expected tabs.",
      "Run the consolidation macro.",
      "Review the unified payment summary and investigate exceptions.",
      "Export the reconciliation report."
    ],
    outputs: [
      "Consolidated payment dataset across all three sources.",
      "Exception/mismatch tab for follow-up."
    ],
    issues: [
      { problem: "Data from one source is missing.", fix: "Re-run the corresponding extract script and confirm the output file is in the expected folder." },
      { problem: "Amounts don't balance.", fix: "Check date ranges — all three sources must cover the exact same period." }
    ]
  },

  {
    id: "erply-sales-extract",
    deptId: "accounting",
    version: "13.2",
    name: "ERPLY Sales Extract Script",
    desc: "Extracts detailed sales data from ERPLY for reporting and reconciliation.",
    tags: ["ERPLY", "Python", "Extract", "Accounting"],
    path: "P:\\- DSS Tools\\13. Accounting\\Rosie\\Rosie_Erply_sales_master_extract.py",
    when: [
      "When pulling ERPLY sales data for the Rosie reconciliation workflow.",
      "When you need a fresh ERPLY sales extract for any reporting period."
    ],
    inputs: [
      "ERPLY API credentials (configured in the script or environment).",
      "Date range parameters for the extract."
    ],
    steps: [
      "Open a terminal and navigate to the Rosie folder on the P: drive.",
      "Run: python Rosie_Erply_sales_master_extract.py",
      "Enter the required date range when prompted (if applicable).",
      "Wait for the script to complete — output file saved to the Rosie folder.",
      "Use the output file as input to All_In_One.xlsm."
    ],
    outputs: [
      "ERPLY sales extract file (Excel/CSV) saved to the Rosie folder."
    ],
    issues: [
      { problem: "API authentication error.", fix: "Verify ERPLY API credentials and confirm the account has the required permissions." },
      { problem: "Script runs but output is empty.", fix: "Check the date range — ensure there are transactions in the specified period." }
    ]
  },

  {
    id: "shopify-payments-extract",
    deptId: "accounting",
    version: "13.3",
    name: "Shopify Payments Extract Script",
    desc: "Extracts Shopify transaction and payment data for financial analysis and reconciliation.",
    tags: ["Shopify", "Python", "Extract", "Accounting"],
    path: "P:\\- DSS Tools\\13. Accounting\\Rosie\\Rosie_Shopify_Payment_Transactions.py",
    when: [
      "When pulling Shopify payment data for the Rosie reconciliation workflow.",
      "When you need a payment transaction export for a specific Shopify period."
    ],
    inputs: [
      "Shopify API credentials (configured in the script or environment).",
      "Date range for the payment extract."
    ],
    steps: [
      "Open a terminal and navigate to the Rosie folder on the P: drive.",
      "Run: python Rosie_Shopify_Payment_Transactions.py",
      "Enter the required date range when prompted (if applicable).",
      "Wait for the script to complete — output file saved to the Rosie folder.",
      "Use the output file as input to All_In_One.xlsm."
    ],
    outputs: [
      "Shopify payment transactions export file (Excel/CSV) saved to the Rosie folder."
    ],
    issues: [
      { problem: "API authentication error.", fix: "Check that the Shopify API key and secret are correct and the store URL is properly configured." },
      { problem: "Missing transactions.", fix: "Confirm the date range and ensure the API access scopes include order/payment data." }
    ]
  },

  {
    id: "nova-scotia-tax-report",
    deptId: "accounting",
    version: "3.5",
    name: "Nova Scotia Tax Report (VPRR)",
    desc: "Generates the official MFG tax return using production, sales, and inventory data.",
    tags: ["Tax", "Compliance", "Excel", "Nova Scotia"],
    path: "P:\\- DSS Tools\\3. Sales & Reporting\\Nova Scotia Tax Report.xlsm",
    when: [
      "When preparing the Nova Scotia Vaping Product Retailer Remittance (VPRR) filing.",
      "When compiling production, sales, and inventory data for the MFG tax return."
    ],
    inputs: [
      "Production data for the reporting period.",
      "Sales data for Nova Scotia.",
      "Inventory levels at the start and end of the period."
    ],
    steps: [
      "Open the workbook and enable macros.",
      "Paste or refresh the production, sales, and inventory data into their respective tabs.",
      "Run the calculation macro to generate the tax report.",
      "Review the totals and verify against source records.",
      "Export or print the final report for submission."
    ],
    outputs: [
      "Completed Nova Scotia VPRR tax return ready for filing."
    ],
    issues: [
      { problem: "Totals don't match expected values.", fix: "Double-check that the production and sales data cover exactly the same reporting period." },
      { problem: "Macro errors on refresh.", fix: "Ensure macros are enabled and the workbook is not in protected view." }
    ]
  },

  // =====================================================
  // OPERATIONS
  // =====================================================
  {
    id: "stock-replenishment",
    deptId: "operations",
    version: "15.1",
    name: "Stock Replenishment Tool",
    desc: "Generates stock replenishment plans by region and validates purchase requirements.",
    tags: ["Replenishment", "Inventory", "Excel", "VBA"],
    path: "P:\\- DSS Tools\\15. Back Ups\\Template - Stock Replenishment - PER REGION New Provinces with Macro.xlsm",
    when: [
      "When running weekly or monthly stock replenishment planning.",
      "When generating purchase requirements broken down by region/province."
    ],
    inputs: [
      "Warehouse inventory export.",
      "Sales data for the required window (last 60 or 120 days).",
      "SKU master / product group database (if used)."
    ],
    steps: [
      "Open the workbook and enable macros.",
      "Refresh all data sources.",
      "Review replenishment recommendations by region.",
      "Adjust exceptions if required.",
      "Export replenishment plan outputs for purchasing."
    ],
    outputs: [
      "Stock replenishment plan by region/province.",
      "Purchase requirement summary for supplier orders."
    ],
    issues: [
      { problem: "Refresh errors due to file paths.", fix: "Confirm the source files exist and paths are correct (P: drive mapped)." },
      { problem: "Quantities too high/low.", fix: "Verify the sales window setting (last 60/120 days) and min/max logic used by the tool." }
    ]
  },

  {
    id: "inventory-diff",
    deptId: "operations",
    version: "2.1.3",
    name: "Inventory Diff Tool (Shopify vs Warehouse)",
    desc: "Compares Shopify inventory with warehouse stock to detect discrepancies.",
    tags: ["Shopify", "Inventory", "Warehouse", "Excel"],
    path: "P:\\- DSS Tools\\2. Website Inventory Update (Shopify)\\2.1.3 Inventory DIFF - Shopify Vs Warehouse\\Inventory DIFF - Shopify Vs Warehouse.xlsx",
    when: [
      "When auditing discrepancies between Shopify listed inventory and warehouse stock.",
      "Before running a Shopify inventory update to validate source data."
    ],
    inputs: [
      "Shopify products/inventory export.",
      "Warehouse/ERPLY inventory export for the same date."
    ],
    steps: [
      "Open the workbook.",
      "Paste the Shopify inventory export into the Shopify tab.",
      "Paste the warehouse inventory export into the Warehouse tab.",
      "Review the DIFF tab for discrepancies.",
      "Investigate and resolve flagged items before updating Shopify."
    ],
    outputs: [
      "Side-by-side comparison of Shopify vs warehouse inventory.",
      "Flagged discrepancy list for investigation."
    ],
    issues: [
      { problem: "SKUs not matching between sources.", fix: "Check for formatting differences (extra spaces, dashes) in SKU codes between the two exports." },
      { problem: "Items missing from one side.", fix: "Confirm both exports are complete and cover the same product scope (no missing pages)." }
    ]
  },

  {
    id: "continue-or-deny-automation",
    deptId: "operations",
    version: "2.1.1",
    name: "Continue or Deny Automation",
    desc: "Automates decision-making for order fulfillment based on stock and validation rules.",
    tags: ["Shopify", "Inventory", "Automation", "Excel"],
    path: "P:\\- DSS Tools\\2. Website Inventory Update (Shopify)\\2.1.1 Continue or Deny Shopify Automation\\Shopify - Continue Or Deny MSTR File Automation.xlsm",
    when: [
      "When you need to update Shopify inventory policy decisions (Continue/Deny) at scale.",
      "When generating a master file to apply Continue/Deny changes to Shopify products."
    ],
    inputs: [
      "Shopify products export (CSV/Excel depending on workflow).",
      "Warehouse/ERPLY stock export (used in the logic)."
    ],
    steps: [
      "Open the workbook and enable macros.",
      "Import/refresh the Shopify export and stock sources.",
      "Review the Continue/Deny results — check exceptions first.",
      "Generate/export the master output file.",
      "Use the output in the next step of the Shopify workflow."
    ],
    outputs: [
      "Master Continue/Deny output file (ready for next workflow step).",
      "Exception/review tabs for manual validation."
    ],
    issues: [
      { problem: "Export columns don't match Shopify format.", fix: "Verify you used the correct Shopify export version and didn't remove required columns." },
      { problem: "Some products missing from output.", fix: "Check filters (samples/misc) and confirm SKU formats match between sources." }
    ]
  },

  {
    id: "continue-or-deny-manual",
    deptId: "operations",
    version: "2.1.2",
    name: "Continue or Deny Manual Tool",
    desc: "Manual validation tool to approve or reject Shopify orders based on stock comparison.",
    tags: ["Shopify", "Inventory", "Manual"],
    path: "P:\\- DSS Tools\\2. Website Inventory Update (Shopify)\\2.1.2 Continue or Deny Shopify Manually\\Shopify - Continue Or Deny Comparison.xlsx",
    when: [
      "When you want to manually validate Continue/Deny decisions.",
      "When troubleshooting or spot-checking automation results."
    ],
    inputs: [
      "Shopify export.",
      "Stock/inventory reference file used for comparison."
    ],
    steps: [
      "Open the comparison workbook.",
      "Paste the Shopify export and reference stock data into the expected tabs.",
      "Review the comparison results and make manual decisions.",
      "Copy/export the final decision list for execution."
    ],
    outputs: [
      "Manual Continue/Deny decision list."
    ],
    issues: [
      { problem: "Formulas show #N/A or blanks.", fix: "Confirm SKU codes match exactly and there are no extra spaces; verify the correct columns were pasted." }
    ]
  },

  {
    id: "dss-upload-cart",
    deptId: "operations",
    version: "2.2",
    name: "DSS Upload Cart Automation",
    desc: "Generates formatted files for uploading product carts into Shopify.",
    tags: ["Shopify", "Uploads", "Excel"],
    path: "P:\\- DSS Tools\\2. Website Inventory Update (Shopify)\\2.2 DSS Upload Cart Automation\\DSS Upload Cart Automation.xlsx",
    when: [
      "When you need to generate upload-ready cart data for DSS Shopify.",
      "When preparing bulk product changes that require a structured upload file."
    ],
    inputs: [
      "Source list of products/changes to be applied.",
      "Required Shopify template or export used by the tool."
    ],
    steps: [
      "Open the workbook.",
      "Paste or refresh the source input data.",
      "Validate quantities and required fields.",
      "Generate the upload file output.",
      "Use the output file to apply changes in Shopify."
    ],
    outputs: [
      "Upload-ready cart file/tab for Shopify."
    ],
    issues: [
      { problem: "Upload rejects rows in Shopify.", fix: "Confirm required columns and formats match Shopify's template. No empty required fields allowed." }
    ]
  },

  // =====================================================
  // PRODUCTION
  // =====================================================
  {
    id: "production-plan",
    deptId: "production",
    version: "15.2",
    name: "Production Plan System",
    desc: "Core production planning tool that manages batch creation, scheduling, and SKU allocation.",
    tags: ["Production", "Planning", "Excel", "VBA"],
    path: "P:\\- DSS Tools\\15. Back Ups\\Jan 1st PRODUCTION PLAN Final.xlsm",
    when: [
      "When creating or updating the production schedule for active batches.",
      "When allocating SKUs across production runs and scheduling manufacturing output."
    ],
    inputs: [
      "Current inventory levels (from replenishment or warehouse export).",
      "Sales forecast or demand data for the planning period.",
      "Recipe/batch size reference (from Recipe Mixing Tool)."
    ],
    steps: [
      "Open the workbook and enable macros.",
      "Update the inventory and demand inputs.",
      "Run the planning macro to generate the batch schedule.",
      "Review the production plan by SKU and batch.",
      "Adjust quantities and priorities as needed.",
      "Export or print the final plan for the production floor."
    ],
    outputs: [
      "Batch production schedule with SKU allocation.",
      "Printable/exportable plan for the production team."
    ],
    issues: [
      { problem: "Macro runs but output is blank.", fix: "Confirm all required input tabs are populated and not empty." },
      { problem: "SKU not appearing in the plan.", fix: "Check that the SKU exists in the reference data and is marked as active." }
    ]
  },

  {
    id: "recipe-mixing",
    deptId: "production",
    version: "6.2",
    name: "Recipe Mixing Tool",
    desc: "Calculates and generates mixing instructions using mL-based logic for production batches.",
    tags: ["Production", "Recipes", "Mixing", "Excel"],
    path: "P:\\- DSS Tools\\15. Back Ups\\Recipe Mixing printing Final - Base on ml V.10.xlsm",
    when: [
      "When creating mixing cards from the production mixing order.",
      "When printing or exporting recipe cards for the production floor."
    ],
    inputs: [
      "Mixing Order sheet/table (inside the workbook or linked file).",
      "Recipe database/SKU mapping (if used)."
    ],
    steps: [
      "Open the workbook and enable macros.",
      "Update the Mixing Order data with the current batch requirements.",
      "Run the macro to generate mixing cards (tabs).",
      "Review the mL quantities for each ingredient.",
      "Print or export the cards to PDF if required."
    ],
    outputs: [
      "Mixing card tabs generated per batching/grouping logic.",
      "Printable/exportable recipe cards for production."
    ],
    issues: [
      { problem: "Cards generate with wrong grouping.", fix: "Check grouping rules (product name, nicotine level) and verify the duplicates logic." },
      { problem: "PDF export not working.", fix: "Confirm the export macro version matches your OS (Mac/PC) and sheets are not protected." }
    ]
  },

  // =====================================================
  // ERP / SYSTEM INTEGRATION
  // =====================================================
  {
    id: "retail1-erply-import",
    deptId: "erp-integration",
    version: "10.1",
    name: "Retail1 → ERPLY Import Tool",
    desc: "Converts supplier purchase orders into ERPLY-compatible import format.",
    tags: ["ERPLY", "Import", "Excel", "VBA", "PO"],
    path: "P:\\- DSS Tools\\10. Vapeur Express Tools\\10.1 ERPLY PO Converter\\Retail1 → ERPLY Import Tool.xlsm",
    when: [
      "When converting Retail1 supplier POs into the ERPLY import format.",
      "When onboarding new purchase orders from Vapeur Express into ERPLY."
    ],
    inputs: [
      "Retail1 purchase order export (Excel/CSV).",
      "ERPLY supplier and product mapping reference (if used)."
    ],
    steps: [
      "Open the workbook and enable macros.",
      "Paste the Retail1 PO data into the expected input tab.",
      "Run the conversion macro.",
      "Review the ERPLY-formatted output tab for accuracy.",
      "Export the output file and import it into ERPLY."
    ],
    outputs: [
      "ERPLY-compatible purchase order import file."
    ],
    issues: [
      { problem: "Product codes not matching in ERPLY.", fix: "Verify the Retail1 SKU-to-ERPLY product code mapping is up to date." },
      { problem: "Import fails in ERPLY.", fix: "Check required ERPLY import fields and ensure no mandatory columns are blank." }
    ]
  },

  {
    id: "erply-matrix-export",
    deptId: "erp-integration",
    version: "14.1a",
    name: "ERPLY Matrix Export Tool",
    desc: "Exports matrix dimension values (e.g., nicotine levels) from ERPLY.",
    tags: ["ERPLY", "Python", "API", "Matrix"],
    path: "P:\\- DSS Tools\\14. API Imports\\14.1 ERPLY\\Python\\Erply_Export_Matrix_Values.py",
    when: [
      "When you need to pull current matrix dimension values from ERPLY.",
      "When auditing or backing up ERPLY matrix configurations."
    ],
    inputs: [
      "ERPLY API credentials (configured in the script or environment).",
      "Target matrix dimension IDs (if specified in the script)."
    ],
    steps: [
      "Open a terminal and navigate to the Python folder on the P: drive.",
      "Run: python Erply_Export_Matrix_Values.py",
      "Wait for the script to complete.",
      "Locate the exported file in the output folder."
    ],
    outputs: [
      "Matrix dimension values export file (Excel/CSV)."
    ],
    issues: [
      { problem: "API error on run.", fix: "Check ERPLY API credentials and confirm the account has matrix/product access." },
      { problem: "Output is empty.", fix: "Verify the target matrix dimensions exist in ERPLY and are accessible via the API." }
    ]
  },

  {
    id: "erply-matrix-import",
    deptId: "erp-integration",
    version: "14.1b",
    name: "ERPLY Matrix Import Tool",
    desc: "Imports matrix dimension values into ERPLY for SKU creation.",
    tags: ["ERPLY", "Python", "API", "Matrix", "Import"],
    path: "P:\\- DSS Tools\\14. API Imports\\14.1 ERPLY\\Python\\Erply_Import_MatrixDimensionValues.py",
    when: [
      "When creating new SKUs that require matrix dimension values in ERPLY.",
      "When bulk-adding nicotine levels or other matrix attributes to products."
    ],
    inputs: [
      "ERPLY API credentials.",
      "Prepared matrix dimension values file (Excel/CSV) — use the Export Tool to get the correct format."
    ],
    steps: [
      "Prepare the import file using the ERPLY Matrix Export Tool as a template.",
      "Open a terminal and navigate to the Python folder on the P: drive.",
      "Run: python Erply_Import_MatrixDimensionValues.py",
      "Monitor the output for success/error messages.",
      "Verify the imported values in ERPLY."
    ],
    outputs: [
      "Matrix dimension values created/updated in ERPLY.",
      "Console log with success and error counts."
    ],
    issues: [
      { problem: "Duplicate values error.", fix: "Check if the dimension values already exist in ERPLY before importing." },
      { problem: "Import partially fails.", fix: "Review the console error log and fix the affected rows in the import file, then re-run." }
    ]
  },

  {
    id: "erply-matrix-processing",
    deptId: "erp-integration",
    version: "14.1c",
    name: "ERPLY Matrix Processing Tool",
    desc: "Handles transformation and processing of matrix data structures for ERPLY.",
    tags: ["ERPLY", "Python", "API", "Matrix", "Transform"],
    path: "P:\\- DSS Tools\\14. API Imports\\14.1 ERPLY\\Python\\Erply_MatrixDimensionValues.py",
    when: [
      "When transforming raw matrix data before import into ERPLY.",
      "As part of the matrix data pipeline between Export, Processing, and Import steps."
    ],
    inputs: [
      "Raw matrix data file (from export or manual source).",
      "ERPLY API credentials (if the script also posts data)."
    ],
    steps: [
      "Ensure the input data file is in the expected location.",
      "Open a terminal and navigate to the Python folder on the P: drive.",
      "Run: python Erply_MatrixDimensionValues.py",
      "Review the processed output file.",
      "Use the output as input to the ERPLY Matrix Import Tool."
    ],
    outputs: [
      "Processed and transformed matrix data file ready for ERPLY import."
    ],
    issues: [
      { problem: "Script fails with a key error.", fix: "Verify the input file has the expected column names and structure." },
      { problem: "Output looks malformed.", fix: "Check the input data for duplicates, blank rows, or unexpected special characters." }
    ]
  },

  {
    id: "excel-to-json",
    deptId: "erp-integration",
    version: "14.2",
    name: "Excel to JSON Converter",
    desc: "Converts Excel datasets into JSON format for API integration workflows.",
    tags: ["Python", "JSON", "Excel", "API", "Convert"],
    path: "P:\\- DSS Tools\\14. API Imports\\14.1 ERPLY\\Python\\ExceltoJSON.py",
    when: [
      "When you need to convert an Excel file into JSON for an API integration.",
      "As part of any workflow that feeds Excel data into an API endpoint."
    ],
    inputs: [
      "Source Excel file (.xlsx or .xls) with structured tabular data.",
      "Configuration for sheet name and output file path (if required by the script)."
    ],
    steps: [
      "Place the source Excel file in the expected input folder.",
      "Open a terminal and navigate to the Python folder on the P: drive.",
      "Run: python ExceltoJSON.py",
      "Locate the output JSON file in the output folder.",
      "Use the JSON file as input to the target API workflow."
    ],
    outputs: [
      "JSON file converted from the source Excel dataset."
    ],
    issues: [
      { problem: "Script error on non-standard Excel formatting.", fix: "Ensure the Excel file has clean headers in row 1 and no merged cells." },
      { problem: "JSON output missing rows.", fix: "Check for blank rows or mixed data types in the source file." }
    ]
  },

  // =====================================================
  // DATA & AUTOMATION
  // =====================================================
  {
    id: "trello-cards-automation",
    deptId: "data-automation",
    version: "12.1",
    name: "Trello Cards Automation Script",
    desc: "Generates structured Trello cards from JSON files based on meeting outputs.",
    tags: ["Trello", "Python", "Automation", "Cards"],
    path: "P:\\- DSS Tools\\12. Trello\\12.1 Trello cards automation\\DSS_Import_Cards.py",
    when: [
      "After a meeting or planning session — to auto-create Trello cards from the output JSON.",
      "When bulk-creating structured tasks in a Trello board from a data file."
    ],
    inputs: [
      "Trello API credentials (configured in the script or environment).",
      "Input JSON file with card data (title, description, list, labels, due dates)."
    ],
    steps: [
      "Prepare the input JSON file with the card data in the expected format.",
      "Open a terminal and navigate to the Trello automation folder on the P: drive.",
      "Run: python DSS_Import_Cards.py",
      "Monitor the output for success messages.",
      "Verify the cards were created in the correct Trello board and lists."
    ],
    outputs: [
      "Trello cards created in the specified board and lists.",
      "Console log with created card count and any errors."
    ],
    issues: [
      { problem: "Authentication error.", fix: "Verify the Trello API key and token are correctly set in the script or environment variables." },
      { problem: "Cards created in wrong list.", fix: "Check the list name/ID in the JSON file matches exactly with the Trello board configuration." },
      { problem: "Some cards missing.", fix: "Review the input JSON for formatting issues — each card entry must be a complete object." }
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
    deptId: "sales",
    title: "Globe 11 Orders — Full Walkthrough",
    desc: "Step-by-step walkthrough of the Globe 11 Orders automation workbook: setup, data refresh, and order export.",
    tags: ["Orders", "Excel", "VBA"],
    videoId: "WqWoRFdUf8w",
    url: "https://www.youtube.com/watch?v=WqWoRFdUf8w"
  }
  // Add more tutorials here as you upload them to YouTube.
  // Example:
  // {
  //   id: "tut-rosie-reconciliation",
  //   toolId: "rosie-all-in-one",
  //   deptId: "accounting",
  //   title: "Rosie All In One — Reconciliation Walkthrough",
  //   desc: "How to run the full Rosie reconciliation workflow.",
  //   tags: ["Reconciliation", "Accounting"],
  //   videoId: "YOUR_VIDEO_ID_HERE",
  //   url: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID_HERE"
  // },
];

// ---- PROCESS GUIDES / SOPs ----
// Add new SOPs here. Fields: id, deptId, title, desc, steps[], lastUpdated
const docs = [
  {
    id: "shopify-inventory-sop",
    deptId: "operations",
    title: "Shopify Inventory Update — Full Workflow",
    desc: "End-to-end SOP for running the Continue/Deny update and uploading changes to Shopify.",
    steps: [
      "Export all products from Shopify (Products → Export → All products).",
      "Run the Inventory Diff Tool (2.1.3) to verify Shopify vs warehouse alignment.",
      "Run the Continue or Deny Automation tool (2.1.1) with the Shopify export.",
      "Review the exception tabs and handle any flagged items manually using the Manual Tool (2.1.2).",
      "Export the master output file from the automation tool.",
      "Use the DSS Upload Cart Automation (2.2) to push the changes to Shopify.",
      "Verify the update applied correctly in the Shopify admin."
    ],
    lastUpdated: "2025-01-01"
  },
  {
    id: "replenishment-sop",
    deptId: "operations",
    title: "Weekly Stock Replenishment Process",
    desc: "Step-by-step guide for running the weekly replenishment planning workflow.",
    steps: [
      "Pull the warehouse inventory export from ERPLY.",
      "Pull sales data for the required window (last 60 or 120 days).",
      "Open the Stock Replenishment Tool workbook.",
      "Refresh all data sources.",
      "Review and adjust replenishment quantities as needed.",
      "Export the replenishment plan for the purchasing team.",
      "Feed the replenishment plan into the Production Plan System for scheduling."
    ],
    lastUpdated: "2025-01-01"
  },
  {
    id: "rosie-reconciliation-sop",
    deptId: "accounting",
    title: "Rosie Monthly Reconciliation — SOP",
    desc: "Step-by-step process for running the full Rosie reconciliation using ERPLY, Shopify, and EMT data.",
    steps: [
      "Run Rosie_Erply_sales_master_extract.py to pull the latest ERPLY sales data.",
      "Run Rosie_Shopify_Payment_Transactions.py to pull the Shopify payment data.",
      "Collect the EMT payment file for the same period.",
      "Open All_In_One.xlsm and enable macros.",
      "Load all three data sources into their respective tabs.",
      "Run the consolidation macro.",
      "Review the exception tab and investigate all flagged discrepancies.",
      "Export the final reconciliation report for accounting review."
    ],
    lastUpdated: "2025-01-01"
  }
];
