import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { OrderForm } from "@/components/OrderForm";

export const Route = createFileRoute("/place-order")({
  head: () => ({
    meta: [
      { title: "Place an Order — Inkline" },
      { name: "description", content: "Configure your print job with paper, GSM, print type, binding and upload artwork." },
    ],
  }),
  component: () => (
    <PageShell title="Place an Order" lead="Pick a job type and fill in the specs. Required fields adapt to what you're printing.">
      <OrderForm mode="order" />
    </PageShell>
  ),
});
