import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Logga in – Vårdbemanning.ai" },
      {
        name: "description",
        content:
          "Logga in eller skapa konto på Vårdbemanning.ai för AI-assistent och smarta verktyg för vårdkonsulter.",
      },
      { property: "og:title", content: "Logga in – Vårdbemanning.ai" },
      {
        property: "og:description",
        content: "Konto och inloggning för Vårdbemanning.ai.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        });
        if (error) throw error;
        if (data.session) {
          navigate({ to: "/dashboard", replace: true });
        } else {
          setAwaitingConfirmation(true);
          toast.success("Konto skapat. Bekräfta din e-postadress via länken vi skickat.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Något gick fel");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      toast.error("Fyll i din e-postadress först.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Vi har skickat en återställningslänk till din e-post.");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <Link to="/" aria-label="Vårdbemanning.ai startsida" className="mb-5 block">
            <Logo className="h-auto w-52" />
          </Link>
          <CardTitle>{mode === "signin" ? "Logga in" : "Skapa konto"}</CardTitle>
          <CardDescription>Smarta verktyg för vårdkonsulter</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Lösenord</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Vänta…" : mode === "signin" ? "Logga in" : "Skapa konto"}
            </Button>
          </form>
          {awaitingConfirmation && (
            <p className="mt-4 rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              Kontot är skapat. Klicka på länken i mejlet till {email} för att aktivera det och
              logga in.
            </p>
          )}
          {mode === "signin" && (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="mt-4 w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Glömt lösenordet?
            </button>
          )}
          <button
            type="button"
            className="mt-2 w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "Har du inget konto? Skapa ett" : "Har du redan konto? Logga in"}
          </button>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:underline">
              Tillbaka till start
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
