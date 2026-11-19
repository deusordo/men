# MEN · Men’s Everlasting Nation

A one-page GitHub Pages site and membership inquiry form built with HTML, CSS, and vanilla JavaScript.

- `index.html` contains the landing page, form, and Formspree configuration.
- `styles.css` controls the layout and responsive styles.
- `site.js` handles opening, closing, focus, city suggestions, validation, and AJAX requests.
- `us-places-2025.json` contains place names grouped by state from the [2025 U.S. Census Gazetteer national places file](https://www.census.gov/geographies/reference-files/2025/geo/gazetter-file.html). The form loads this file after the visitor starts typing a city. Visitors can enter a city manually.
- `men-logo.jpg` is the supplied artwork with personal metadata removed. `mark.svg` is the existing favicon.

## Preview locally

From the project directory, run `python3 -m http.server 8000 --bind 127.0.0.1`. Open <http://127.0.0.1:8000/>. The form opens with **Join the Brotherhood** and closes with **×** or Escape.

## Configure Formspree

1. Create a dedicated form titled **MEN — New Membership Request** in Formspree. Configure notifications for the intended inbox in the Formspree dashboard.
2. Copy the form ID from the endpoint shown by Formspree. In `index.html`, set `data-formspree-form-id=""` on `#interest-form` to that ID. Keep this blank until the dedicated form is ready. The personal site’s ID is blocked.
3. The form captures name, email, required phone number, state, city, participation interest, reason, and an explicit yes/no update preference. Submissions also include the combined `location` field in City, State format. The required `membership_interest` field sends Member, Builder, or Founder. For custom notification templates, include `{{ membership_interest }}` and verify it in a test email. The checkbox starts unchecked. A request is an inquiry and stays subject to review.
4. The form uses Formspree’s [honeypot field](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering). Keep Formspree’s spam filtering enabled.

Never place an inbox address, API key, or applicant data in this repository.

## Test

With the ID blank, open the form. It should show the online availability message and disable submissions. To test success and errors without sending a request, use a temporary copy with a dummy ID and intercept the Formspree request in your browser test. Check that state selection reveals City, changing state clears the city and suggestions, a manual city is accepted, and an empty phone number or participation choice fails validation, each participation interest is included in the request, consent starts unchecked, the success message is announced, and data stays in the fields on error.

After the dedicated form and inbox are configured, send one clearly labeled test through the published site. Check the confirmation, Formspree dashboard, and notification inbox.

## Deploy or update

The publishing source is the root of the `main` branch in [deusordo/men](https://github.com/deusordo/men). Commit site changes to `main`, wait for the GitHub Pages build, then check the [public site](https://deusordo.github.io/men/). Keep asset paths relative. When `styles.css` or `site.js` changes, update its version query in `index.html` so browsers fetch the new file.
