"use strict";

const form = document.querySelector("#interest-form");
const status = document.querySelector("#form-status");
const submit = form.querySelector("button[type=submit]");

function showStatus(state, message) {
  status.dataset.state = state;
  status.textContent = message;
}

const endpoint = form.dataset.formspreeEndpoint;
if (typeof window.fetch === "function" && /^https:\/\/formspree\.io\/f\/[a-z0-9]+$/i.test(endpoint)) {
  form.action = endpoint;
  submit.disabled = false;
  showStatus("", "");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled || !form.checkValidity()) return;
    const data = new FormData(form);
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    showStatus("pending", "Sending…");
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        showStatus("error", "Your message wasn’t accepted. Please try again in a moment.");
        return;
      }
      form.reset();
      showStatus("success", "Thanks for reaching out. Your interest was sent.");
    } catch {
      showStatus("error", "We couldn’t confirm that your message was sent. Please check your connection before trying again.");
    } finally {
      submit.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
} else {
  form.addEventListener("submit", (event) => event.preventDefault());
}
