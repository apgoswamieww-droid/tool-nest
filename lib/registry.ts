import { Tool, CategorySlug } from "@/types";
import {
  Repeat, CaseSensitive, Shuffle, Hash, TextCursorInput, Binary,
  KeyRound, QrCode, Palette, Lock, Percent, Calculator, DollarSign,
  GraduationCap, Calendar, Timer, Dice6, Sparkles, Ruler, Zap,
  Plane, Car, Wheat, Droplets, Thermometer, Bot, FileCode, SmilePlus,
  Code2, Link2, Flame, BatteryCharging, Target, Database, Building2,
  Users, TrendingUp, Barcode, BrickWall, PaintBucket, Receipt, Lightbulb,
  FileSearch, FileOutput, Merge, Type, Award, RefreshCw, Clock,
  SquareStack, Grid3x3, MoveHorizontal,
  // Phase 4 PDF icons
  Eraser, BookmarkMinus, Scissors, ArrowDownUp,
} from "lucide-react";

export const TOOL_REGISTRY: Tool[] = [
  // ── Text Tools ──────────────────────────────────
  { slug: "text-repeater", name: "Text Repeater", description: "Repeat any text or string multiple times instantly.", icon: Repeat, category: "text-tools", tags: ["text", "repeat", "string", "duplicate"], featured: true },
  { slug: "case-converter", name: "Case Converter", description: "Convert text between upper, lower, title, and sentence case.", icon: CaseSensitive, category: "text-tools", tags: ["text", "case", "upper", "lower", "title"] },
  { slug: "text-reverser", name: "Text Reverser", description: "Reverse any text or string character by character.", icon: Shuffle, category: "text-tools", tags: ["text", "reverse", "flip"] },
  { slug: "word-counter", name: "Word Counter", description: "Count words, characters, sentences, and paragraphs.", icon: Hash, category: "text-tools", tags: ["word", "count", "character", "text"], featured: true },
  { slug: "lorem-ipsum-generator", name: "Lorem Ipsum Generator", description: "Generate placeholder text for design and development.", icon: TextCursorInput, category: "text-tools", tags: ["lorem", "ipsum", "placeholder", "generator"] },
  { slug: "remove-emojis", name: "Remove Emojis", description: "Strip emojis, special characters, and symbols from text.", icon: SmilePlus, category: "text-tools", tags: ["emoji", "remove", "strip", "clean", "text", "unicode"], featured: true },

  // ── Developer Tools ─────────────────────────────
  { slug: "json-formatter", name: "JSON Formatter", description: "Beautify, minify, and validate JSON data.", icon: Binary, category: "developer-tools", tags: ["json", "format", "beautify", "validate"], featured: true },
  { slug: "hash-generator", name: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256 hashes from any text.", icon: KeyRound, category: "developer-tools", tags: ["hash", "md5", "sha", "encrypt"] },
  { slug: "base64-encoder", name: "Base64 Encoder/Decoder", description: "Encode and decode Base64 strings.", icon: Lock, category: "developer-tools", tags: ["base64", "encode", "decode"] },
  { slug: "yaml-formatter", name: "YAML Formatter", description: "Format, beautify, and validate YAML documents.", icon: FileCode, category: "developer-tools", tags: ["yaml", "format", "beautify", "validate", "config"], featured: true },
  { slug: "html-decoder", name: "HTML Decoder", description: "Decode HTML entities and special characters back to plain text.", icon: Code2, category: "developer-tools", tags: ["html", "decode", "entity", "special-characters", "unescape"], featured: true },
  { slug: "robots-txt-generator", name: "Robots.txt Generator", description: "Generate a robots.txt file for your website with a visual editor.", icon: Bot, category: "developer-tools", tags: ["robots", "seo", "crawler", "sitemap", "generator"], featured: true },
  { slug: "extract-urls", name: "Extract URLs", description: "Extract all URLs from any text and categorize them.", icon: Link2, category: "developer-tools", tags: ["url", "extract", "link", "scrape", "parse"], featured: true },
  { slug: "sql-validator", name: "SQL Validator", description: "Validate SQL syntax, check for errors, and format queries.", icon: Database, category: "developer-tools", tags: ["sql", "validate", "syntax", "query", "database", "format"], featured: true },

  // ── Financial Calculators ───────────────────────
  { slug: "emi-calculator", name: "EMI Calculator", description: "Calculate monthly EMI for loans with breakdown.", icon: Calculator, category: "financial-calculators", tags: ["emi", "loan", "calculator", "finance"], featured: true },
  { slug: "compound-interest", name: "Compound Interest Calculator", description: "Calculate compound interest with yearly breakdown.", icon: Percent, category: "financial-calculators", tags: ["interest", "compound", "finance", "investment"] },
  { slug: "sip-calculator", name: "SIP Calculator", description: "Calculate returns on Systematic Investment Plans.", icon: DollarSign, category: "financial-calculators", tags: ["sip", "investment", "mutual-fund"] },
  { slug: "fire-calculator", name: "FIRE Calculator", description: "Calculate when you can achieve Financial Independence and Retire Early.", icon: Flame, category: "financial-calculators", tags: ["fire", "financial-independence", "retire-early", "savings"], featured: true },
  { slug: "roas-calculator", name: "ROAS Calculator", description: "Calculate Return on Ad Spend and marketing campaign ROI.", icon: Target, category: "financial-calculators", tags: ["roas", "marketing", "advertising", "roi", "campaign", "ads"], featured: true },
  { slug: "working-capital-calculator", name: "Working Capital Calculator", description: "Calculate net working capital and liquidity ratios.", icon: Building2, category: "financial-calculators", tags: ["working-capital", "business", "finance", "liquidity", "ratio"], featured: true },
  { slug: "clv-calculator", name: "Customer Lifetime Value Calculator", description: "Calculate CLV and assess customer acquisition profitability.", icon: Users, category: "financial-calculators", tags: ["clv", "customer-lifetime-value", "marketing", "retention", "cac"], featured: true },
  { slug: "forex-margin-calculator", name: "Forex Margin Calculator", description: "Calculate margin requirements, pip values, and P&L for forex trades.", icon: TrendingUp, category: "financial-calculators", tags: ["forex", "margin", "pip", "trading", "leverage", "currency"], featured: true },
  { slug: "apr-calculator", name: "APR Calculator", description: "Calculate Annual Percentage Rate including fees and generate amortization.", icon: Receipt, category: "financial-calculators", tags: ["apr", "loan", "interest", "amortization", "borrowing", "fees"], featured: true },

  // ── Student Tools ───────────────────────────────
  { slug: "gpa-calculator", name: "GPA Calculator", description: "Calculate your GPA from grades across semesters.", icon: GraduationCap, category: "student-tools", tags: ["gpa", "grade", "student", "calculator"], featured: true },
  { slug: "attendance-calculator", name: "Attendance Calculator", description: "Calculate attendance percentage and required classes.", icon: Calendar, category: "student-tools", tags: ["attendance", "percentage", "student", "calculator"], featured: true },
  { slug: "marks-percentage-calculator", name: "Marks Percentage Calculator", description: "Convert marks to percentage with grade and GPA conversion.", icon: Award, category: "student-tools", tags: ["marks", "percentage", "grade", "student", "exam", "result"], featured: true },
  { slug: "cgpa-converter", name: "CGPA to Percentage Converter", description: "Convert CGPA to percentage and vice versa for multiple scales.", icon: RefreshCw, category: "student-tools", tags: ["cgpa", "percentage", "converter", "gpa", "student", "grade"], featured: true },
  { slug: "study-timer", name: "Study Timer (Pomodoro)", description: "Productivity timer with 25-minute focus sessions and breaks.", icon: Clock, category: "student-tools", tags: ["timer", "pomodoro", "study", "productivity", "focus", "student"], featured: true },

  // ── Fun Tools ───────────────────────────────────
  { slug: "wheel-spinner", name: "Wheel Spinner", description: "Spin a wheel to pick a random winner or choice.", icon: Dice6, category: "fun-tools", tags: ["wheel", "spinner", "random", "picker", "contest"], featured: true },
  { slug: "random-name-picker", name: "Random Name Picker", description: "Pick a random name from a list.", icon: Sparkles, category: "fun-tools", tags: ["random", "name", "picker"] },

  // ── QR & Barcode Tools ──────────────────────────
  { slug: "barcode-generator", name: "Code128 Barcode Generator", description: "Generate Code128 barcodes with customizable size and download as SVG.", icon: Barcode, category: "qr-barcode-tools", tags: ["barcode", "code128", "generate", "svg", "product", "label"], featured: true },

  // ── PDF Tools ───────────────────────────────────
  { slug: "pdf-info-viewer", name: "PDF Info Viewer", description: "View PDF metadata, page count, author, and file details instantly.", icon: FileSearch, category: "pdf-tools", tags: ["pdf", "metadata", "info", "page-count", "viewer", "document"], featured: true },
  { slug: "pdf-text-extractor", name: "PDF Text Extractor", description: "Extract text content from PDF files for editing and analysis.", icon: FileOutput, category: "pdf-tools", tags: ["pdf", "text", "extract", "content", "document", "copy"], featured: true },
  { slug: "pdf-merger", name: "PDF Merger", description: "Combine multiple PDF files into a single document.", icon: Merge, category: "pdf-tools", tags: ["pdf", "merge", "combine", "join", "document"], featured: true },
  { slug: "text-to-pdf", name: "Text to PDF Converter", description: "Convert text content into a downloadable PDF document.", icon: FileOutput, category: "pdf-tools", tags: ["text", "pdf", "convert", "download", "document", "create"], featured: true },
  { slug: "csv-to-pdf", name: "CSV to PDF", description: "Convert CSV and spreadsheet data into formatted PDF documents.", longDescription: "Upload a CSV file and convert it to a clean, formatted PDF document. Choose font, page size, orientation, and margins.", icon: FileOutput, category: "pdf-tools", tags: ["csv", "pdf", "convert", "spreadsheet", "data", "document"], relatedCategories: ["text-tools"], featured: true },
  { slug: "pdf-metadata-remover", name: "PDF Metadata Remover", description: "Strip all metadata from PDF files for privacy and security.", longDescription: "Remove title, author, creator, producer, creation date, and all other metadata from PDF files.", icon: Eraser, category: "pdf-tools", tags: ["pdf", "metadata", "remove", "privacy", "security", "clean", "strip"], featured: true },
  { slug: "pdf-bookmark-remover", name: "Remove PDF Bookmarks", description: "Remove all bookmarks and outline tree from PDF documents.", icon: BookmarkMinus, category: "pdf-tools", tags: ["pdf", "bookmarks", "outline", "remove", "navigation"] },
  { slug: "pdf-margin-remover", name: "Remove PDF Margins", description: "Crop or trim margins from PDF pages to save printing space.", longDescription: "Reduce the margins on PDF pages by setting custom crop areas. Useful for fitting more content on a page.", icon: Scissors, category: "pdf-tools", tags: ["pdf", "margins", "crop", "trim", "resize", "layout"] },
  { slug: "pdf-page-reverser", name: "Reverse PDF Pages", description: "Reverse the page order of a PDF or create custom page sequences.", longDescription: "Flip the page order of a PDF document or create custom page ordering for complex reorganization.", icon: ArrowDownUp, category: "pdf-tools", tags: ["pdf", "reverse", "reorder", "pages", "flip", "sequence"] },
  { slug: "pdf-qr-code", name: "Add QR Code to PDF", description: "Overlay QR codes on PDF pages for branding, links, or tracking.", longDescription: "Embed QR codes onto your PDF pages at any position. Useful for adding website links, contact information, or tracking codes.", icon: QrCode, category: "pdf-tools", tags: ["pdf", "qr", "code", "overlay", "branding", "link", "tracking"], relatedCategories: ["qr-barcode-tools"] },

  // ── Construction Calculators ────────────────────
  { slug: "area-calculator", name: "Area Calculator", description: "Calculate area of rectangles, triangles, circles, and more.", icon: Ruler, category: "construction-calculators", tags: ["area", "rectangle", "triangle", "circle"] },
  { slug: "brick-calculator", name: "Brick Calculator", description: "Calculate bricks and mortar needed for walls with wastage.", icon: BrickWall, category: "construction-calculators", tags: ["brick", "wall", "mortar", "construction", "material"], featured: true },
  { slug: "paint-cost-calculator", name: "Paint Cost Calculator", description: "Estimate paint required, coverage, and total project cost.", icon: PaintBucket, category: "construction-calculators", tags: ["paint", "cost", "wall", "room", "coverage", "home"], featured: true },
  { slug: "concrete-calculator", name: "Concrete Calculator", description: "Calculate concrete volume, bags needed, and cost.", icon: SquareStack, category: "construction-calculators", tags: ["concrete", "volume", "slab", "foundation", "cubic"], featured: true },
  { slug: "flooring-calculator", name: "Flooring Calculator", description: "Calculate flooring material needed for any room with wastage.", icon: Grid3x3, category: "construction-calculators", tags: ["flooring", "tiles", "room", "material", "wastage"] },

  // ── Energy Calculators ──────────────────────────
  { slug: "electricity-bill", name: "Electricity Bill Calculator", description: "Estimate your electricity bill based on appliance usage.", icon: Lightbulb, category: "energy-calculators", tags: ["electricity", "bill", "energy", "appliance", "cost", "power"], featured: true },
  { slug: "battery-backup-calculator", name: "Battery Backup Calculator", description: "Calculate UPS/inverter backup time and battery requirements.", icon: BatteryCharging, category: "energy-calculators", tags: ["battery", "backup", "ups", "inverter", "power"], featured: true },

  // ── Travel & Shipping Tools ─────────────────────
  { slug: "currency-converter", name: "Currency Converter", description: "Convert between world currencies with live rates.", icon: DollarSign, category: "travel-shipping-tools", tags: ["currency", "converter", "exchange", "travel"] },
  { slug: "time-zone-converter", name: "Time Zone Converter", description: "Convert time between different time zones.", icon: Timer, category: "travel-shipping-tools", tags: ["time", "zone", "convert", "travel"] },

  // ── Personal Calculators ────────────────────────
  { slug: "bmi-calculator", name: "BMI Calculator", description: "Calculate your Body Mass Index and health category.", icon: Calculator, category: "personal-calculators", tags: ["bmi", "health", "weight", "calculator"], featured: true },

  // ── Agriculture Tools ───────────────────────────
  { slug: "crop-yield-calculator", name: "Crop Yield Calculator", description: "Estimate crop yield per acre based on inputs.", icon: Wheat, category: "agriculture-tools", tags: ["crop", "yield", "farm", "agriculture"] },
  { slug: "irrigation-calculator", name: "Irrigation Calculator", description: "Calculate water requirements for crops.", icon: Droplets, category: "agriculture-tools", tags: ["irrigation", "water", "crop", "farming"] },
];

// ──────────────────────────────────────────────────
// REGISTRY HELPERS
// ──────────────────────────────────────────────────

export function getTool(slug: string): Tool | undefined {
  return TOOL_REGISTRY.find((t) => t.slug === slug);
}

export function getAllTools(): Tool[] {
  return TOOL_REGISTRY.filter((t) => !t.deprecated);
}

export function getToolsByCategory(categorySlug: CategorySlug): Tool[] {
  return getAllTools().filter(
    (t) => t.category === categorySlug || t.relatedCategories?.includes(categorySlug)
  );
}

export function getFeaturedTools(): Tool[] {
  return getAllTools().filter((t) => t.featured);
}

export function searchTools(query: string): Tool[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return getAllTools().filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q))
  );
}
