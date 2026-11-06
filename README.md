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
| **Reorder sections** | Move the lines in `components/SiteView.tsx`. |
| **Add a service / review / FAQ** | Copy one `{ ... },` block in the list and edit it. |
| **Booking button** | Paste your Vagaro / Boulevard / Mindbody / Square link into `contact.bookingUrl`. |
| **Contact form** | Paste a free [Formspree](https://formspree.io) endpoint into `contactSection.formAction`. If left empty, the form opens the visitor's email app. |
| **Google search text** | `brand.name`, `brand.tagline` and `brand.description`. |

**Tip:** if you mistype a setting (missing comma, wrong icon name), your code editor underlines it in red, and the dev page shows an error saying where.

## Files

```
site.config.ts          ← EDIT THIS: brand, colors, fonts, all copy
public/img/             logo, favicon, your photos
components/SiteView.tsx section order
app/layout.tsx          page head, applies colors & fonts
app/globals.css         design & layout
components/             header, form and each page section
lib/site-types.ts       describes the settings so mistakes get flagged
```

## Going live

Push the folder to GitHub and import it at [vercel.com](https://vercel.com) (free; made by the Next.js team). Netlify and most other hosts also support Next.js.

<!-- ADMIN -->

## Site Rebuilder (admin panel)

Turn a med spa's old website into a new site built on this template.

1. Copy `.env.example` to `.env.local` and add your `ANTHROPIC_API_KEY` (used for "Auto-fill with Claude").
2. Run `npm run dev` and open http://localhost:3000/admin.
3. Paste the client's current website address. The scraper visits up to 10 pages and collects their logo, photos, text, phone numbers, emails, address, hours, social and booking links, brand colors, and any reviews published on the site.
4. Click **✦ Auto-fill with Claude**. Claude sorts the text into the template's sections and polishes the wording, using only facts from their site (no made-up reviews, staff, prices or stats). Sections with no real content are hidden.
5. Fine-tune in the editor: every setting is editable, the **Scraped data** tab has one-click "Use" buttons, and the preview updates live (desktop, tablet, phone).
6. Click **Download site** for a zip of a standalone website with the client's settings and photos built in. Unzip it, run `npm install`, push it to GitHub and deploy it on Vercel.

Notes:
- Client drafts are saved as JSON files in `data/projects/`, which is not committed to git.
- The admin panel is meant to run on your own computer. If you deploy this repo, `/admin` is switched off unless you set `ADMIN_PASSWORD`. Drafts are saved to local files, so they won't persist on hosts like Vercel.
- Sites that load all their content with JavaScript may scrape partially. You can fill gaps by hand in the editor.
- Only rebuild sites for clients who have hired you to, and make sure you have the right to reuse their photos and text.

Admin code lives in `app/admin`, `app/api/admin`, `app/preview`, `components/admin`, `lib/admin` and `proxy.ts`. None of it is included in exported client sites.

