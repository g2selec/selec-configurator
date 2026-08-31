# Selec PLC Configurator

React + Vite + Tailwind. Single-page configurator for MiBRX, TWIX, DIGIX, and MM303X product families.

## Setup

```bash
npm install
```

Create a `.env` file in the project root (never commit this):

```
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec
```

```bash
npm run dev       # development
npm run build     # production build → dist/
```

## Deploy to Vercel

Push to GitHub. On Vercel:
- Import the repo
- Add environment variable: `VITE_APPS_SCRIPT_URL` = your Apps Script URL
- Deploy

## Data capture

- **Requirements sheet** — captured anonymously on every "Find Configurations"
- **Leads sheet** — captured when user submits name + email via "Email me this configuration"

## MRP

All prices are indicative MRP FY 2026-27. Update `src/data/products.js` when prices change.
