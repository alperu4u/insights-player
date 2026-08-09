# Castro Player Development Profile

A scenario-based soccer player development assessment for Castro Player Development.

The application uses 20 realistic soccer scenarios to generate an evidence-based report covering learning, communication, competition, team dynamics, and development priorities. Results are developmental guidance—not diagnoses or permanent labels.

## Local development

```bash
npm install
npm run dev
```

## Production configuration

Set these environment variables in Vercel after deploying the Google Apps Script web app:

- `GOOGLE_APPS_SCRIPT_URL`
- `GOOGLE_APPS_SCRIPT_TOKEN`

The Apps Script integration in `integrations/google-apps-script.gs` stores submissions in Google Sheets and sends family and coach notifications.

## Deploy

This repository is configured for Next.js deployment on Vercel. Pushes to `main` deploy automatically after the Git integration is enabled.

<!-- Deployment trigger: activate submission diagnostics after Git integration. -->
