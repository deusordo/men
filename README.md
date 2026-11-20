# DEUS ORDO

A one-page GitHub Pages site with membership inquiries and community support requests, built with HTML, CSS, and vanilla JavaScript.

- `index.html` contains the landing page, form, and Formspree configuration.
- `styles.css` controls the layout and responsive styles.
- `site.js` handles opening, closing, focus, city suggestions, validation, and AJAX requests.
- `support.js` handles validation and AJAX submission for the global community support form.
- `us-places-2025.json` contains place names grouped by state from the [2025 U.S. Census Gazetteer national places file](https://www.census.gov/geographies/reference-files/2025/geo/gazetter-file.html). The form loads this file after the visitor starts typing a city. Visitors can enter a city manually.
- `assets/deus-ordo/` contains the supplied logo artwork, favicon variants, and social preview. The hero uses `deus-ordo-logo-white.svg`.

## Preview locally

From the project directory, run `python3 -m http.server 8000 --bind 127.0.0.1`. Open <http://127.0.0.1:8000/>. Open the form with **Join the Brotherhood** or **Attend as a Guest**. The guest button selects Guest. Close it with **×** or Escape.

## Configure Formspree

1. DEUS ORDO shares VA’s Formspree form. Requests include the subject **DEUS ORDO — New Membership Request**. Review any inbox routing that matches the previous subject.
2. To change endpoints, update the public ID in `data-formspree-form-id` on `#interest-form` in `index.html`. Leave it blank to disable submissions.
3. The form captures first name, last name, email, optional phone number, state, city, participation interest, a message (optional for guests), and an explicit yes/no update preference. Submissions also include a combined `name` field for existing notifications and the combined `location` field in City, State format. The required `membership_interest` field sends Guest, Member, Builder, or Founder. The form displays the last choice as Chapter Founder. Treat Guest as a request for gathering information and track approved members separately. For custom notification templates, include `{{ membership_interest }}` and verify it in a test email. The checkbox starts unchecked. A request is an inquiry and stays subject to review.
4. The form uses Formspree’s [honeypot field](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering). Keep Formspree’s spam filtering enabled.
5. Community support uses the same form ID and sends **DEUS ORDO — Community Support Request** as its subject and `request_type=community_support` as a routing field. Route those requests separately from membership inquiries. Include the request type in any custom notification template that overrides the subject.

Never place an inbox address, API key, or applicant data in this repository.

## Test

With the ID blank, open the form and check that it shows the availability message and disables submissions. Intercept Formspree requests in browser tests. Check that both Join buttons select Member, the guest button selects Guest, changing state clears the city and suggestions, a manual city is accepted, phone is optional, and guests can leave the message blank. Check the participation values and subject in the request, unchecked consent by default, confirmation focus, and preservation of form data on error.

For community support, open the form from its disclosure. Check international city and country names, optional region and supporting information, the support request type and subject, and the review confirmation. Simulate a failed request and confirm that entries are preserved.

With the site owner’s permission, send one clearly labeled test through the published site to verify delivery. Check the confirmation, Formspree dashboard, and notification inbox.

## Deploy or update

The publishing source is the root of the `main` branch in [deusordo/men](https://github.com/deusordo/men). Commit site changes to `main`, wait for the GitHub Pages build, then check the [public site](https://deusordo.github.io/men/). Keep asset paths relative. When a stylesheet or script changes, update its version query in `index.html` so browsers fetch the new file.
