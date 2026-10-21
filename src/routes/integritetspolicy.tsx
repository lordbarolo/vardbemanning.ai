import { createFileRoute } from "@tanstack/react-router";
import { MarkdownPage } from "@/components/brand/MarkdownPage";
import { privacyText } from "@/lib/public-content";

export const Route = createFileRoute("/integritetspolicy")({
  head: () => ({ meta: [
    { title: "Integritetspolicy – vårdbemanning.ai" },
    { name: "description", content: "Så behandlar vårdbemanning.ai uppslagsdata och besöksstatistik på sidan och i AI-kopplingen." },
    { property: "og:title", content: "Integritetspolicy – vårdbemanning.ai" },
    { property: "og:description", content: "Information om integritet, uppslagsstatistik och dina rättigheter." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: PrivacyPage,
});

function PrivacyPage() { return <MarkdownPage text={privacyText} />; }