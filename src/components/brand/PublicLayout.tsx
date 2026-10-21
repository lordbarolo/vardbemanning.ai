import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { trackConnectorCta } from "@/lib/analytics";

export function PublicLayout({ children, home = false }: { children: ReactNode; home?: boolean }) {
  const { isAuthenticated } = useAuth();
  return (
    <div className="mono-home min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md" aria-label="Huvudnavigation">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <Link to="/" aria-label="Vårdbemanning.ai startsida"><Logo className="h-auto w-40 sm:w-52" /></Link>
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
            <Link to={isAuthenticated ? "/dashboard" : "/auth"}>{isAuthenticated ? "Min sida" : "Logga in"}</Link>
          </Button>
        </div>
      </nav>
      <main>{children}</main>
      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <Link to="/" aria-label="Vårdbemanning.ai startsida"><Logo className="h-auto w-40 sm:w-52" /></Link>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span>Vanliga frågor</span>
            <Link to="/integritetspolicy" className="hover:text-foreground">Integritetspolicy</Link>
            <Link to="/koppling" className="hover:text-foreground" onClick={() => home && trackConnectorCta("docs")}>För AI-assistenter</Link>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Vårdbemanning.ai</p>
        </div>
      </footer>
    </div>
  );
}