# Singulai Design System

> Angular 20 · Standalone Components · Signals · Neumorphic

[![Live Showcase](https://img.shields.io/badge/showcase-design.singulai.ai-2563EB)](https://design.singulai.ai)
[![Status](https://img.shields.io/badge/status-pre--1.0-F59E0B)](#status)
[![License](https://img.shields.io/badge/license-MIT-22C55E)](./LICENSE)
[![Stack](https://img.shields.io/badge/Angular-20-DD0031?logo=angular&logoColor=white)](https://angular.dev)
[![MCP Server](https://img.shields.io/npm/v/@dgplsoares/singulai-ui-mcp?label=MCP%20server&color=6E40C9)](https://www.npmjs.com/package/@dgplsoares/singulai-ui-mcp)

![Singulai Design System Showcase](./docs/showcase.png)

Design System open source para Angular 20, construído com **Standalone Components**, **Signals** e estética **neumorphic**. Nasceu da necessidade de refatorar uma plataforma SaaS multi-tenant com identidade visual consistente, e está sendo extraído gradualmente para uso público.

🌐 **Live showcase:** [design.singulai.ai](https://design.singulai.ai)

---

## 🚧 Status: Pre-1.0

Este é um **mirror read-only** do desenvolvimento ativo no monorepo Singulai. A API ainda está em estabilização — novos `@Input` aparecem conforme refatoramos telas reais e descobrimos lacunas.

**Não recomendado para produção alheia ainda.** Use como referência, fork ou estudo. Quando atingir v1.0, este repositório passa a aceitar PRs e ganha publicação no NPM + MCP server.

| Marco | Status |
|---|---|
| Componentes core (15 componentes) | ✅ |
| Mobile responsive (DS-2.1) | ✅ |
| Split-ready (assets brandados configuráveis via `@Input`) | ✅ |
| Mirror automatizado para repo público | ✅ |
| README + LICENSE + topics | ✅ |
| **MCP server (consulta via Claude / Cursor / Continue)** | ✅ [`@dgplsoares/singulai-ui-mcp`](https://www.npmjs.com/package/@dgplsoares/singulai-ui-mcp) |
| NPM publish do package principal (DS Angular) | 🟡 pendente |
| Documentação por componente (Storybook ou similar) | 🟡 pendente |
| Tag v1.0 + contribuição externa habilitada | 🟡 pendente |

---

## 🤖 Use com AI agents (MCP server)

Este DS expõe um [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) server público — qualquer AI agent compatível (**Claude Desktop**, **Claude Code**, **Cursor**, **Continue**) pode consultar o catálogo via tools padronizadas:

- _"Quais componentes existem?"_ → tool retorna catálogo completo
- _"Componente para botão com loading?"_ → tool retorna `<ds-button>` + props + exemplo
- _"Quais @Input em `<ds-form-field>`?"_ → tool retorna lista tipada

### Instalação rápida

**Claude Code** (`~/.claude.json` via CLI):
```bash
claude mcp add --scope user singulai-ui -- npx -y @dgplsoares/singulai-ui-mcp
```

**Claude Desktop** (`claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "singulai-ui": {
      "command": "npx",
      "args": ["-y", "@dgplsoares/singulai-ui-mcp"]
    }
  }
}
```

**Cursor / Continue / outros clientes MCP:** instruções completas em [github.com/dgplsoares/singulai-ui-mcp](https://github.com/dgplsoares/singulai-ui-mcp).

---

## ✨ Componentes

```typescript
import {
  AiAssistantPanelComponent,
  ButtonComponent,
  CardComponent,
  CardPanelComponent,
  DarkModeButtonComponent,
  FormFieldComponent,
  IconNeumorphicComponent,
  NavFooterComponent,
  NotificationsButtonComponent,
  PageHeaderComponent,
  PageLayoutComponent,
  SegmentedTabsComponent,
  SidebarLeftNavComponent,
  StatsbarCardComponent,
  AiAssistantButtonComponent,
} from '@singulai/design-system'; // exemplo — pacote npm não publicado ainda
```

### Catálogo

| Componente | Função |
|---|---|
| `<ds-button>` | Botão unificado com 8 variants de cor, ícones left/right, estados loading/disabled |
| `<ds-card>` + `<ds-card-panel>` | Containers genéricos + painéis de slots |
| `<ds-form-field>` | Campo de formulário (text, textarea, select, toggle, search) com ControlValueAccessor |
| `<ds-icon-neumorphic>` | Ícone em moldura neumorphic (3 sizes, 7 variants de cor) |
| `<ds-page-layout>` | Skeleton de tela autenticada (sidebar + header + main + nav-footer mobile) |
| `<ds-page-header>` | Header sticky com breadcrumbs + actions slot |
| `<ds-sidebar-left-nav>` | Sidebar collapse/expand com submenus, persistência em localStorage |
| `<ds-nav-footer>` | Nav inferior mobile com 5 botões + painéis projetáveis |
| `<ds-segmented-tabs>` | Tabs segmentados com items closable e radius dinâmico |
| `<ds-statsbar-card>` | Card de KPI com delta + ícone neumorphic |
| `<ds-ai-assistant-panel>` + `<ds-ai-assistant-button>` | Painel lateral de Agente IA com tabs, mensagens, prompts |
| `<ds-dark-mode-button>` | Toggle de tema (composite SVG neumorphic) |
| `<ds-notifications-button>` | Sino com dropdown de notificações |

Cada componente é **standalone** (não requer módulo), usa **signals** para state e expõe `@Input` opcionais para customização de assets brandados — isso permite consumir o DS em apps com identidade visual diferente sem fork.

---

## 🎨 Princípios de design

- **Neumorphic sutil** — sombras duplas (luz + sombra) em superfícies claras, evitando o "neumorphism gritante" típico de 2020
- **Mobile-first com `100dvh`** — viewport dinâmico, `overscroll-behavior: none`, app-feel real em Android Chrome
- **Tokens em CSS variables** — temas trocáveis sem rebuild
- **Aspect ratio explícito em SVGs** — todo `<img>` recebe `width` e `height` HTML attrs para evitar render distorcido em mobile

---

## 🛠 Stack

- **[Angular 20](https://angular.dev)** com standalone components + signals
- **[@ng-icons/heroicons](https://github.com/ng-icons/ng-icons)** para iconografia
- **SCSS** com tokens em CSS variables (sem Tailwind dentro do DS)
- **Manrope** + **Plus Jakarta Sans** como fontes principais

---

## 🔗 Como funciona o mirror

Este repositório é gerado automaticamente via `git subtree split` a partir do diretório `frontend/src/design-system/` do monorepo Singulai. A cada commit em `main` que toca neste diretório, um GitHub Action espelha o conteúdo aqui.

- **Histórico:** apenas commits que tocaram em design-system (sem ruído do monorepo)
- **Autoria:** preservada por commit (force push é só mecânica do mirror)
- **PRs neste repositório:** ficam abertos sem merge até v1.0 — discussões e issues são bem-vindos

---

## 📜 License

[MIT](./LICENSE) — use, modifique, distribua livremente. Crédito é apreciado mas não obrigatório.

---

## 👤 Autor

Construído por **[Diogo Soares](https://www.linkedin.com/in/dgsoares/)** durante a evolução da plataforma [Singulai](https://singulai.ai) (SaaS de cursos online com IA, multi-tenant).

- LinkedIn: [@dgsoares](https://www.linkedin.com/in/dgsoares/)
- GitHub: [@dgplsoares](https://github.com/dgplsoares)

---

## 🗺 Roadmap público

| Fase | Estado |
|---|---|
| **Showcase pública** ([design.singulai.ai](https://design.singulai.ai)) | ✅ |
| **Mirror automatizado** (este repositório) | ✅ |
| **README + LICENSE + topics** | ✅ |
| **MCP server** ([`@dgplsoares/singulai-ui-mcp`](https://www.npmjs.com/package/@dgplsoares/singulai-ui-mcp)) | ✅ |
| **Posts de lançamento** (LinkedIn, dev.to, Reddit) | 🟡 |
| **NPM publish do package principal** (após API estabilizar) | 🟡 |
| **Documentação por componente** (Storybook ou alternativa) | 🟡 |
| **Tag v1.0** + PRs externos habilitados | 🟡 |

---

> _Made with care in 🇧🇷._
