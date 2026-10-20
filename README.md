# Financial Analytics Dashboard — 2025 prototype

> Historical React/Vite prototype. This is a demonstration of UI and data-visualization exploration, **not** a complete finance product or maintained production application. For current work see [my profile](https://github.com/yotamon) and [professional portfolio](https://cart-shift.com/en/yotam).

## What the source contains

- React 18, TypeScript, Vite, Material UI and chart/visualization libraries.
- A dashboard route plus settings, export and diagnostics pages.
- Global contexts for themes, localization, configuration, data and currency.
- Upload/export-related components and dependencies; individual file formats and workflows must be verified before being described as end-to-end supported.

**Important scope limitation:** `src/App.tsx` explicitly renders **under-construction placeholders** for transactions, accounts, categories, budgets, reports and import routes. These should not be presented as completed features.

## Explore locally

```bash
git clone https://github.com/yotamon/finance-analytics-dashboard.git
cd finance-analytics-dashboard
npm install
npm run dev
```

The declared build is `npm run build`; `npm run type-check` and `npm run lint` are available. This historical dependency tree was **not re-tested** as part of this documentation update.

## Engineering status

This repo is retained as an early UI/analytics experiment. It has no claim of verified real financial data integrations, production-grade security, complete features or deployment readiness.

If you want evidence of shipped products and engineering decisions, start with [CartShift](https://github.com/CartShift/CartShift-Studio), [Wake My Way](https://github.com/yotamon/WakeMyWay) or [Liquid Loom](https://github.com/yotamon/Liquid-Loom).
