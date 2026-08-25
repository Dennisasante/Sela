"use client";

import { useTransition, useRef, useState } from "react";
import { toast } from "@/lib/toast";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import { Archive, ArchiveRestore, Plus } from "lucide-react";
import {
  createCategory,
  archiveCategory,
  restoreCategory,
  updateCategoryStyle,
} from "@/app/(app)/settings/actions";
import type { ExpenseCategory } from "@/lib/supabase/types";
import {
  CATEGORY_ICON_OPTIONS,
  CATEGORY_COLOR_OPTIONS,
  getCategoryIcon,
} from "@/lib/category-style";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function ColorSwatches({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORY_COLOR_OPTIONS.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Color ${c}`}
          onClick={() => onChange(c)}
          className={cn(
            "size-6 rounded-full ring-offset-2 ring-offset-background transition-shadow",
            value === c && "ring-2 ring-foreground"
          )}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  );
}

function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORY_ICON_OPTIONS.map((name) => {
        const Icon = getCategoryIcon(name);
        return (
          <button
            key={name}
            type="button"
            aria-label={`Icon ${name}`}
            onClick={() => onChange(name)}
            className={cn(
              "flex size-8 items-center justify-center rounded-full border",
              value === name ? "border-foreground bg-foreground/10" : "border-transparent bg-muted"
            )}
          >
            <Icon className="size-4" />
          </button>
        );
      })}
    </div>
  );
}

function CategoryChip({
  category,
  pending,
  onArchive,
  onRestyle,
}: {
  category: ExpenseCategory;
  pending: boolean;
  onArchive: () => void;
  onRestyle: (icon: string, color: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const Icon = getCategoryIcon(category.icon);

  return (
    <div className="rounded-lg border p-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="flex size-7 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${category.color}22`, color: category.color }}
          aria-label={`Customize ${category.name}`}
        >
          <Icon className="size-4" />
        </button>
        <span className="flex-1 text-sm">{category.name}</span>
        <button
          type="button"
          aria-label={`Archive ${category.name}`}
          disabled={pending}
          onClick={onArchive}
          className="rounded-full p-1.5 text-muted-foreground hover:bg-foreground/10"
        >
          <Archive className="size-3.5" />
        </button>
      </div>
      {editing && (
        <div className="mt-2 space-y-2 border-t pt-2">
          <IconPicker value={category.icon} onChange={(icon) => onRestyle(icon, category.color)} />
          <ColorSwatches value={category.color} onChange={(color) => onRestyle(category.icon, color)} />
        </div>
      )}
    </div>
  );
}

export function CategoryManager({ categories }: { categories: ExpenseCategory[] }) {
  const [pending, startTransition] = useTransition();
  const [icon, setIcon] = useState("shapes");
  const [color, setColor] = useState(CATEGORY_COLOR_OPTIONS[0]);
  const [showArchived, setShowArchived] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const active = categories.filter((c) => !c.archived_at);
  const archived = categories.filter((c) => c.archived_at);

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("icon", icon);
    formData.set("color", color);

    startTransition(async () => {
      try {
        await createCategory(formData);
        formRef.current?.reset();
        setIcon("shapes");
        setColor(CATEGORY_COLOR_OPTIONS[0]);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleArchive(id: string) {
    startTransition(async () => {
      try {
        await archiveCategory(id);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleRestore(id: string) {
    startTransition(async () => {
      try {
        await restoreCategory(id);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  function handleRestyle(id: string, newIcon: string, newColor: string) {
    startTransition(async () => {
      try {
        await updateCategoryStyle(id, newIcon, newColor);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2">
        {active.map((c) => (
          <CategoryChip
            key={c.id}
            category={c}
            pending={pending}
            onArchive={() => handleArchive(c.id)}
            onRestyle={(newIcon, newColor) => handleRestyle(c.id, newIcon, newColor)}
          />
        ))}
        {active.length === 0 && (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        )}
      </div>

      <form ref={formRef} onSubmit={handleAdd} className="space-y-2 rounded-lg border p-3">
        <Input name="name" placeholder="New category name" required />
        <IconPicker value={icon} onChange={setIcon} />
        <ColorSwatches value={color} onChange={setColor} />
        <Button type="submit" size="sm" disabled={pending} className="w-full">
          <Plus className="size-4" />
          Add category
        </Button>
      </form>

      {archived.length > 0 && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowArchived((v) => !v)}
            className="text-xs text-muted-foreground underline underline-offset-2"
          >
            {showArchived ? "Hide" : "Show"} archived ({archived.length})
          </button>
          {showArchived && (
            <div className="space-y-1.5">
              {archived.map((c) => {
                const Icon = getCategoryIcon(c.icon);
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 rounded-lg border border-dashed p-2 text-muted-foreground"
                  >
                    <Icon className="size-4" />
                    <span className="flex-1 text-sm">{c.name}</span>
                    <button
                      type="button"
                      aria-label={`Restore ${c.name}`}
                      disabled={pending}
                      onClick={() => handleRestore(c.id)}
                      className="rounded-full p-1.5 hover:bg-foreground/10"
                    >
                      <ArchiveRestore className="size-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
