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
  const labels = ["Too weak", "Weak", "Fair", "Good", "Strong", "Excellent"];
  const colors = [
    "bg-muted",
    "bg-destructive",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-primary",
    "bg-success",
  ];

  return (
    <div className="space-y-2 mt-1 px-1">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Password Strength
        </span>
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-wider transition-colors",
            strength > 0 ? "text-foreground" : "text-muted-foreground",
          )}>
          {password ? labels[strength] : "---"}
        </span>
      </div>
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4, 5].map((step) => (
          <div
            key={step}
            className={cn(
              "flex-1 rounded-full transition-all duration-500",
              strength >= step ? colors[strength] : "bg-muted/30",
            )}
          />
        ))}
      </div>
    </div>
  );
}
