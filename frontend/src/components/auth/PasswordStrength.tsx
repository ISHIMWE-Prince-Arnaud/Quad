import { cn } from "@/lib/utils";

type PasswordStrengthProps = {
  password: string;
};

export function PasswordStrength({ password }: PasswordStrengthProps) {
  const getStrength = (pass: string) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length > 6) score += 1;
    if (pass.length > 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getStrength(password);
  const labels = ["TOO WEAK", "WEAK", "FAIR", "GOOD", "STRONG", "EXCELLENT"];
  const colors = [
    "bg-muted/30",
    "bg-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.3)]",
    "bg-[#f97316] shadow-[0_0_10px_rgba(249,115,22,0.3)]",
    "bg-[#eab308] shadow-[0_0_10px_rgba(234,179,8,0.3)]",
    "bg-[#3b82f6] shadow-[0_0_10px_rgba(59,130,246,0.3)]",
    "bg-[#22c55e] shadow-[0_0_10px_rgba(34,197,94,0.3)]",
  ];

  return (
    <div className="space-y-2 mt-2 px-1">
      <div className="flex justify-between items-center px-0.5">
        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">
          Security Pulse
        </span>
        <span
          className={cn(
            "text-[9px] font-black uppercase tracking-[0.1em] transition-all duration-500",
            strength > 0 ? "text-foreground" : "text-muted-foreground/40",
          )}>
          {password ? labels[strength] : "---"}
        </span>
      </div>
      <div className="flex gap-1.5 h-1">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={cn(
              "flex-1 rounded-full transition-all duration-700 ease-in-out",
              strength >= step ? colors[strength] : "bg-muted/20",
            )}
          />
        ))}
      </div>
    </div>
  );
}
