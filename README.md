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

1. MEN currently shares VA’s Formspree form. MEN requests include the subject **MEN — New Membership Request**. Manage the shared inbox notifications in Formspree.
2. To change endpoints, update the public ID in `data-formspree-form-id` on `#interest-form` in `index.html`. Leave it blank to disable submissions.
3. The form captures first name, last name, email, required phone number, state, city, participation interest, reason, and an explicit yes/no update preference. Submissions also include a combined `name` field for existing notifications and the combined `location` field in City, State format. The required `membership_interest` field sends Member, Builder, or Founder. For custom notification templates, include `{{ membership_interest }}` and verify it in a test email. The checkbox starts unchecked. A request is an inquiry and stays subject to review.
4. The form uses Formspree’s [honeypot field](https://help.formspree.io/articles/building-your-form/honeypot-spam-filtering). Keep Formspree’s spam filtering enabled.

Never place an inbox address, API key, or applicant data in this repository.

## Test

With the ID blank, open the form. It should show the online availability message and disable submissions. To test success and errors without sending a request, intercept the Formspree request in your browser test. Check that state selection reveals City, changing state clears the city and suggestions, a manual city is accepted, and an empty phone number or participation choice fails validation, each participation interest is included in the request, consent starts unchecked, the success message is announced, and data stays in the fields on error.

To verify delivery, send one clearly labeled test through the published site. Check the confirmation, Formspree dashboard, and notification inbox.

## Deploy or update

The publishing source is the root of the `main` branch in [deusordo/men](https://github.com/deusordo/men). Commit site changes to `main`, wait for the GitHub Pages build, then check the [public site](https://deusordo.github.io/men/). Keep asset paths relative. When `styles.css` or `site.js` changes, update its version query in `index.html` so browsers fetch the new file.
