# Med Spa Website Template (Next.js)

A one-page med spa website. **Everything you'd want to change lives in one file: `site.config.ts`.**

## Run it

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. While it's running, saving `site.config.ts` updates the page instantly.

## Quick customizing

| To change… | Do this in `site.config.ts` |
|---|---|
| **Logo** | Put your logo in `public/img/` and set `brand.logo: "/img/your-logo.png"`. Adjust `logoHeight` to resize. Set `logo: ""` to show your business name as text. |
| **Colors** | Edit the hex codes under `colors`. `primary` is the main brand color (buttons, highlights). |
| **Fonts** | Type any [Google Font](https://fonts.google.com) name under `fonts`. |
| **Text** | Every headline, paragraph and button label is in the file, grouped by section. |
| **Photos** | Put images in `public/img/` and set `hero.image`, `about.image`, or a team member's `photo` (e.g. `"/img/hero.jpg"`). Empty = soft color placeholder. Photos are resized and optimized automatically. |
| **Hide a section** | Set `show: false` on it. |
| **Reorder sections** | Move the lines in `app/page.tsx`. |
| **Add a service / review / FAQ** | Copy one `{ ... },` block in the list and edit it. |
| **Booking button** | Paste your Vagaro / Boulevard / Mindbody / Square link into `contact.bookingUrl`. |
| **Contact form** | Paste a free [Formspree](https://formspree.io) endpoint into `contactSection.formAction`. If left empty, the form opens the visitor's email app. |
| **Google search text** | `brand.name`, `brand.tagline` and `brand.description`. |

**Tip:** if you mistype a setting (missing comma, wrong icon name), your code editor underlines it in red, and the dev page shows an error saying where.

## Files

```
site.config.ts          ← EDIT THIS: brand, colors, fonts, all copy
public/img/             logo, favicon, your photos
app/page.tsx            section order
app/layout.tsx          page head, applies colors & fonts
app/globals.css         design & layout
components/             header, form and each page section
lib/site-types.ts       describes the settings so mistakes get flagged
```

## Going live

Push the folder to GitHub and import it at [vercel.com](https://vercel.com) (free; made by the Next.js team). Netlify and most other hosts also support Next.js.
