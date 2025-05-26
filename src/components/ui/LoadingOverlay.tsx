import { Loader2 } from "lucide-react";

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
      <Loader2 className="animate-spin w-8 h-8 text-sky-500" />
    </div>
  );
} 