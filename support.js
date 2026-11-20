"use strict";

(() => {
  const form = document.getElementById("support-form");
  const disclosure = document.getElementById("support-details");
  const status = document.getElementById("support-status");
  const formId = document.getElementById("interest-form")?.dataset.formspreeFormId?.trim() ?? "";
  if (!form || !/^[a-z0-9]+$/i.test(formId) || typeof window.fetch !== "function") return;

  const endpoint = `https://formspree.io/f/${formId.toLowerCase()}`;
  const submit = form.querySelector('button[type="submit"]');
  const requiredText = form.querySelectorAll('input[type="text"][required], textarea[required]');
  let sending = false;

  function showStatus(state, message) {
    status.dataset.state = state;
    status.textContent = message;
  }

  for (const field of requiredText) {
    field.addEventListener("input", () => field.setCustomValidity(""));
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;

    for (const field of requiredText) {
      field.setCustomValidity(field.value.trim() ? "" : "Please enter a response.");
    }
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    for (const [name, value] of data) {
      data.set(name, value.trim());
    }
    for (const name of ["region", "supporting_information"]) {
      if (!data.get(name)) data.delete(name);
    }

    sending = true;
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    showStatus("pending", "Sending your request…");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
        signal: controller.signal
      });
      if (!response.ok) {
        showStatus("error", "We couldn’t accept your request. Your entries are still here. Please check them and try again.");
        return;
      }

      form.reset();
      showStatus("success", "We received your request for review. We’ll use your email address if we need more information or can follow up.");
      if (disclosure.open) status.focus();
    } catch {
      showStatus("error", "We couldn’t confirm your request was sent. Your entries are still here. Please check your connection before trying again.");
    } finally {
      window.clearTimeout(timeout);
      sending = false;
      submit.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });

  status.textContent = "";
  submit.disabled = false;
})();
