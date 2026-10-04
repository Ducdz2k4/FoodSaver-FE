import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";

/**
 * FoodSaver Universal Button Component
 * Design Rule: Tất cả các nút xanh (brand #00615f, emerald, teal, green)
 * LUÔN CÓ CHỮ TRẮNG (text-white) để đảm bảo độ tương phản cao và trải nghiệm người dùng tối ưu.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        // DEFAULT & PRIMARY: Nền xanh thương hiệu FoodSaver (#00615f) với chữ trắng tinh
        default:
          "bg-[#00615f] text-white hover:bg-[#004e4c] active:bg-[#013d3c] shadow-xs in-[.admin-root]:bg-primary in-[.admin-root]:text-primary-foreground in-[.admin-root]:hover:bg-primary/80 [&_svg]:text-white in-[.admin-root]:[&_svg]:text-inherit",
        primary:
          "bg-[#00615f] text-white hover:bg-[#004e4c] active:bg-[#013d3c] shadow-xs [&_svg]:text-white",
        tgtg:
          "bg-[#00615f] text-white hover:bg-[#004e4c] active:bg-[#013d3c] shadow-xs [&_svg]:text-white",
        green:
          "bg-[#00615f] text-white hover:bg-[#004e4c] active:bg-[#013d3c] shadow-xs [&_svg]:text-white",
        emerald:
          "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-xs [&_svg]:text-white",
        success:
          "bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-xs [&_svg]:text-white",
        outline:
          "border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 shadow-2xs in-[.admin-root]:border-border in-[.admin-root]:bg-background in-[.admin-root]:hover:bg-muted in-[.admin-root]:hover:text-foreground",
        secondary:
          "bg-stone-100 text-stone-800 hover:bg-stone-200 active:bg-stone-300 in-[.admin-root]:bg-secondary in-[.admin-root]:text-secondary-foreground",
        ghost:
          "hover:bg-stone-100 text-stone-700 hover:text-stone-900 in-[.admin-root]:hover:bg-muted in-[.admin-root]:hover:text-foreground",
        destructive:
          "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-xs in-[.admin-root]:bg-destructive/10 in-[.admin-root]:text-destructive in-[.admin-root]:hover:bg-destructive/20 [&_svg]:text-white in-[.admin-root]:[&_svg]:text-inherit",
        link:
          "text-[#00615f] underline-offset-4 hover:underline p-0 h-auto font-medium in-[.admin-root]:text-primary",
      },
      size: {
        default: "h-9 gap-2 px-3.5 text-xs sm:text-sm",
        xs: "h-6 gap-1 rounded-lg px-2 text-[11px] [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1.5 rounded-lg px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 rounded-xl px-5 text-sm sm:text-base font-bold",
        xl: "h-12 gap-2.5 rounded-2xl px-6 text-base font-bold shadow-md",
        icon: "size-9 rounded-xl",
        "icon-xs": "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-11 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";

  // Tự động kiểm tra: nếu nút có nền xanh thì ép kiểu chữ trắng tinh (text-white)
  const classStr = typeof className === "string" ? className : "";
  const isGreenVariant =
    variant === "default" ||
    variant === "primary" ||
    variant === "green" ||
    variant === "tgtg" ||
    variant === "emerald" ||
    variant === "success";

  const hasGreenClass =
    classStr.includes("bg-[#00615f]") ||
    classStr.includes("bg-emerald-") ||
    classStr.includes("bg-teal-") ||
    classStr.includes("bg-green-");

  const hasExplicitText = classStr.includes("text-");
  const enforceWhite = (isGreenVariant || hasGreenClass) && !hasExplicitText;

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        buttonVariants({ variant, size }),
        enforceWhite && "text-white [&_svg]:text-white",
        className
      )}
      {...props}
    />
  );
}

export { Button, buttonVariants };
