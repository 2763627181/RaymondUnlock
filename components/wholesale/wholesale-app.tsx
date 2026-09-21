"use client";

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { BottomNav, type ListingTab } from "@/components/wholesale/bottom-nav";
import { CategorySection } from "@/components/wholesale/category-group";
import { ContactSheet } from "@/components/wholesale/contact-sheet";
import { FiltersDialog } from "@/components/wholesale/filters-dialog";
import { ListingHeader } from "@/components/wholesale/listing-header";
import { ListingToolbar } from "@/components/wholesale/listing-toolbar";
import { MoreSheet, type ListingBusiness } from "@/components/wholesale/more-sheet";
import { OrderBar } from "@/components/wholesale/order-bar";
import { OrderSheet } from "@/components/wholesale/order-sheet";
import { SentDialog } from "@/components/wholesale/sent-dialog";
import { useSendOrder } from "@/components/wholesale/use-send-order";
import { Button } from "@/components/ui/button";
import { useIsClient } from "@/lib/use-is-client";
import { useWholesaleCart, wholesaleCount } from "@/lib/wholesale/cart";
import {
  activeFilterCount,
  facetsOf,
  filterItems,
  groupByCategory,
  hasActiveSearch,
} from "@/lib/wholesale/filter";
import {
  EMPTY_FILTERS,
  type WholesaleContact,
  type WholesaleFilters,
  type WholesaleListing,
} from "@/lib/wholesale/types";

/** El listado al por mayor como una app: buscar, filtrar, armar el pedido y mandarlo por WhatsApp. */
export function WholesaleApp({
  listing,
  business,
}: {
  listing: WholesaleListing;
  business: ListingBusiness;
}) {
  const isClient = useIsClient();
  const [filters, setFilters] = useState<WholesaleFilters>(EMPTY_FILTERS);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const lines = useWholesaleCart((state) => state.lines);
  const syncCart = useWholesaleCart((state) => state.sync);
  const { sending, sent, dismissSent, send } = useSendOrder();

  // Precios al día y sin productos que el negocio ya quitó del listado.
  useEffect(() => syncCart(listing.items), [listing.items, syncCart]);

  const deferredQuery = useDeferredValue(filters.query);
  const visible = useMemo(
    () => filterItems(listing.items, { ...filters, query: deferredQuery }),
    [listing.items, filters, deferredQuery],
  );
  const groups = useMemo(() => groupByCategory(visible), [visible]);
  const facets = useMemo(() => facetsOf(listing.items), [listing.items]);

  const searching = hasActiveSearch(filters);
  const firstCategory = groups[0]?.category;
  const isOpen = (category: string) =>
    searching || expanded.has(category) || (expanded.size === 0 && category === firstCategory);
  const count = isClient ? wholesaleCount(lines) : 0;

  function toggleCategory(category: string) {
    const current = new Set(expanded.size === 0 && firstCategory ? [firstCategory] : expanded);
    if (current.has(category)) current.delete(category);
    else current.add(category);
    setExpanded(current);
  }

  async function sendTo(contact: WholesaleContact | null) {
    if (await send(contact)) {
      setContactOpen(false);
      setOrderOpen(false);
    }
  }

  function handleSend() {
    // Con varios vendedores se elige a quién; con uno (o ninguno) sale directo.
    if (listing.contacts.length > 1) setContactOpen(true);
    else void sendTo(listing.contacts[0] ?? null);
  }

  function handleTab(tab: ListingTab) {
    if (tab === "pedido") setOrderOpen(true);
    else if (tab === "mas") setMoreOpen(true);
    else {
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (tab === "buscar") searchRef.current?.focus();
    }
  }

  const active: ListingTab = orderOpen
    ? "pedido"
    : moreOpen
      ? "mas"
      : searchFocused
        ? "buscar"
        : "listado";

  return (
    <div className="bg-surface-2 min-h-dvh">
      <main
        id="contenido"
        className="bg-surface border-border mx-auto min-h-dvh max-w-3xl pb-44 sm:border-x"
      >
        <ListingHeader businessName={business.name} updatedAt={listing.updatedAt} />
        <ListingToolbar
          query={filters.query}
          onQueryChange={(query) => setFilters((current) => ({ ...current, query }))}
          onFocusChange={setSearchFocused}
          activeFilters={activeFilterCount(filters)}
          onOpenFilters={() => setFiltersOpen(true)}
          shown={visible.length}
          inputRef={searchRef}
        />

        {listing.items.length === 0 ? (
          <p className="text-muted-foreground p-10 text-center">
            El listado al por mayor se está preparando. Escríbenos por WhatsApp y te lo enviamos.
          </p>
        ) : groups.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium">No encontramos productos con esa búsqueda.</p>
            <Button variant="outline" className="mt-4" onClick={() => setFilters(EMPTY_FILTERS)}>
              Limpiar búsqueda y filtros
            </Button>
          </div>
        ) : (
          groups.map((group, index) => (
            <CategorySection
              key={group.category}
              group={group}
              index={index}
              open={isOpen(group.category)}
              onToggle={() => toggleCategory(group.category)}
            />
          ))
        )}
      </main>

      <OrderBar visible={isClient && !orderOpen} onOpen={() => setOrderOpen(true)} />
      <BottomNav active={active} count={count} onSelect={handleTab} />

      <FiltersDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        facets={facets}
        filters={filters}
        onApply={(next) => setFilters((current) => ({ ...current, ...next }))}
      />
      <OrderSheet
        open={orderOpen}
        onOpenChange={setOrderOpen}
        sending={sending}
        onSend={handleSend}
      />
      <ContactSheet
        open={contactOpen}
        onOpenChange={setContactOpen}
        contacts={listing.contacts}
        disabled={sending}
        onPick={(contact) => void sendTo(contact)}
      />
      <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} business={business} />
      <SentDialog order={sent} onClose={dismissSent} />
    </div>
  );
}
