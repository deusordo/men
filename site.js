"use strict";

const openJoin = document.querySelector("#open-join");
const closeJoin = document.querySelector("#close-join");
const panel = document.querySelector("#join-panel");
const form = document.querySelector("#interest-form");
const submit = form.querySelector('button[type="submit"]');
const status = document.querySelector("#form-status");

function setPanelOpen(isOpen) {
  panel.hidden = !isOpen;
  openJoin.setAttribute("aria-expanded", String(isOpen));
  (isOpen ? form.elements.name : openJoin).focus();
}

openJoin.addEventListener("click", () => setPanelOpen(panel.hidden));
closeJoin.addEventListener("click", () => setPanelOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || panel.hidden || event.defaultPrevented) return;
  event.preventDefault();
  setPanelOpen(false);
});
openJoin.hidden = false;

function showStatus(state, message, title) {
  const paragraph = document.createElement("p");
  paragraph.textContent = message;
  status.dataset.state = state;
  if (title) {
    const heading = document.createElement("strong");
    heading.textContent = title;
    status.replaceChildren(heading, paragraph);
  } else {
    status.replaceChildren(paragraph);
  }
}

const formId = form.dataset.formspreeFormId.trim().toLowerCase();
// The personal site’s form ID is explicitly excluded.
const isConfigured = /^[a-z0-9]+$/.test(formId) &&
  formId !== "xwloqyor" && typeof window.fetch === "function";
const endpoint = isConfigured ? `https://formspree.io/f/${formId}` : null;
let sending = false;

if (endpoint) {
  submit.disabled = false;
  status.replaceChildren();
}

const requiredText = [
  [form.elements.name, "Enter your full name."],
  [form.elements.location, "Enter your city, state or region, and country."],
  [form.elements.message, "Tell us why you want to join."]
];

for (const [field] of requiredText) {
  field.addEventListener("input", () => field.setCustomValidity(""));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!endpoint || sending) return;

  for (const [field, message] of requiredText) {
    field.setCustomValidity(field.value.trim() ? "" : message);
  }
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  data.set("updates_consent", form.elements.updates_consent.checked ? "yes" : "no");
  sending = true;
  submit.disabled = true;
  form.setAttribute("aria-busy", "true");
  showStatus("pending", "Sending your request…");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" }
    });
    if (!response.ok) {
      showStatus("error", "Your request could not be accepted. Please check your entries and try again.");
      return;
    }

    form.reset();
    showStatus(
      "success",
      "Thank you for your interest in MEN. Your request has been received. We’ll be in touch about the next steps.",
      "Request Received"
    );
  } catch {
    showStatus("error", "We couldn’t confirm that your request was sent. Please check your connection before trying again.");
  } finally {
    sending = false;
    submit.disabled = false;
    form.removeAttribute("aria-busy");
  }
});
