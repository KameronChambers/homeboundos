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

## Architecture rules
- AI calls go through server functions in src/lib/ai.functions.ts using the GEMMA_API_KEY secret (Google AI Studio); never call AI from the browser — keeps the key private.
- Demo state (tickets, passport notes, dispatch) lives in a React context persisted to localStorage (src/lib/care-store.tsx) — no backend yet; syncs across tabs via the storage event.
- Pure business rules (sorting, tracker timeline, HCPCS codes) live in src/lib/care-data.ts with tests in src/test — keep them side-effect free.
