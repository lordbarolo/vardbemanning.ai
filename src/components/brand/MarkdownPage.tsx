import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PublicLayout } from "./PublicLayout";

export function MarkdownPage({ text }: { text: string }) {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-6 py-12 text-base leading-7 sm:py-16">
        <Markdown remarkPlugins={[remarkGfm]} components={{
          h1: ({ children }) => <h1 className="mb-6 text-3xl font-semibold leading-tight sm:text-4xl">{children}</h1>,
          h2: ({ children }) => <h2 className="mb-3 mt-10 text-2xl font-semibold leading-tight">{children}</h2>,
          p: ({ children }) => <p className="my-4 text-foreground/90">{children}</p>,
          ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-6 text-foreground/90">{children}</ul>,
          ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-6 text-foreground/90">{children}</ol>,
          a: ({ children, href }) => <a href={href} className="break-words text-cream underline underline-offset-4">{children}</a>,
          pre: ({ children }) => <pre className="my-6 overflow-x-auto rounded-lg border border-border bg-secondary p-4 text-sm">{children}</pre>,
          code: ({ children }) => <code className="break-words font-mono">{children}</code>,
          hr: () => <hr className="my-8 border-border" />,
          table: ({ children }) => <div className="my-6 overflow-x-auto"><table className="w-full border-collapse text-left text-sm">{children}</table></div>,
          th: ({ children }) => <th className="border-b border-border p-3 font-semibold">{children}</th>,
          td: ({ children }) => <td className="border-b border-border p-3 align-top">{children}</td>,
        }}>{text}</Markdown>
      </article>
    </PublicLayout>
  );
}