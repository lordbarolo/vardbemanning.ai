import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Nytt lösenord – Vårdbemanning.ai" },
      {
        name: "description",
        content: "Välj ett nytt lösenord till ditt konto på Vårdbemanning.ai.",
      },
      { property: "og:title", content: "Nytt lösenord – Vårdbemanning.ai" },
      { property: "og:description", content: "Återställ lösenordet till ditt konto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Lösenordet är uppdaterat.");
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kunde inte uppdatera lösenordet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Link to="/" aria-label="Vårdbemanning.ai startsida" className="mb-5 block">
            <Logo className="h-auto w-52" />
          </Link>
          <CardTitle>Välj nytt lösenord</CardTitle>
          <CardDescription>
            {ready
              ? "Ange ett nytt lösenord för ditt konto."
              : "Öppna länken i återställningsmejlet för att fortsätta."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nytt lösenord</Label>
              <Input
                id="new-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={!ready}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !ready}>
              {loading ? "Sparar…" : "Spara lösenord"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/auth" className="text-sm text-muted-foreground hover:underline">
              Tillbaka till inloggning
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
