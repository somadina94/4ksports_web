"use client";

import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Props = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
  }
>;

export default function Button({
  children,
  className = "",
  variant = "primary",
  ...props
}: Props) {
  const variantClass =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-500"
      : variant === "secondary"
        ? "bg-zinc-900 text-white hover:bg-zinc-700"
        : "bg-transparent text-zinc-200 hover:bg-zinc-800";

  return (
    <button
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
