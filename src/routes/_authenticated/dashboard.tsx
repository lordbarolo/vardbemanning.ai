import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Min sida – Vårdbemanning.ai" },
      {
        name: "description",
        content: "Din översikt i Vårdbemanning.ai med profil, dokument och AI-assistent.",
      },
      { property: "og:title", content: "Min sida – Vårdbemanning.ai" },
      { property: "og:description", content: "Översikt för vårdkonsulter i Vårdbemanning.ai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Min sida</h1>
      <p className="mt-2 text-sm text-muted-foreground">Inloggad som {user.email}</p>
      <p className="mt-6 text-sm text-muted-foreground">
        Backend är kopplad till ditt egna Supabase-projekt. Nästa steg: designtokens, tabeller och
        AI-assistent.
      </p>
      <Button className="mt-8" variant="outline" onClick={signOut}>
        Logga ut
      </Button>
    </main>
  );
}
