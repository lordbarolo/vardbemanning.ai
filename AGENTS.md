<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Public content pages share `PublicLayout` for consistent navigation and footer; authored policy/instructions live as markdown rendered by `MarkdownPage`.
- Compensation lookups are classified before display: only one exact row is a direct result; candidate choices re-query canonical RPC names to avoid showing unconfirmed amounts.
- Analytics loads dynamically from client effects/handlers and uses allowlisted catalogue metadata; failures must never affect the user flow.
