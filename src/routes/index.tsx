import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vårdbemanning.ai – AI-verktyg för vårdkonsulter" },
      {
        name: "description",
        content:
          "Vårdbemanning.ai samlar smarta verktyg och AI som förenklar det administrativa och affärsmässiga för konsulter inom svensk vårdbemanning.",
      },
      { property: "og:title", content: "Vårdbemanning.ai – AI-verktyg för vårdkonsulter" },
      {
        property: "og:description",
        content: "AI-assistent och agentic search för svensk vårdbemanning.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
      <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Vårdbemanning.ai
      </h1>
      <p className="mt-4 max-w-xl text-sm text-muted-foreground">
        Smarta verktyg och AI som underlättar det administrativa och affärsmässiga för vårdens
        konsulter.
      </p>
      <Link
        to="/auth"
        className="mt-8 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Logga in
      </Link>
    </main>
  );
}
