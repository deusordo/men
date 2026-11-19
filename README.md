# MEN · Men’s Everlasting Nation

A single static landing page with an interest form. There are no build dependencies. The site is independent of the owner's personal website.

## Preview locally

From the project directory, run `python3 -m http.server 8000 --bind 127.0.0.1` and visit <http://localhost:8000> in Safari.

The form is initially closed. “Join the Brotherhood” opens it. Full name and email are required; phone and message are optional. The form uses the same Formspree endpoint as the personal site. It includes a MEN-specific subject field to identify interest submissions. The JavaScript client adds the Formspree action and shows inline sending, success, and failure states. It is an expression of interest, not membership enrollment, a sale, or a newsletter signup.

Do not use real contact details for testing. Intercept the network request or replace the action with a test endpoint before attempting a test, as a real submission can send notifications.

## GitHub Pages

Serve the files from the root of the `main` branch in `deusordo/men`. The public URL is <https://deusordo.github.io/men/>. The repository contains no API key or stored submissions.
