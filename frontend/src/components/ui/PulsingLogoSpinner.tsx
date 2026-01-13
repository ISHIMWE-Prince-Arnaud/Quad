import { Logo, type LogoProps } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

const PulsingLogoSpinner = ({
  className,
  size = "md",
}: {
  className?: string;
  size?: LogoProps["size"];
}) => {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Logo size={size} className="animate-breathing" />
    </div>
  );
};

export default PulsingLogoSpinner;
