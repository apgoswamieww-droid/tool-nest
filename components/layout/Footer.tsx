import Link from "next/link";
import { Wrench } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SITE_NAME } from "@/lib/utils";
import { CATEGORY_LIST } from "@/lib/categories";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-3">
              <Wrench className="h-5 w-5 text-primary" />
              <span>{SITE_NAME}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fast, free, privacy-focused online tools and calculators. No sign-up required.
            </p>
          </div>

          {/* Tools */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Popular Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/tools/text-repeater" className="hover:text-foreground transition-colors">Text Repeater</Link></li>
              <li><Link href="/tools/json-formatter" className="hover:text-foreground transition-colors">JSON Formatter</Link></li>
              <li><Link href="/tools/emi-calculator" className="hover:text-foreground transition-colors">EMI Calculator</Link></li>
              <li><Link href="/tools/wheel-spinner" className="hover:text-foreground transition-colors">Wheel Spinner</Link></li>
              <li><Link href="/tools/bmi-calculator" className="hover:text-foreground transition-colors">BMI Calculator</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Categories</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {CATEGORY_LIST.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/categories/${cat.slug}`} className="hover:text-foreground transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="/tools" className="hover:text-foreground transition-colors">All Tools</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
          <p>
            Built with ❤️ for everyone. No tracking. No ads.
          </p>
        </div>
      </div>
    </footer>
  );
}
