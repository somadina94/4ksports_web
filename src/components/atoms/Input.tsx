import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: Props) {
  return (
    <input
      className={`w-full rounded-xl border border-zinc-700 bg-zinc-900/60 px-3 py-2 text-sm text-zinc-100 outline-none ring-indigo-500 placeholder:text-zinc-400 focus:ring-2 ${className}`}
      {...props}
    />
  );
}
