# FRB Medicaid Landing Page (Draft)

Medicaid ads landing page for Falcon Rappaport & Berkman LLP, built from the ai.frblaw.com template
(plain HTML/CSS/JS, no build step — open `index.html` in a browser to preview).

## Status: DRAFT
- Text highlighted in yellow (`class="ph"`) is placeholder copy. Replace it with approved content from
  https://frblaw.com/frb-medicaid/ before launch.
- Attorney cards, headshots, and the contact email are still placeholders.
- `<meta name="robots">` is set to `noindex, nofollow`. Change to `index, follow` at launch.
- Remove the yellow "DRAFT" banner (`.draft-banner` in `index.html`) and the draft helper CSS at the end of `css/styles.css` at launch.
- The contact form submits to the same HubSpot form as ai.frblaw.com (see `js/main.js`), and Google Tag Manager is included.

## Hosting
Intended to deploy on Vercel the same way as ai.frblaw.com (Vercel → Add New → Project → this repository).
Domain (e.g. a subdomain or a redirect from frblaw.com/medicaid-attorneys/) is TBD.
