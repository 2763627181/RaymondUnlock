"use client";

import { useState, type ReactNode } from "react";
import { Reorder, useDragControls } from "motion/react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import type { ActionResult } from "@/lib/actions/result";
import { runAction } from "@/lib/admin/run-action";

function Row<T extends { id: string }>({
  item,
  index,
  total,
  label,
  onCommit,
  onMove,
  children,
}: {
  item: T;
  index: number;
  total: number;
  label: string;
  onCommit: () => void;
  onMove: (direction: -1 | 1) => void;
  children: ReactNode;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      as="li"
      dragListener={false}
      dragControls={controls}
      onDragEnd={onCommit}
      className="border-border bg-surface flex items-center gap-2 rounded-xl border p-3"
      whileDrag={{ scale: 1.01, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
    >
      <button
        type="button"
        onPointerDown={(event) => controls.start(event)}
        aria-label={`Arrastrar ${label} para reordenar`}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md outline-none focus-visible:ring-2 active:cursor-grabbing"
      >
        <GripVertical className="size-4" aria-hidden="true" />
      </button>
      <div className="flex shrink-0 flex-col">
        <button
          type="button"
          onClick={() => onMove(-1)}
          disabled={index === 0}
          aria-label={`Subir ${label}`}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded outline-none focus-visible:ring-2 disabled:opacity-30"
        >
          <ArrowUp className="size-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onMove(1)}
          disabled={index === total - 1}
          aria-label={`Bajar ${label}`}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded outline-none focus-visible:ring-2 disabled:opacity-30"
        >
          <ArrowDown className="size-3.5" aria-hidden="true" />
        </button>
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </Reorder.Item>
  );
}

/**
 * Lista reordenable: se arrastra con el asa (ratón o dedo) o con las flechas
 * (teclado). El orden se guarda al soltar, con estado optimista: si el servidor
 * lo rechaza, vuelve al orden anterior.
 */
export function SortableList<T extends { id: string }>({
  items,
  label,
  getLabel,
  onReorder,
  renderItem,
}: {
  items: T[];
  label: string;
  getLabel: (item: T) => string;
  onReorder: (ids: string[]) => Promise<ActionResult<unknown>>;
  renderItem: (item: T) => ReactNode;
}) {
  const [order, setOrder] = useState(items);
  const [saved, setSaved] = useState(items);
  const [source, setSource] = useState(items);

  // Cuando el servidor entrega una lista nueva (tras guardar o refrescar) se
  // descarta el orden local. Se hace durante el render, no en un efecto: React
  // vuelve a renderizar de inmediato sin pintar el estado viejo.
  if (items !== source) {
    setSource(items);
    setOrder(items);
    setSaved(items);
  }

  async function commit(next: T[]) {
    if (next.every((item, index) => item.id === saved[index]?.id)) return;
    const result = await runAction(onReorder(next.map((item) => item.id)));
    if (result.ok) setSaved(next);
    else setOrder(saved);
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...order];
    const target = index + direction;
    const current = next[index];
    const other = next[target];
    if (!current || !other) return;
    next[index] = other;
    next[target] = current;
    setOrder(next);
    void commit(next);
  }

  return (
    <Reorder.Group
      as="ul"
      axis="y"
      values={order}
      onReorder={setOrder}
      aria-label={label}
      className="space-y-2"
    >
      {order.map((item, index) => (
        <Row
          key={item.id}
          item={item}
          index={index}
          total={order.length}
          label={getLabel(item)}
          onCommit={() => void commit(order)}
          onMove={(direction) => move(index, direction)}
        >
          {renderItem(item)}
        </Row>
      ))}
    </Reorder.Group>
  );
}

export function RowActions({ children }: { children: ReactNode }) {
  return <div className="flex shrink-0 items-center gap-1">{children}</div>;
}
