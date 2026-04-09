"use client";

type ToastItem = {
  id: string;
  type: "success" | "error" | "info";
  message: string;
};

type Props = {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
};

export default function ToastStack({ toasts, onDismiss }: Props) {
  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[320px] flex-col gap-2">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => onDismiss(toast.id)}
          className={`rounded-md border px-3 py-2 text-left text-sm shadow-lg ${
            toast.type === "success"
              ? "border-emerald-700 bg-emerald-950/90 text-emerald-200"
              : toast.type === "error"
                ? "border-red-700 bg-red-950/90 text-red-200"
                : "border-zinc-700 bg-zinc-900/95 text-zinc-100"
          }`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
