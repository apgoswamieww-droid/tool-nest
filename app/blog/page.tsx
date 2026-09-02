import type { Metadata } from "next";
import { getStaticPageMetadata } from "@/lib/seo";
import { SITE_NAME } from "@/lib/utils";
import { PenLine } from "lucide-react";

export const metadata: Metadata = getStaticPageMetadata(
  "Blog",
  `${SITE_NAME} blog — tips, tutorials, and updates about our tools.`
);

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
        Blog
      </h1>
      <p className="text-muted-foreground text-lg mb-8">
        Tips, tutorials, and updates from {SITE_NAME}.
      </p>

      <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-dashed bg-muted/30">
        <PenLine className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
        <p className="text-muted-foreground max-w-md">
          We&apos;re working on helpful articles about our tools. Stay tuned!
        </p>
      </div>
    </div>
  );
}
