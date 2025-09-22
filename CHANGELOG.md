# Changelog
Todas as mudanças importantes deste projeto serão documentadas aqui.

O formato segue **Keep a Changelog** e este projeto adere ao **Semantic Versioning**.

## [Unreleased]

## [0.2.0] - 2025-09-19
### Added
- **Navbar** fixada no topo com logo e controles.
- **Painel de PAT (GitHub Personal Access Token)** com salvar/limpar e feedback visual.
- **Indicador de rate limit** (restantes/limite) usando `x-ratelimit-*`.
- **Ações rápidas**: “**Limpar filtros**” (reset seguro) e “**Copiar link**”.
- **Atalhos de teclado**: `⌘/Ctrl + K` (foco na busca), `Esc` (limpa), `←`/`→` (paginação).
- **Sincronização com URL (deep-linking)** de `q`, `lang`, `sort`, `order`, `per_page`, `page`.
- **Estados de UI**: inicial vazio, vazio para consulta sem resultados, erro (com dica de 403).
- **Acessibilidade**: skip-link para resultados, `aria-live`, foco no heading de resultados, `aria-current` em paginação, `aria-disabled` coerente.
- **Responsividade**: layout fluido até 960px, melhor espaçamento e ação em mobile.

### Changed
- Estrutura dos **resultados**: `<h2 id="results-heading" />` semântico e focável após carregamento.
- **Controles de ordenação** (`order`) só aparecem quando `sort !== "best"`.
- **Leitura de parâmetros** via _clamp_ determinístico (sem fontes de entropia no SSR).
- Ajustes de **deps** em efeitos para estabilidade e menor retrigger.

### Fixed
- **Hydration mismatches** (ex.: `disabled`, textos e elementos que variavam antes do mount).
- **Over-fetch** em paginação (chamadas a mais de `fetch` ao avançar página).
- Tratamento correto de **403 rate-limit** com mensagem e dica de uso de PAT.
- Testes estáveis: busca, filtros, paginação, header `Authorization`, estados de erro/empty.
- **ESLint + TS**: remoção de `any`, regras de hooks, config flat do ESLint, `next-env.d.ts`.

### Performance
- **Debounce (500ms)** + `useTransition` no `setQuery` → digitação fluida.
- **AbortController** para cancelar requisições anteriores.
- **Memoização** de `requestUrl`, janela de páginas e totais.

### Removed
- **Saved/Favorites**: removido (temporariamente) para eliminar causas de inconsistência de hidratação. Pode voltar em uma versão futura com abordagem SSR-safe.

### Tests
- Vitest + Testing Library cobrindo:
  - Atualização de URL ao buscar.
  - Filtro de linguagem reseta página.
  - Paginação (sem over-fetch).
  - Header `Authorization: Bearer` quando há PAT.
  - Estados de erro (403) e empty.

### Chore
- **ESLint 9 (flat config)** e ajustes nas regras.
- `useUserPrefs`: persistência e estado alinhados (sem depender de retorno de `writePrefs`).
- Padronização de importações e pequenas melhorias tipadas.

### Release commit (sugestão)

chore(release): v0.2.0 – stable search, SSR-safe, PAT support, a11y & tests


## [0.1.0] - 2025-09-18
### Added
- Primeira versão funcional: busca de repositórios com filtros (termo, linguagem, sort, order, per_page) e **paginação**.
- **RepoCard** com dados principais, **Controls** de busca, e **Footer**.
- Hooks utilitários: `useDebouncedValue`, helpers `buildSearchQ`, `pageWindow`, `formatDate`.

---

[Unreleased]: https://github.com/gabrielbagon/github-repo-search/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/gabrielbagon/github-repo-search/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/gabrielbagon/github-repo-search/releases/tag/v0.1.0
