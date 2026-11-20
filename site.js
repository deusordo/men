"use strict";

const openJoin = document.querySelector("#open-join");
const openGuest = document.querySelector("#open-guest");
const closeJoin = document.querySelector("#close-join");
const panel = document.querySelector("#join-panel");
const panelTitle = document.querySelector("#join-title");
const panelCaption = panel.querySelector(".join-caption");
const form = document.querySelector("#interest-form");
const submit = form.querySelector('button[type="submit"]');
const status = document.querySelector("#form-status");
const confirmation = document.querySelector("#join-confirmation");
const confirmationLead = document.querySelector("#confirmation-lead");
const confirmationMessage = document.querySelector("#confirmation-message");
const confirmationMotto = confirmation.querySelector(".confirmation-motto");
const stateInput = form.elements.state;
const cityInput = form.elements.city;
const firstName = form.elements.first_name;
const lastName = form.elements.last_name;
const phone = form.elements.phone;
const participation = form.elements.membership_interest;
const messageInput = form.elements.message;
const phoneLabel = form.querySelector('label[for="phone"]');
const messageLabel = form.querySelector('label[for="message"]');
const participationReview = document.querySelector("#membership-review");
const membershipCopy = {
  title: panelTitle.textContent,
  question: messageLabel.textContent,
  placeholder: messageInput.placeholder,
  review: participationReview.textContent
};
const cityField = document.querySelector("#city-field");
const cityOptions = document.querySelector("#city-options");
const cityStatus = document.querySelector("#city-status");

let cityDirectory;
let cityRevision = 0;
let activeCity = -1;

function closeCityOptions() {
  cityRevision++;
  activeCity = -1;
  cityOptions.hidden = true;
  cityOptions.replaceChildren();
  cityInput.setAttribute("aria-expanded", "false");
  cityInput.removeAttribute("aria-activedescendant");
  cityStatus.textContent = "";
}

function syncCityField() {
  const hasState = Boolean(stateInput.value);
  cityField.hidden = !hasState;
  cityInput.disabled = !hasState;
  closeCityOptions();
}

stateInput.addEventListener("change", () => {
  cityInput.value = "";
  cityInput.setCustomValidity("");
  syncCityField();
});
syncCityField();

function citySearchKey(value) {
  return value.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
}

cityInput.addEventListener("input", async () => {
  closeCityOptions();
  const term = citySearchKey(cityInput.value.trim());
  if (!term || cityInput.disabled) return;

  const revision = cityRevision;
  cityDirectory ??= fetch(new URL("us-places-2025.json", document.baseURI))
    .then((response) => response.ok ? response.json() : null)
    .catch(() => null);
  const directory = await cityDirectory;
  if (revision !== cityRevision || document.activeElement !== cityInput) return;
  if (!directory) {
    cityStatus.textContent = "City suggestions are unavailable. You can enter your city manually.";
    return;
  }

  const prefixes = [];
  const otherMatches = [];
  for (const city of directory[stateInput.value] ?? []) {
    const key = citySearchKey(city);
    if (key.startsWith(term)) prefixes.push(city);
    else if (key.includes(term)) otherMatches.push(city);
  }
  const suggestions = [...prefixes, ...otherMatches].slice(0, 8);
  if (!suggestions.length) {
    cityStatus.textContent = "No matching cities. You can enter your city manually.";
    return;
  }
  cityOptions.append(...suggestions.map((city, index) => {
    const option = document.createElement("li");
    option.id = `city-option-${index}`;
    option.setAttribute("role", "option");
    option.setAttribute("aria-selected", "false");
    option.textContent = city;
    return option;
  }));
  cityOptions.hidden = false;
  cityInput.setAttribute("aria-expanded", "true");
  cityStatus.textContent = `${suggestions.length} city suggestions. Use the arrow keys to choose.`;
});

function selectCity(option) {
  cityInput.value = option.textContent;
  cityInput.setCustomValidity("");
  closeCityOptions();
}

