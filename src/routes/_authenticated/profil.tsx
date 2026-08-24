import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchMyProfile, saveMyProfile, type Profile } from "@/lib/profile";

export const Route = createFileRoute("/_authenticated/profil")({
  head: () => ({
    meta: [
      { title: "Min profil – Vårdbemanning.ai" },
      {
        name: "description",
        content: "Hantera dina uppgifter som vårdkonsult: namn, yrkesroll, ort och bolag.",
      },
      { property: "og:title", content: "Min profil – Vårdbemanning.ai" },
      { property: "og:description", content: "Dina konsultuppgifter i Vårdbemanning.ai." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const EMPTY: Partial<Profile> = {
  full_name: "",
  phone: "",
  work_mode: null,
  role_code: "",
  municipality_code: "",
  company_name: "",
  company_org_nr: "",
};

function ProfilePage() {
  const { user } = Route.useRouteContext();
  const [values, setValues] = useState<Partial<Profile>>(EMPTY);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetchMyProfile(user.id).then((result) => {
      if (!active) return;
      if (result.status === "ok") {
        setValues({ ...EMPTY, ...(result.profile ?? {}) });
        setState("ready");
      } else if (result.status === "missing_table") {
        setState("missing");
      } else {
        setMessage(result.message);
        setState("error");
      }
    });
    return () => {
      active = false;
    };
  }, [user.id]);

  function set<K extends keyof Profile>(key: K, value: Profile[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await saveMyProfile(user.id, values);
      toast.success("Profilen är sparad.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Kunde inte spara profilen");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <Link to="/dashboard" className="text-sm text-muted-foreground hover:underline">
        ← Min sida
      </Link>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">Min profil</h1>
      <p className="mt-2 text-sm text-muted-foreground">Inloggad som {user.email}</p>

      {state === "loading" && (
        <p className="mt-8 text-sm text-muted-foreground">Hämtar profil…</p>
      )}

      {state === "missing" && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Profildatabasen är inte klar</CardTitle>
            <CardDescription>
              Tabellen <code>profiles</code> finns ännu inte i backenden. Formuläret aktiveras
              automatiskt så snart den är på plats.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {state === "error" && (
        <p className="mt-8 text-sm text-destructive">Kunde inte hämta profilen: {message}</p>
      )}

      {state === "ready" && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Dina uppgifter</CardTitle>
            <CardDescription>Används av AI-assistenten och i dina beräkningar.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="full_name">Namn</Label>
                <Input
                  id="full_name"
                  value={values.full_name ?? ""}
                  onChange={(e) => set("full_name", e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={values.phone ?? ""}
                  onChange={(e) => set("phone", e.target.value)}
                  autoComplete="tel"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="work_mode">Uppdragsform</Label>
                <select
                  id="work_mode"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                  value={values.work_mode ?? ""}
                  onChange={(e) =>
                    set("work_mode", (e.target.value || null) as Profile["work_mode"])
                  }
                >
                  <option value="">Välj…</option>
                  <option value="foretagare">Företagare</option>
                  <option value="anstalld">Löntagare</option>
                </select>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role_code">Yrkesroll</Label>
                  <Input
                    id="role_code"
                    value={values.role_code ?? ""}
                    onChange={(e) => set("role_code", e.target.value)}
                    placeholder="t.ex. Ögonläkare"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipality_code">Ort</Label>
                  <Input
                    id="municipality_code"
                    value={values.municipality_code ?? ""}
                    onChange={(e) => set("municipality_code", e.target.value)}
                    placeholder="t.ex. Torsby"
                  />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Bolag</Label>
                  <Input
                    id="company_name"
                    value={values.company_name ?? ""}
                    onChange={(e) => set("company_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_org_nr">Organisationsnummer</Label>
                  <Input
                    id="company_org_nr"
                    value={values.company_org_nr ?? ""}
                    onChange={(e) => set("company_org_nr", e.target.value)}
                    placeholder="556000-0000"
                  />
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Sparar…" : "Spara profil"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
