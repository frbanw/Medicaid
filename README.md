# FRB Medicaid Landing Page

Medicaid ads landing page for Falcon Rappaport & Berkman LLP, built from the ai.frblaw.com template
(plain HTML/CSS/JS, no build step — open `index.html` in a browser to preview).

Content comes from the existing Unbounce page at https://frblaw.com/frb-medicaid/.

## Notes
- `<meta name="robots">` is `noindex, nofollow` (same as the current Unbounce ad page). Change it if the page should appear in search.
- The contact form is the same one used on ai.frblaw.com and submits to the same HubSpot form (`js/main.js`).
- Google Tag Manager (GTM-5VVZ3BC) and HubSpot tracking (portal 49074578) are included.
- Attorney headshots come from frblaw.com/professionals.

## Hosting
Deploy on Vercel the same way as ai.frblaw.com (Vercel → Add New → Project → this repository).
Domain (subdomain, or a redirect from frblaw.com/medicaid-attorneys/) is TBD.