cityOptions.addEventListener("mousedown", (event) => {
  if (event.target.closest('[role="option"]')) event.preventDefault();
});
cityOptions.addEventListener("click", (event) => {
  const option = event.target.closest('[role="option"]');
  if (option) selectCity(option);
});
cityInput.addEventListener("blur", closeCityOptions);

cityInput.addEventListener("keydown", (event) => {
  if (cityOptions.hidden) return;
  if (event.key === "Escape" || event.key === "Enter") {
    event.preventDefault();
    if (event.key === "Enter" && activeCity >= 0) {
      selectCity(cityOptions.children[activeCity]);
    } else {
      closeCityOptions();
    }
    return;
  }
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
  event.preventDefault();
  const options = cityOptions.children;
  if (activeCity >= 0) options[activeCity].setAttribute("aria-selected", "false");
  if (event.key === "ArrowDown") {
    activeCity = (activeCity + 1) % options.length;
  } else {
    activeCity = activeCity <= 0 ? options.length - 1 : activeCity - 1;
  }
  const option = options[activeCity];
  option.setAttribute("aria-selected", "true");
  cityInput.setAttribute("aria-activedescendant", option.id);
  option.scrollIntoView({ block: "nearest" });
});

const motion = matchMedia("(prefers-reduced-motion: no-preference)");
let activeOpener = openJoin;

function syncParticipationFields() {
  const guest = participation.value === "Guest";
  panelTitle.textContent = guest ? "Attend as a Guest" : membershipCopy.title;
  phone.required = !guest;
  phoneLabel.textContent = guest ? "Phone (optional)" : "Phone Number";
  phone.setCustomValidity("");
  messageLabel.textContent = guest ? "What would you like to know about DEUS ORDO?" : membershipCopy.question;
  messageInput.placeholder = guest
    ? "Tell us a little about yourself and what interests you about attending."
    : membershipCopy.placeholder;
  messageInput.setCustomValidity("");
  participationReview.textContent = guest
    ? "Guest requests are reviewed before invitations are sent."
    : membershipCopy.review;
}

function focusConfirmation() {
  panelTitle.focus({ preventScroll: true });
  panel.scrollIntoView({ behavior: "instant", block: "start" });
}

function showConfirmation(guestRequest) {
  form.reset();
  syncCityField();
  status.replaceChildren();
  delete status.dataset.state;

  panelTitle.textContent = guestRequest ? "Your First Step Is Complete." : "First Step Taken.";
  panelTitle.setAttribute("aria-describedby", guestRequest
    ? "confirmation-message"
    : "confirmation-lead confirmation-message");
  confirmationLead.hidden = guestRequest;
  confirmationMessage.textContent = guestRequest
    ? "Thank you for your interest in DEUS ORDO. We’ve received your guest request and will contact you with information about an upcoming gathering."
    : "Thank you for your interest in DEUS ORDO. We’ve received your request and will contact you about the next steps.";
  confirmationMotto.hidden = guestRequest;
  panelCaption.hidden = true;
  form.hidden = true;
  confirmation.hidden = false;
  closeJoin.setAttribute("aria-label", "Close request confirmation");
  if (!panel.hidden) focusConfirmation();
}

function setPanelOpen(isOpen) {
  panel.hidden = !isOpen;
  openJoin.setAttribute("aria-expanded", String(isOpen));
  openGuest.setAttribute("aria-expanded", String(isOpen));

  if (isOpen) {
    if (confirmation.hidden) {
      firstName.focus({ preventScroll: true });
      panel.scrollIntoView({ behavior: motion.matches ? "smooth" : "instant", block: "start" });
    } else {
      focusConfirmation();
    }
  } else {
    closeCityOptions();
    if (!confirmation.hidden) {
      confirmation.hidden = true;
      form.hidden = false;
      panelCaption.hidden = false;
      panelTitle.removeAttribute("aria-describedby");
      closeJoin.setAttribute("aria-label", "Close DEUS ORDO request form");
      syncParticipationFields();
    }
    activeOpener.focus();
  }
}

