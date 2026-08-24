import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Min sida</h1>
      <p className="mt-2 text-sm text-muted-foreground">Inloggad som {user.email}</p>
      <p className="mt-6 text-sm text-muted-foreground">
        Här samlas dina uppgifter, dokument och AI-assistenten.
      </p>
      <div className="mt-6">
        <Link
          to="/profil"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Min profil
        </Link>
      </div>
      <Button className="mt-8" variant="outline" onClick={signOut}>
        Logga ut
      </Button>
    </main>
  );
}
