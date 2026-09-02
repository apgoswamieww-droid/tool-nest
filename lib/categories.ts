import {
  Type,
  Code2,
  DollarSign,
  GraduationCap,
  FileText,
  Ruler,
  Zap,
  QrCode,
  Plane,
  Laugh,
  Calculator,
  Sprout,
} from "lucide-react";
import { Category, CategorySlug, FAQItem } from "@/types";

/**
 * ═══════════════════════════════════════════════════
 * CATEGORY REGISTRY — Rich SEO-driven categories
 * Each entry is a topical cluster with:
 * - SEO intro paragraph
 * - FAQ section
 * - Keywords for search
 * - Related categories for internal linking
 * ═══════════════════════════════════════════════════
 */
export const CATEGORY_REGISTRY: Record<CategorySlug, Category> = {
  "text-tools": {
    slug: "text-tools",
    name: "Text Tools",
    description: "Text manipulation, formatting, and conversion utilities.",
    intro:
      "ToolNest's text tools help you manipulate, format, and transform text in seconds. Whether you need to count words for an essay, convert case for code, repeat strings for testing, or strip emojis from pasted content — our free online text tools process everything in your browser with zero data uploads. No sign-up required.",
    icon: Type,
    order: 1,
    color: "blue",
    keywords: [
      "text tools",
      "text editor online",
      "word counter",
      "case converter",
      "text manipulator",
      "string tools",
    ],
    relatedCategories: ["developer-tools", "qr-barcode-tools"],
    faq: [
      {
        question: "Are these text tools free to use?",
        answer:
          "Yes, all ToolNest text tools are 100% free with no usage limits. No account or sign-up is needed.",
      },
      {
        question: "Is my text data uploaded to a server?",
        answer:
          "No. All processing happens directly in your browser using JavaScript. Your text never leaves your device.",
      },
      {
        question: "Can I use these tools on mobile?",
        answer:
          "Absolutely. All ToolNest tools are fully responsive and work on phones, tablets, and desktops.",
      },
    ],
  },

  "developer-tools": {
    slug: "developer-tools",
    name: "Developer Tools",
    description: "Encoders, formatters, converters, and dev utilities.",
    intro:
      "ToolNest's developer tools streamline your workflow with instant formatting, validation, encoding, and conversion utilities. Format JSON and YAML, validate SQL queries, encode Base64, decode HTML entities, generate robots.txt files, and extract URLs — all from your browser with no server round-trips. Built for developers who value speed and privacy.",
    icon: Code2,
    order: 2,
    color: "green",
    keywords: [
      "developer tools",
      "json formatter",
      "sql validator",
      "base64 encoder",
      "code tools online",
      "yaml formatter",
    ],
    relatedCategories: ["text-tools", "qr-barcode-tools"],
    faq: [
      {
        question: "Do these tools send my code to a server?",
        answer:
          "No. All encoding, formatting, and validation happens client-side in your browser. Your source code never leaves your device.",
      },
      {
        question: "Which SQL dialects are supported?",
        answer:
          "The SQL Validator checks standard SQL syntax common to MySQL, PostgreSQL, SQL Server, and SQLite. It focuses on universal syntax patterns rather than dialect-specific features.",
      },
      {
        question: "Can I use the robots.txt generator for my website?",
        answer:
          "Yes. The Robots.txt Generator creates properly formatted files following the Robots Exclusion Protocol. Copy the output and place it at your domain's root (e.g., example.com/robots.txt).",
      },
    ],
  },

  "financial-calculators": {
    slug: "financial-calculators",
    name: "Financial Calculators",
    description: "Loan, interest, tax, and investment calculators.",
    intro:
      "ToolNest's financial calculators help you make smarter money decisions. Calculate loan EMIs, compound interest, APR with fees, forex margins, ROAS for marketing campaigns, customer lifetime value, and more. Each calculator shows its formula and methodology so you understand exactly how the result is derived. All calculations happen instantly in your browser.",
    icon: DollarSign,
    order: 3,
    color: "emerald",
    keywords: [
      "financial calculator",
      "EMI calculator",
      "loan calculator",
      "interest calculator",
      "APR calculator",
      "investment calculator",
      "forex calculator",
      "ROI calculator",
    ],
    relatedCategories: ["personal-calculators", "energy-calculators"],
    faq: [
      {
        question: "How accurate are these financial calculators?",
        answer:
          "Our calculators use industry-standard formulas (amortization, compound interest, Newton's method for APR). Results are mathematically precise, though real-world rates may vary by lender or institution.",
      },
      {
        question: "Can I use these for business decisions?",
        answer:
          "Yes. Tools like the Working Capital Calculator, ROAS Calculator, and CLV Calculator are designed specifically for business and marketing analysis.",
      },
      {
        question: "Do I need to create an account?",
        answer:
          "No. All financial calculators are free and anonymous. No data is stored or tracked.",
      },
    ],
  },

  "student-tools": {
    slug: "student-tools",
    name: "Student Tools",
    description: "GPA, attendance, and academic calculators.",
    intro:
      "ToolNest's student tools help you stay on top of academics. Calculate your GPA across semesters, track attendance percentages, convert marks to percentages, find grade boundaries, and convert between CGPA and percentage systems. Whether you're in high school or university, these free calculators give you instant, accurate results for academic planning.",
    icon: GraduationCap,
    order: 4,
    color: "purple",
    keywords: [
      "student calculator",
      "GPA calculator",
      "attendance calculator",
      "marks percentage",
      "grade calculator",
      "CGPA calculator",
      "academic tools",
    ],
    relatedCategories: ["personal-calculators", "text-tools"],
    faq: [
      {
        question: "How do I calculate my GPA?",
        answer:
          "Enter your grades and credit hours for each course. The calculator computes your semester GPA and cumulative GPA using the standard weighted average formula.",
      },
      {
        question: "What attendance percentage do most colleges require?",
        answer:
          "Most institutions require 75% minimum attendance. Use our Attendance Calculator to see exactly how many classes you need to attend and how many you can still miss.",
      },
      {
        question: "How do I convert CGPA to percentage?",
        answer:
          "The CGPA to Percentage Calculator uses the standard formula: Percentage = CGPA × 9.5 (for the 10-point scale). Other scales are also supported.",
      },
    ],
  },

  "pdf-tools": {
    slug: "pdf-tools",
    name: "PDF Tools",
    description: "PDF conversion, merging, splitting, and manipulation.",
    intro:
      "ToolNest's PDF tools help you work with PDF documents entirely in your browser. Get PDF metadata and page counts, extract text content, merge multiple PDFs, and convert text to PDF — all without uploading files to any server. Your documents stay private and secure on your device.",
    icon: FileText,
    order: 5,
    color: "red",
    keywords: [
      "PDF tools",
      "PDF editor online",
      "merge PDF",
      "split PDF",
      "PDF to text",
      "PDF metadata",
      "free PDF tools",
    ],
    relatedCategories: ["text-tools", "developer-tools"],
    faq: [
      {
        question: "Are my PDF files uploaded to your servers?",
        answer:
          "No. All PDF processing happens in your browser using JavaScript and the File API. Your files never leave your device.",
      },
      {
        question: "Can I merge multiple PDF files?",
        answer:
          "Yes. The PDF Merge tool lets you select multiple PDF files and combine them into a single document. You can reorder pages before merging.",
      },
      {
        question: "What PDF information can I view?",
        answer:
          "The PDF Info tool extracts metadata including title, author, creation date, page count, file size, and PDF version — all without uploading the file.",
      },
    ],
  },

  "construction-calculators": {
    slug: "construction-calculators",
    name: "Construction Calculators",
    description: "Area, volume, material, and building calculators.",
    intro:
      "ToolNest's construction calculators help contractors, builders, and DIY enthusiasts estimate materials and costs accurately. Calculate bricks and mortar for walls, estimate paint coverage and cost for rooms, compute concrete volume for foundations, and determine flooring material needs. Each calculator includes formulas and wastage factors for real-world accuracy.",
    icon: Ruler,
    order: 6,
    color: "orange",
    keywords: [
      "construction calculator",
      "brick calculator",
      "paint calculator",
      "concrete calculator",
      "building materials",
      "flooring calculator",
      "construction cost estimator",
    ],
    relatedCategories: ["energy-calculators", "personal-calculators"],
    faq: [
      {
        question: "How do I calculate bricks for a wall?",
        answer:
          "Enter your wall dimensions (length, height, thickness) and brick size. The Brick Calculator accounts for mortar joints and adds a wastage factor (default 5%) for breakage during construction.",
      },
      {
        question: "How much paint do I need for a room?",
        answer:
          "Enter room dimensions, number of doors and windows, coats of paint, and price per gallon. The calculator deducts door/window areas and gives you exact gallons needed and total cost.",
      },
      {
        question: "How is concrete volume calculated?",
        answer:
          "Concrete Volume = Length × Width × Depth. Enter the dimensions of your slab, footing, or column and the calculator provides volume in cubic feet and cubic meters, plus bag estimates.",
      },
    ],
  },

  "energy-calculators": {
    slug: "energy-calculators",
    name: "Energy Calculators",
    description: "Electricity, fuel, carbon, and energy cost calculators.",
    intro:
      "ToolNest's energy calculators help you understand and reduce your energy consumption. Estimate electricity bills based on appliance usage, calculate UPS/inverter backup times, and make informed decisions about energy-efficient alternatives. All calculations are based on standard energy formulas and industry benchmarks.",
    icon: Zap,
    order: 7,
    color: "yellow",
    keywords: [
      "energy calculator",
      "electricity bill calculator",
      "battery backup calculator",
      "power consumption",
      "energy cost estimator",
    ],
    relatedCategories: ["financial-calculators", "construction-calculators"],
    faq: [
      {
        question: "How do I estimate my electricity bill?",
        answer:
          "Add your appliances with wattage and daily usage hours, then enter your rate per kWh. The Electricity Bill Calculator shows daily, monthly, and yearly costs with a per-appliance breakdown.",
      },
      {
        question: "How long will my UPS battery last?",
        answer:
          "Enter your battery specifications (voltage, Ah, count, type) and the appliances you want on backup. The Battery Backup Calculator estimates runtime based on total load and battery capacity.",
      },
    ],
  },

  "qr-barcode-tools": {
    slug: "qr-barcode-tools",
    name: "QR & Barcode Tools",
    description: "Generate and scan QR codes and barcodes.",
    intro:
      "ToolNest's QR and barcode tools let you generate scannable codes instantly. Create Code128 barcodes for product labeling, inventory tracking, and asset management. Customize dimensions, colors, and download as scalable SVG files — all generated in your browser with no server dependency.",
    icon: QrCode,
    order: 8,
    color: "teal",
    keywords: [
      "QR code generator",
      "barcode generator",
      "Code128 barcode",
      "product barcode",
      "QR code free",
    ],
    relatedCategories: ["developer-tools", "text-tools"],
    faq: [
      {
        question: "Is the generated barcode scannable?",
        answer:
          "Yes. The Code128 Barcode Generator produces industry-standard barcodes that can be scanned by any standard barcode scanner or smartphone app.",
      },
      {
        question: "Can I download the barcode?",
        answer:
          "Yes. Click 'Download SVG' to save the barcode as a scalable vector file that remains sharp at any print size.",
      },
    ],
  },

  "travel-shipping-tools": {
    slug: "travel-shipping-tools",
    name: "Travel & Shipping Tools",
    description: "Currency, distance, time zone, and shipping calculators.",
    intro:
      "ToolNest's travel and shipping tools help you plan trips and manage logistics. Convert between world currencies, sync across time zones, and calculate distances. Whether you're a frequent traveler or managing international shipments, these free tools provide instant, accurate results.",
    icon: Plane,
    order: 9,
    color: "sky",
    keywords: [
      "travel tools",
      "currency converter",
      "time zone converter",
      "shipping calculator",
      "distance calculator",
    ],
    relatedCategories: ["financial-calculators", "personal-calculators"],
    faq: [
      {
        question: "Does the currency converter use live rates?",
        answer:
          "The Currency Converter uses fixed exchange rates for offline use. For live rates, check with your financial institution.",
      },
      {
        question: "How do I convert time zones?",
        answer:
          "Select your source and target time zones, enter the time, and the Time Zone Converter instantly shows the equivalent time in the other zone.",
      },
    ],
  },

  "fun-tools": {
    slug: "fun-tools",
    name: "Fun Tools",
    description: "Random generators, name pickers, and entertaining tools.",
    intro:
      "ToolNest's fun tools bring excitement to decisions. Spin a colorful wheel to pick random winners, draw names from a hat, and make group decisions fair and entertaining. Perfect for classrooms, team events, contests, and social gatherings. Everything runs in your browser with smooth animations.",
    icon: Laugh,
    order: 10,
    color: "pink",
    keywords: [
      "random picker",
      "wheel spinner",
      "name picker",
      "random generator",
      "decision maker",
      "classroom tools",
    ],
    relatedCategories: ["text-tools", "student-tools"],
    faq: [
      {
        question: "Is the wheel spinner truly random?",
        answer:
          "Yes. It uses the browser's cryptographic random number generator for fair, unbiased selection every time.",
      },
      {
        question: "Can I use this for classroom activities?",
        answer:
          "Absolutely. Enter student names and spin to pick randomly. It's fair, transparent, and engaging for students.",
      },
    ],
  },

  "personal-calculators": {
    slug: "personal-calculators",
    name: "Personal Calculators",
    description: "BMI, calorie, age, and personal health calculators.",
    intro:
      "ToolNest's personal calculators help you track health metrics and personal finances. Calculate your BMI, estimate daily caloric needs, and plan personal budgets. Each calculator provides clear explanations of the formulas used so you understand your results.",
    icon: Calculator,
    order: 11,
    color: "cyan",
    keywords: [
      "BMI calculator",
      "personal calculator",
      "health calculator",
      "calorie calculator",
      "fitness calculator",
    ],
    relatedCategories: ["financial-calculators", "student-tools"],
    faq: [
      {
        question: "How do I calculate my BMI?",
        answer:
          "Enter your weight and height. The BMI Calculator divides weight (kg) by height squared (m²) to give your Body Mass Index, plus your health category (underweight, normal, overweight, obese).",
      },
    ],
  },

  "agriculture-tools": {
    slug: "agriculture-tools",
    name: "Agriculture Tools",
    description: "Crop, irrigation, fertilizer, and farming calculators.",
    intro:
      "ToolNest's agriculture tools support farmers and agricultural professionals. Estimate crop yields per acre, calculate irrigation water requirements, and plan fertilizer application rates. These calculators use standard agricultural formulas to help optimize farming operations and maximize productivity.",
    icon: Sprout,
    order: 12,
    color: "lime",
    keywords: [
      "agriculture calculator",
      "crop yield calculator",
      "irrigation calculator",
      "farming tools",
      "fertilizer calculator",
    ],
    relatedCategories: ["construction-calculators", "energy-calculators"],
    faq: [
      {
        question: "How do I calculate crop yield?",
        answer:
          "Enter your field area, expected plants per area, and average yield per plant. The Crop Yield Calculator estimates total production in kg or tonnes.",
      },
      {
        question: "How much water do my crops need?",
        answer:
          "Enter crop type, field area, and growth stage. The Irrigation Calculator estimates daily and weekly water requirements in liters and cubic meters.",
      },
    ],
  },
};

/** Ordered list of categories for rendering */
export const CATEGORY_LIST: Category[] = Object.values(CATEGORY_REGISTRY).sort(
  (a, b) => a.order - b.order
);

/** Get a category by slug */
export function getCategory(slug: CategorySlug): Category | undefined {
  return CATEGORY_REGISTRY[slug];
}