function toggleFrom(opener) {
  if (!panel.hidden && activeOpener === opener) {
    setPanelOpen(false);
    return;
  }

  activeOpener = opener;
  if (confirmation.hidden && !sending) {
    if (opener === openGuest) participation.value = "Guest";
    else if (participation.value === "Guest") participation.value = "";
    syncParticipationFields();
  }
  setPanelOpen(true);
}

openJoin.addEventListener("click", () => toggleFrom(openJoin));
openGuest.addEventListener("click", () => toggleFrom(openGuest));
participation.addEventListener("change", syncParticipationFields);
closeJoin.addEventListener("click", () => setPanelOpen(false));
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || panel.hidden || event.defaultPrevented || event.isComposing) return;
  event.preventDefault();
  setPanelOpen(false);
});
openJoin.hidden = false;
openGuest.hidden = false;

function showStatus(state, message) {
  status.dataset.state = state;
  status.textContent = message;
}

const formId = form.dataset.formspreeFormId.trim().toLowerCase();
const isConfigured = /^[a-z0-9]+$/.test(formId) && typeof window.fetch === "function";
const endpoint = isConfigured ? `https://formspree.io/f/${formId}` : null;
let sending = false;

if (endpoint) {
  submit.disabled = false;
  status.replaceChildren();
}

const requiredText = [
  [firstName, "Enter your first name."],
  [lastName, "Enter your last name."],
  [phone, "Enter your phone number."],
  [cityInput, "Enter your city."],
  [messageInput, "Tell us a little about your interest in DEUS ORDO."]
];

for (const [field] of requiredText) {
  field.addEventListener("input", () => field.setCustomValidity(""));
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!endpoint || sending) return;

  for (const [field, message] of requiredText) {
    field.setCustomValidity(field.required && !field.value.trim() ? message : "");
  }
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const guestRequest = data.get("membership_interest") === "Guest";
  if (guestRequest && !phone.value) data.delete("phone");
  const given = firstName.value.trim();
  const family = lastName.value.trim();
  data.set("first_name", given);
  data.set("last_name", family);
  data.set("name", `${given} ${family}`);
  const city = cityInput.value.trim();
  data.set("city", city);
  data.set("location", `${city}, ${stateInput.selectedOptions[0].textContent}`);
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

    showConfirmation(guestRequest);
  } catch {
    showStatus("error", "We couldn’t confirm that your request was sent. Please check your connection before trying again.");
  } finally {
    sending = false;
    submit.disabled = false;
    form.removeAttribute("aria-busy");
  }
});

(() => {
  const list = document.querySelector(".audience-accordion");
  if (!list) return;
  const rows = Array.from(list.querySelectorAll("details"), (details) => ({
    details,
    summary: details.querySelector("summary")
  }));
  let openRow = null;
  let manualAt = null;
  let frame = 0;

  function openOnly(row = null) {
    if (openRow === row) return;
    if (openRow) openRow.details.open = false;
    if (row) row.details.open = true;
    openRow = row;
  }

  function updateFromScroll() {
    frame = 0;
    if (!motion.matches || list.querySelector("summary:focus-visible")) return;
    if (manualAt !== null && Math.abs(window.scrollY - manualAt) < 64) return;
    manualAt = null;

    const line = window.innerHeight * .56;
    const bounds = list.getBoundingClientRect();
    let offset = line - bounds.top;
    if (offset < 0 || line >= bounds.bottom) {
      openOnly();
      return;
    }

    // Summary heights stay constant when a description opens.
    for (const row of rows) {
      offset -= row.summary.getBoundingClientRect().height;
      if (offset < 0) {
        openOnly(row);
        return;
      }
    }
    if (openRow !== rows.at(-1)) openOnly();
  }

  function scheduleScrollUpdate() {
    if (motion.matches && !frame) frame = requestAnimationFrame(updateFromScroll);
  }

  for (const row of rows) {
    row.summary.addEventListener("click", (event) => {
      event.preventDefault();
      manualAt = window.scrollY;
      openOnly(openRow === row ? null : row);
    });
  }

  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate);
  motion.addEventListener("change", () => {
    if (motion.matches) scheduleScrollUpdate();
    else if (manualAt === null) openOnly();
  });
  scheduleScrollUpdate();
})();
