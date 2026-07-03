# Secure Edge — Dashboard Overview

React 18 + Vite + Tailwind recreation of the Figma dashboard (Dashboard Overview /
Fraud Detection Trend screens), built to match your screenshots exactly.

## Run it

```bash
npm install
npm run dev
```

Open the printed localhost URL. This project was scaffolded offline (no network access
in the build sandbox), so `npm install` has not been run yet — do that first.

## File map

```
src/
  App.jsx                       page layout / grid
  index.css                     Tailwind entry + font
  components/
    Sidebar.jsx                 nav, active red bar + arc, logout
    Header.jsx                  title, search, bell badge, avatar
    StatCards.jsx                5 KPI cards
    TransactionMonitoring.jsx   area chart + "Suspected Fraud" callout
    FraudDetectType.jsx         donut chart + legend
    FraudDetectionTrend.jsx     bar chart (Fraud Alert / Blocked Transaction)
    AlertFeed.jsx                Real Time Alert Feed list
    RecentTransactions.jsx      table + pagination + export/filter row
tailwind.config.js               brand color tokens (brand-red, brand-blue, etc.)
```

## Things to swap in for a pixel-perfect final pass

- **Avatar image** (`Header.jsx`): currently a placeholder avatar from dicebear.com.
  Replace `src` with the real headshot.
- **Sidebar arc** (`Sidebar.jsx`): a CSS ring approximating the bleed-off circle behind
  "Dashboard". If you export the exact circle from Figma (radius, stroke width, opacity,
  exact offset), tell me the numbers and I'll match to the pixel.
- **Colors**: all brand colors live in `tailwind.config.js` under `theme.extend.colors.brand`.
  If you paste Figma Dev Mode's hex values I'll swap them in directly — right now they're
  my closest reads off your screenshots (e.g. `brand.red = #F0424F`, `brand.blue = #4C7EF3`).
- **Fonts**: Inter is loaded via Google Fonts in `index.html`. If Figma specifies a
  different family (e.g. Poppins, Manrope), tell me and I'll swap the `<link>` and
  `tailwind.config.js` `fontFamily.sans`.
