import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/PageShell";
import { OrderForm } from "@/components/OrderForm";

export const Route = createFileRoute("/quotation")({
  head: () => ({
    meta: [
      { title: "Get a Quotation — Inkline" },
      { name: "description", content: "Request pricing for any print job. File uploads are optional at the quote stage." },
    ],
  }),
  component: () => (
    <PageShell title="Ask for a Quotation" lead="Tell us what you'd like printed. Files are optional at this stage.">
      <OrderForm mode="quotation" />
    </PageShell>
  ),
});
