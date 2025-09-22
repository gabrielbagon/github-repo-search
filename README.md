# GitHub Repo Search

Uma interface rápida, acessível e amigável ao teclado para buscar repositórios no **GitHub**, feita com **Next.js (App Router)** e **TypeScript**.  
A aplicação consome diretamente a **GitHub Search API**, aceita um **Personal Access Token (PAT)** opcional e mantém a URL sincronizada para facilitar o compartilhamento das buscas.

---

## ✨ Funcionalidades

- **Busca instantânea** com *debounce* de 500 ms + `useTransition` para digitação fluida
- **Filtros**: linguagem, ordenação (`best`, `stars`, `updated`), direção (`asc`/`desc` quando aplicável) e resultados por página
- **Paginação** com janela compacta (ex.: `… 3 4 [5] 6 7 …`)
- **Deep-linking**: a URL reflete `q`, `lang`, `sort`, `order`, `per_page`, `page`
- **Preferências no cliente**: `sort`, `order`, `perPage`, `language` persistem no `localStorage` (com *clamping*/validação)
- **Painel de PAT (opcional)**: aumenta limites de *rate* sem precisar de backend
- **Ações rápidas**: **Limpar filtros** e **Copiar link** da busca atual
- **Estados polidos**: *skeleton* ao carregar, *empty states* (inicial e sem resultados) e mensagens de erro claras (com dica para 403)
- **Acessibilidade**: *skip link*, ARIA, restaura foco no título dos resultados e *shortcuts* (⌘K/Ctrl+K, Esc, ←/→)
- **Responsivo**: navbar fixa, controles compactos e layout confortável do mobile ao desktop

> ℹ️ A antiga feature de “buscas salvas” foi **removida** para manter o build enxuto e sem riscos de *hydration mismatch*.

---

## 🧱 Stack

- **Next.js** (App Router) + **React**
- **TypeScript**
- **Vitest** + **@testing-library/react**
- **Tailwind CSS**

---

## 🚀 Como rodar

```bash
# 1) Instale as dependências
npm install
# ou: pnpm install / yarn

# 2) Dev server
npm run dev

# 3) Testes
npm test

Abra http://localhost:3000

🔐 Usando um PAT do GitHub (opcional)

O uso anônimo da Search API tem limites baixos. Para ampliá-los:

Crie um Personal Access Token no GitHub (pode ser classic ou fine-grained para dados públicos).

Na app, abra o painel PAT (navbar) e cole seu token.

O token fica apenas no navegador (opcionalmente salvo em localStorage).

As requisições passam a incluir Authorization: Bearer <PAT>.

Você pode removê-lo a qualquer momento.

🧭 Como usar

Digite no campo de busca (ex.: react, next, aem).

(Opcional) Selecione uma linguagem (TypeScript, JS, Python…).

Mude ordenar para stars ou updated (a direção de ordenação aparece quando sort ≠ best).

Use ← / → para paginar, Esc para limpar a busca, ⌘K / Ctrl+K para focar o input.

Copiar link compartilha a busca atual.

Limpar filtros volta aos padrões (inclui reset de página).

🧩 Estrutura (alto nível)

src/
  app/
    page.tsx              # página principal (client)
  components/
    Navbar.tsx
    Controls.tsx
    RepoCard.tsx
    PatControl.tsx
    Footer.tsx
  lib/
    buildSearchQ.ts       # monta a query da GitHub API
    pageWindow.ts         # janela de paginação
    useDebouncedValue.ts
    usePatToken.ts
    prefs.ts              # ler/gravar/validar prefs no localStorage
  types/
    github.ts             # tipos da API
tests (vitest)

🧪 Testes

npm test

Cobertura atual (principais):

- montador de query, formatação de data, janela de paginação

- hooks (useDebouncedValue, usePatToken)

- componentes (Controls, RepoCard, Navbar)

- integration da página (URL sync, filtros, paginação, erros/empty)

⚙️ Configuração

- Feature flags em @/config (ex.: habilitar/desabilitar PAT).

- Preferências do usuário persistem em localStorage via prefs.ts (com clamping para garantir valores válidos).

⚡ Performance

- Debounce de 500 ms + useTransition mantêm a digitação fluida durante fetches

- Cancela requisições em andamento com AbortController ao alterar filtros

- useMemo para URL de busca e janela de paginação, evitando re-renders desnecessários

♿ Acessibilidade

- Skip link (“Pular para resultados”)

- Foco retorna ao heading de resultados após o carregamento

- Uso de aria-label, aria-current, aria-disabled etc.

- Shortcuts: ⌘K/Ctrl+K (foco), Esc (limpa), ←/→ (paginam)

🧰 Troubleshooting

- Hydration mismatch: UI dependente de window, navigator ou tempo real é protegida por flags de montagem (ex.: não renderizar disabled dinâmico no SSR). Ao criar novos componentes com dados do cliente, gateie-os por mounted.

- Erro 403 (rate limit): use um PAT. O status mostra restantes/limite e, quando possível, o horário de reset.

📌 Roadmap (ideias)

Cache local de páginas recentes

Infinite scroll opcional

Filtros avançados (licença, tópicos, arquivados)

Exportar resultados (CSV/JSON)

📝 Licença

MIT — use e adapte à vontade.
