import { createFileRoute } from "@tanstack/react-router";
import { MarkdownPage } from "@/components/brand/MarkdownPage";
import { connectorText } from "@/lib/public-content";

export const Route = createFileRoute("/koppling")({
  head: () => ({ meta: [
    { title: "Koppla din AI-assistent – vårdbemanning.ai" },
    { name: "description", content: "Lägg till vårdbemanning.ai i Claude eller ChatGPT och slå upp ersättningsspann från SKR:s nationella hyrbemanningsavtal." },
    { property: "og:title", content: "Koppla din AI-assistent – vårdbemanning.ai" },
    { property: "og:description", content: "Instruktioner för vårdbemanning.ai:s kostnadsfria koppling till Claude och ChatGPT." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ConnectorPage,
});

function ConnectorPage() { return <MarkdownPage text={connectorText} />; }