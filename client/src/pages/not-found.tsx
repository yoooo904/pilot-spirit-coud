import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-white p-4">
      <div className="flex flex-col items-center text-center space-y-6 max-w-md">
        <AlertCircle className="h-16 w-16 text-white/30" />
        <h1 className="text-4xl font-display tracking-widest">404</h1>
        <p className="text-xl font-body text-muted-foreground">
          The void you are looking for does not exist here.
        </p>
        <Link href="/" className="px-8 py-3 border border-white/20 hover:bg-white/5 rounded-full font-display text-sm tracking-widest transition-colors">
          RETURN TO REALITY
        </Link>
      </div>
    </div>
  );
}
