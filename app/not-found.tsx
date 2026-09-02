import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <p className="text-7xl font-bold text-primary/20 mb-4">404</p>
      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Tool Not Found
      </h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        The tool or page you&apos;re looking for doesn&apos;t exist. It may have been
        moved or removed.
      </p>
      <div className="flex items-center gap-3">
        <Link href="/">
          <Button variant="outline" className="gap-1.5">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>
        <Link href="/tools">
          <Button className="gap-1.5">
            Browse Tools
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
