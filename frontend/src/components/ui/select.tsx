import * as React from "react";
import { PiCaretDownBold, PiCheckBold } from "react-icons/pi";
import { cn } from "@/lib/utils";

export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

type TriggerRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRect: TriggerRect | null;
  setTriggerRect: (rect: TriggerRect | null) => void;
}>({
  open: false,
  setOpen: () => {},
  triggerRect: null,
  setTriggerRect: () => {},
});

const Select = ({ value, onValueChange, children, className }: SelectProps) => {
  const [open, setOpen] = React.useState(false);
  const [triggerRect, setTriggerRect] = React.useState<TriggerRect | null>(null);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, triggerRect, setTriggerRect }}>
      <div className={cn("relative", className)}>{children}</div>
    </SelectContext.Provider>
  );
};

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { placeholder?: string }
>(({ className, children, placeholder, ...props }, forwardedRef) => {
  const { value, open, setOpen, setTriggerRect } = React.useContext(SelectContext);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      setTriggerRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
    setOpen(!open);
  };

  return (
    <button
      ref={(node) => {
        buttonRef.current = node;
        if (typeof forwardedRef === 'function') {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      }}
      type="button"
      role="combobox"
      aria-expanded={open}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      onClick={handleClick}
      {...props}>
      <span className={cn(!value && "text-muted-foreground")}>
        {children || placeholder}
      </span>
      <PiCaretDownBold className="h-4 w-4 opacity-50" />
    </button>
  );
});
SelectTrigger.displayName = "SelectTrigger";

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open, setOpen, triggerRect } = React.useContext(SelectContext);

  if (!open || !triggerRect) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      <div
        ref={ref}
        className={cn(
          "fixed z-50 max-h-60 overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          className,
        )}
        style={{
          top: triggerRect.top + triggerRect.height + 4,
          left: triggerRect.left,
          minWidth: triggerRect.width,
        }}
        {...props}>
        {children}
      </div>
    </>
  );
});
SelectContent.displayName = "SelectContent";

const SelectItem = React.forwardRef<
  HTMLDivElement,
  SelectItemProps & React.HTMLAttributes<HTMLDivElement>
>(({ className, children, value, disabled, ...props }, ref) => {
  const {
    value: selectedValue,
    onValueChange,
    setOpen,
  } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        isSelected && "bg-accent text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onClick={() => {
        if (!disabled) {
          onValueChange?.(value);
          setOpen(false);
        }
      }}
      {...props}>
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <PiCheckBold className="h-4 w-4" />}
      </span>
      {children}
    </div>
  );
});
SelectItem.displayName = "SelectItem";

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = React.useContext(SelectContext);
  return <>{value || placeholder}</>;
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
