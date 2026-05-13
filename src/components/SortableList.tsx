import { useState } from "react";
import { GripVertical, X } from "lucide-react";

interface Props<T> {
  items: T[];
  onChange: (next: T[]) => void;
  getKey: (item: T, i: number) => string;
  renderItem: (item: T, i: number) => React.ReactNode;
  onRemove?: (i: number) => void;
}

export function SortableList<T>({ items, onChange, getKey, renderItem, onRemove }: Props<T>) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  function handleDrop(target: number) {
    if (dragIdx === null || dragIdx === target) {
      setDragIdx(null);
      setOverIdx(null);
      return;
    }
    const next = [...items];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(target, 0, moved);
    onChange(next);
    setDragIdx(null);
    setOverIdx(null);
  }

  return (
    <ul className="space-y-2">
      {items.map((item, i) => {
        const isDragging = dragIdx === i;
        const isOver = overIdx === i && dragIdx !== i;
        return (
          <li
            key={getKey(item, i)}
            draggable
            onDragStart={(e) => {
              setDragIdx(i);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setOverIdx(i);
              e.dataTransfer.dropEffect = "move";
            }}
            onDragLeave={() => setOverIdx((cur) => (cur === i ? null : cur))}
            onDrop={(e) => {
              e.preventDefault();
              handleDrop(i);
            }}
            onDragEnd={() => {
              setDragIdx(null);
              setOverIdx(null);
            }}
            className={[
              "group flex items-center gap-3 rounded-lg border bg-card px-3 py-2.5 shadow-sm transition-all",
              isDragging ? "opacity-40 scale-[0.98]" : "opacity-100",
              isOver ? "border-accent ring-2 ring-accent/40 -translate-y-0.5" : "border-border",
            ].join(" ")}
          >
            <span className="cursor-grab text-muted-foreground active:cursor-grabbing">
              <GripVertical className="h-4 w-4" />
            </span>
            <div className="flex-1 min-w-0">{renderItem(item, i)}</div>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label="Remove"
                className="rounded-md p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </li>
        );
      })}
      {items.length === 0 && (
        <li className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Nothing here yet — add the first one above.
        </li>
      )}
    </ul>
  );
}
