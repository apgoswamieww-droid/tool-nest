/**
 * ═══════════════════════════════════════════════════
 * TOOL METADATA REGISTRY
 *
 * Centralized FAQ items and SEO-specific metadata for each tool.
 * Used by server wrappers to generate JSON-LD and structured data.
 * ═══════════════════════════════════════════════════
 */

export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolMetadata {
  faq: ToolFaq[];
}

export const TOOL_METADATA: Record<string, ToolMetadata> = {
  // ── Text Tools ──────────────────────────────────
  "text-repeater": {
    faq: [
      { question: "What is the Text Repeater tool?", answer: "The Text Repeater tool lets you duplicate any text, phrase, or string a specified number of times. It's useful for testing, generating repeated patterns, filling templates, or creating placeholder content." },
      { question: "What's the maximum number of repeats?", answer: "You can repeat text up to 10,000 times. The input text can be up to 10,000 characters long. The tool processes everything in your browser — no data is sent to any server." },
      { question: "Can I add separators between repeats?", answer: "Yes! You can choose a custom separator (like a comma, pipe, or dash) or use line breaks to place each repetition on a new line." },
      { question: "Is my data kept private?", answer: "Absolutely. All processing happens entirely in your browser. Your text is never sent to any server or stored anywhere." },
    ],
  },
  "case-converter": {
    faq: [
      { question: "What cases are supported?", answer: "The Case Converter supports UPPERCASE, lowercase, Title Case, Sentence case, and alternating cAsE." },
      { question: "Does it handle special characters?", answer: "Yes. Numbers, punctuation, and special characters are preserved. Only letter casing is changed." },
      { question: "Is there a character limit?", answer: "You can convert up to 50,000 characters at once. All processing happens in your browser." },
    ],
  },
  "text-reverser": {
    faq: [
      { question: "What does Text Reverser do?", answer: "It reverses any text character by character. 'Hello' becomes 'olleH'. Useful for testing, puzzles, and fun." },
      { question: "Does it handle multi-byte characters?", answer: "Yes. Unicode characters, emojis, and multi-byte sequences are handled correctly." },
    ],
  },
  "word-counter": {
    faq: [
      { question: "What does Word Counter count?", answer: "It counts words, characters (with and without spaces), sentences, paragraphs, and estimated reading time." },
      { question: "How is reading time calculated?", answer: "Based on an average reading speed of 200 words per minute." },
    ],
  },
  "lorem-ipsum-generator": {
    faq: [
      { question: "What is Lorem Ipsum?", answer: "Lorem Ipsum is placeholder text used in the printing and typesetting industry since the 1500s." },
      { question: "How many paragraphs can I generate?", answer: "You can generate 1 to 50 paragraphs with 1 to 10 sentences each." },
    ],
  },
  "remove-emojis": {
    faq: [
      { question: "What does Remove Emojis do?", answer: "It strips emojis, special Unicode symbols, and non-ASCII characters from text. Useful for cleaning pasted content." },
      { question: "Can I keep some emojis?", answer: "Yes. You can choose to remove only emojis, all non-ASCII, or use custom patterns to selectively remove characters." },
      { question: "Is my data private?", answer: "Yes. All processing happens in your browser. Text is never uploaded to any server." },
    ],
  },

  // ── Developer Tools ─────────────────────────────
  "json-formatter": {
    faq: [
      { question: "What does JSON Formatter do?", answer: "It beautifies (indents), minifies, and validates JSON data with syntax error detection." },
      { question: "Is my JSON data sent to a server?", answer: "No. All formatting and validation happens client-side in your browser." },
    ],
  },
  "hash-generator": {
    faq: [
      { question: "What hash algorithms are supported?", answer: "MD5, SHA-1, SHA-256, SHA-512, and SHA-384." },
      { question: "Can I hash files?", answer: "Currently the tool supports text input. File hashing may be added in a future update." },
    ],
  },
  "base64-encoder": {
    faq: [
      { question: "What is Base64 encoding?", answer: "Base64 encodes binary data as ASCII text. It's commonly used for embedding data in URLs, emails, and JSON." },
      { question: "Is Base64 encryption?", answer: "No. Base64 is an encoding, not encryption. It's easily reversible and provides no security." },
    ],
  },
  "yaml-formatter": {
    faq: [
      { question: "What does YAML Formatter do?", answer: "It formats, beautifies, and validates YAML documents. Detects syntax errors and provides line-by-line error reporting." },
      { question: "What YAML features are supported?", answer: "Standard YAML 1.2 including sequences, mappings, scalars, anchors, aliases, multi-line strings, and comments." },
    ],
  },
  "html-decoder": {
    faq: [
      { question: "What does HTML Decoder do?", answer: "It decodes HTML entities (named like &amp;, decimal like &#60;, and hex like &#x3C;) back to plain text." },
      { question: "Does it handle URL encoding?", answer: "Yes. It can also decode URL-encoded strings (%20 → space, etc.)." },
    ],
  },
  "robots-txt-generator": {
    faq: [
      { question: "What is robots.txt?", answer: "robots.txt is a file at your website's root that tells search engine crawlers which pages to access and which to skip." },
      { question: "How do I use the generated file?", answer: "Copy the output and place it at your domain's root (e.g., example.com/robots.txt). Most CMS platforms also have a dedicated area for it." },
      { question: "Does this affect SEO?", answer: "Yes. A well-configured robots.txt helps search engines crawl your site efficiently and can prevent indexing of private or duplicate content." },
    ],
  },
  "extract-urls": {
    faq: [
      { question: "What does Extract URLs do?", answer: "It scans any text and extracts all URLs (http, https, ftp) with statistics and export options." },
      { question: "What export formats are available?", answer: "Plain text (one per line), JSON, CSV, and Markdown links." },
    ],
  },
  "sql-validator": {
    faq: [
      { question: "What does SQL Validator check?", answer: "It validates SQL syntax, detects common errors (unclosed quotes, missing keywords, bad parentheses), and formats queries." },
      { question: "Which SQL dialects are supported?", answer: "Standard SQL common to MySQL, PostgreSQL, SQL Server, and SQLite. It focuses on universal syntax patterns." },
      { question: "Does it execute queries?", answer: "No. It only validates and formats syntax. No database connection is needed." },
    ],
  },

  // ── Financial Calculators ───────────────────────
  "emi-calculator": {
    faq: [
      { question: "What is EMI?", answer: "EMI (Equated Monthly Installment) is the fixed monthly payment you make to repay a loan over a specified period." },
      { question: "What formula is used?", answer: "EMI = P × r × (1+r)^n / ((1+r)^n - 1), where P is principal, r is monthly interest rate, and n is number of months." },
    ],
  },
  "compound-interest": {
    faq: [
      { question: "What is compound interest?", answer: "Compound interest is interest calculated on both the initial principal and accumulated interest from previous periods." },
      { question: "What compounding frequencies are supported?", answer: "Annually, semi-annually, quarterly, monthly, and daily." },
    ],
  },
  "sip-calculator": {
    faq: [
      { question: "What is a SIP?", answer: "A Systematic Investment Plan (SIP) lets you invest a fixed amount regularly in mutual funds." },
      { question: "How are returns calculated?", answer: "Using the future value of annuity formula: FV = P × ((1+r)^n - 1) / r, where P is monthly investment, r is monthly rate, n is months." },
    ],
  },
  "fire-calculator": {
    faq: [
      { question: "What is FIRE?", answer: "FIRE stands for Financial Independence, Retire Early. It's a movement where people save aggressively to achieve financial freedom much earlier than traditional retirement." },
      { question: "What is the 4% rule?", answer: "The 4% rule suggests you can safely withdraw 4% of your portfolio annually in retirement. Your FIRE number is 25 times your annual expenses." },
      { question: "What is Coast FIRE?", answer: "Coast FIRE is when your current savings, if left to grow with compound interest until traditional retirement age, will be enough for retirement." },
      { question: "What is Barista FIRE?", answer: "Barista FIRE means having enough savings to cover part of expenses through investment income, while working part-time for the rest and benefits." },
      { question: "How much do I need to save?", answer: "It depends on your expenses and savings rate. Higher rates (50%+) dramatically reduce years needed. The calculator shows your exact timeline." },
    ],
  },
  "roas-calculator": {
    faq: [
      { question: "What is ROAS?", answer: "ROAS (Return on Ad Spend) measures how much revenue you earn for every dollar spent on advertising. ROAS = Revenue / Ad Spend." },
      { question: "What is a good ROAS?", answer: "A ROAS of 4:1 ($4 revenue per $1 spent) is generally considered good, but it varies by industry and profit margins." },
      { question: "What is breakeven ROAS?", answer: "Breakeven ROAS is the minimum return needed to cover your ad costs. It equals 1 / profit margin. Below this, you're losing money." },
    ],
  },
  "working-capital-calculator": {
    faq: [
      { question: "What is working capital?", answer: "Working capital = Current Assets - Current Liabilities. It measures a company's short-term financial health and operational efficiency." },
      { question: "What do the ratios mean?", answer: "Current Ratio (assets/liabilities) and Quick Ratio ((assets-inventory)/liabilities) measure liquidity. Above 1.0 is generally healthy." },
    ],
  },
  "clv-calculator": {
    faq: [
      { question: "What is Customer Lifetime Value?", answer: "CLV is the total revenue a business can expect from a single customer throughout their entire relationship." },
      { question: "What is the CLV:CAC ratio?", answer: "It compares customer lifetime value to acquisition cost. A ratio of 3:1 or higher is considered healthy for most businesses." },
    ],
  },
  "forex-margin-calculator": {
    faq: [
      { question: "What is margin in forex?", answer: "Margin is the collateral required to open and maintain a leveraged position. It's a percentage of the total trade value." },
      { question: "What is a pip?", answer: "A pip is the smallest price move in a currency pair. For most pairs it's 0.0001 (1/10,000). For JPY pairs it's 0.01." },
    ],
  },
  "apr-calculator": {
    faq: [
      { question: "What is APR?", answer: "APR (Annual Percentage Rate) is the yearly interest rate including fees, giving the true cost of borrowing." },
      { question: "How is APR different from interest rate?", answer: "APR includes fees and compounding, while interest rate is just the base rate. APR is always higher than the stated interest rate." },
      { question: "What is an amortization schedule?", answer: "It's a table showing each payment's split between principal and interest over the loan term." },
    ],
  },

  // ── Student Tools ───────────────────────────────
  "gpa-calculator": {
    faq: [
      { question: "How do I calculate GPA?", answer: "Enter your grades and credit hours. GPA = sum(grade_points × credits) / sum(credits)." },
      { question: "What grading scales are supported?", answer: "4.0 scale (A=4, B=3, etc.), 10-point CGPA, and percentage-based systems." },
    ],
  },
  "attendance-calculator": {
    faq: [
      { question: "How do I calculate attendance?", answer: "Enter total classes held and classes attended. The calculator shows percentage, eligibility status, and how many more classes you need." },
      { question: "What attendance is typically required?", answer: "Most institutions require 75% minimum. Use the calculator to see exactly how many classes you can still miss." },
    ],
  },
  "marks-percentage-calculator": {
    faq: [
      { question: "How do I calculate percentage from marks?", answer: "Percentage = (Obtained Marks / Total Marks) × 100. Enter your marks and total to get instant results." },
      { question: "Does it show GPA too?", answer: "Yes. It converts your percentage to GPA on common scales and shows the corresponding letter grade." },
    ],
  },
  "cgpa-converter": {
    faq: [
      { question: "How do I convert CGPA to percentage?", answer: "Standard formula: Percentage = CGPA × 9.5 (for 10-point scale). Other scales like 4-point and 7-point are also supported." },
      { question: "Can I convert percentage to CGPA?", answer: "Yes. The converter works bidirectionally between CGPA and percentage." },
    ],
  },
  "study-timer": {
    faq: [
      { question: "What is the Pomodoro Technique?", answer: "Work for 25 minutes, then take a 5-minute break. After 4 cycles, take a longer 15-30 minute break." },
      { question: "Can I customize the durations?", answer: "Yes. You can set custom focus and break durations to match your workflow." },
    ],
  },

  // ── Fun Tools ───────────────────────────────────
  "wheel-spinner": {
    faq: [
      { question: "How does the Wheel Spinner work?", answer: "Enter names or choices, spin the wheel, and it randomly selects a winner with smooth CSS animations." },
      { question: "Is the selection truly random?", answer: "Yes. It uses the browser's cryptographic random number generator for fair, unbiased selection." },
    ],
  },
  "random-name-picker": {
    faq: [
      { question: "How do I pick a random name?", answer: "Enter names one per line, then click Pick. The tool randomly selects one name from your list." },
      { question: "Can I use this for classroom activities?", answer: "Absolutely. It's fair, transparent, and engaging for students. Great for group assignments and activities." },
    ],
  },

  // ── QR & Barcode Tools ──────────────────────────
  "barcode-generator": {
    faq: [
      { question: "What barcode format is used?", answer: "Code128 — an industry-standard barcode format that encodes any ASCII character. Widely used for shipping, inventory, and product labeling." },
      { question: "Is the generated barcode scannable?", answer: "Yes. The barcodes are industry-standard and can be scanned by any barcode scanner or smartphone app." },
      { question: "Can I download the barcode?", answer: "Yes. Click Download SVG to save a scalable vector file that remains sharp at any print size." },
    ],
  },

  // ── PDF Tools ───────────────────────────────────
  "pdf-info-viewer": {
    faq: [
      { question: "What PDF information can I view?", answer: "Metadata including title, author, creation date, page count, file size, and PDF version — all without uploading the file." },
      { question: "Is my PDF uploaded?", answer: "No. The PDF is read entirely in your browser using the File API. Nothing leaves your device." },
    ],
  },
  "pdf-text-extractor": {
    faq: [
      { question: "How does text extraction work?", answer: "The tool reads the PDF's text stream directly in your browser and displays all extractable text content." },
      { question: "Does it work with scanned PDFs?", answer: "Scanned PDFs contain images, not text. This tool extracts text from PDFs that have selectable text layers." },
    ],
  },
  "pdf-merger": {
    faq: [
      { question: "How many PDFs can I merge?", answer: "You can merge up to 20 PDF files at once. The combined file downloads as a single PDF." },
      { question: "Can I reorder pages before merging?", answer: "Yes. Drag and drop to reorder files before merging." },
    ],
  },
  "text-to-pdf": {
    faq: [
      { question: "Can I style the PDF?", answer: "Yes. Choose font family, size, margins, and page orientation. The text is formatted into a clean, printable PDF." },
    ],
  },
  "csv-to-pdf": {
    faq: [
      { question: "What CSV formats are supported?", answer: "Standard CSV, TSV (tab-separated), and any delimiter-separated values file." },
      { question: "Is my data uploaded?", answer: "No. The CSV is read and converted entirely in your browser using Web Workers. Nothing leaves your device." },
      { question: "Can I customize the PDF layout?", answer: "Yes. Choose font family, page size, orientation, margins, and an optional title." },
    ],
  },
  "pdf-metadata-remover": {
    faq: [
      { question: "What metadata is removed?", answer: "Title, author, creator, producer, creation date, modification date, and all other metadata fields." },
      { question: "Why remove PDF metadata?", answer: "PDF metadata can contain sensitive information like author names, organization details, and software versions. Removing it protects your privacy." },
    ],
  },
  "pdf-bookmark-remover": {
    faq: [
      { question: "What are PDF bookmarks?", answer: "Bookmarks (also called outlines) are navigation links in the PDF sidebar. They're removed to clean up the document structure." },
    ],
  },
  "pdf-margin-remover": {
    faq: [
      { question: "How does margin removal work?", answer: "You set custom crop areas (top, bottom, left, right) in points. The tool creates a new PDF with those margins applied." },
      { question: "What are points?", answer: "PDF points: 1 point = 1/72 inch. A4 page is 595 × 842 points. Standard margins are 72 points (1 inch)." },
    ],
  },
  "pdf-page-reverser": {
    faq: [
      { question: "Can I reverse specific pages?", answer: "You can reverse the entire document or specify a custom page range to reverse." },
    ],
  },
  "pdf-qr-code": {
    faq: [
      { question: "What can I encode in the QR code?", answer: "URLs, text, contact info, Wi-Fi credentials — any text data. The QR code is overlaid on your PDF pages." },
      { question: "Where can I position the QR code?", answer: "Choose from 5 preset positions: top-left, top-right, center, bottom-left, bottom-right. Or set custom coordinates." },
    ],
  },

  // ── Construction Calculators ────────────────────
  "area-calculator": {
    faq: [
      { question: "What shapes are supported?", answer: "Rectangle, triangle, circle, trapezoid, and parallelogram." },
    ],
  },
  "brick-calculator": {
    faq: [
      { question: "How do I calculate bricks for a wall?", answer: "Enter wall dimensions (length, height, thickness) and brick size. The calculator accounts for mortar joints and adds a wastage factor." },
      { question: "What is the default wastage factor?", answer: "5% — standard for breakage during construction. You can adjust this percentage." },
    ],
  },
  "paint-cost-calculator": {
    faq: [
      { question: "How much paint do I need?", answer: "Enter room dimensions, doors/windows, coats, and price per gallon. The calculator deducts openings and gives exact gallons and total cost." },
      { question: "What coverage rate is used?", answer: "350 sq ft per gallon (one coat) — industry standard for interior latex paint." },
    ],
  },
  "concrete-calculator": {
    faq: [
      { question: "How is concrete volume calculated?", answer: "Volume = Length × Width × Depth. Results are in cubic feet and cubic meters, with bag count estimates." },
      { question: "What bag sizes are supported?", answer: "40 lb, 60 lb, and 80 lb bags — the most common pre-mix concrete sizes." },
    ],
  },
  "flooring-calculator": {
    faq: [
      { question: "What flooring types are supported?", answer: "Tiles, hardwood planks, laminate, vinyl, and carpet. Enter room dimensions and material size for accurate estimates." },
      { question: "Is wastage included?", answer: "Yes. Default 10% wastage accounts for cuts, breakage, and pattern matching." },
    ],
  },

  // ── Energy Calculators ──────────────────────────
  "electricity-bill": {
    faq: [
      { question: "How do I estimate my electricity bill?", answer: "Add appliances with wattage and daily usage, enter your rate per kWh. The calculator shows daily, monthly, and yearly costs." },
      { question: "What appliances are in the preset list?", answer: "Common household appliances: fridge, AC, TV, lights, fans, washing machine, computer, and more." },
    ],
  },
  "battery-backup-calculator": {
    faq: [
      { question: "How long will my UPS battery last?", answer: "Enter battery specs (voltage, Ah, type) and appliances. The calculator estimates runtime based on total load and battery capacity." },
      { question: "What battery types are supported?", answer: "Lead-acid, lithium-ion, and gel batteries. Each has different efficiency factors applied in the calculation." },
    ],
  },

  // ── Travel & Shipping Tools ─────────────────────
  "currency-converter": {
    faq: [
      { question: "Does it use live rates?", answer: "The converter uses fixed exchange rates for offline use. For live rates, check with your financial institution." },
    ],
  },
  "time-zone-converter": {
    faq: [
      { question: "How do I convert time zones?", answer: "Select source and target time zones, enter the time, and see the equivalent time instantly." },
    ],
  },

  // ── Personal Calculators ────────────────────────
  "bmi-calculator": {
    faq: [
      { question: "How is BMI calculated?", answer: "BMI = weight (kg) / height² (m²). The calculator shows your BMI and health category (underweight, normal, overweight, obese)." },
      { question: "Is BMI accurate?", answer: "BMI is a screening tool, not a diagnostic. It doesn't account for muscle mass, bone density, or body composition. Consult a healthcare provider for comprehensive assessment." },
    ],
  },

  // ── Agriculture Tools ───────────────────────────
  "crop-yield-calculator": {
    faq: [
      { question: "How do I calculate crop yield?", answer: "Enter field area, expected plants per area, and average yield per plant. The calculator estimates total production in kg or tonnes." },
    ],
  },
  "irrigation-calculator": {
    faq: [
      { question: "How much water do my crops need?", answer: "Enter crop type, field area, and growth stage. The calculator estimates daily and weekly water requirements in liters and cubic meters." },
    ],
  },
};

/** Get FAQ items for a tool slug */
export function getToolFaq(slug: string): ToolFaq[] {
  return TOOL_METADATA[slug]?.faq || [];
}
