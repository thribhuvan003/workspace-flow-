import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ff5c00] to-[#e05200] flex items-center justify-center mb-6">
        <Zap className="w-7 h-7 text-white" />
      </div>
      <h1 className="text-8xl font-black text-white/10 mb-2">404</h1>
      <h2 className="text-2xl font-semibold text-white mb-3">Page not found</h2>
      <p className="text-white/50 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild variant="gradient">
        <Link href="/dashboard">
          <Home className="w-4 h-4 mr-2" />
          Go to Dashboard
        </Link>
      </Button>
    </div>
  );
}
