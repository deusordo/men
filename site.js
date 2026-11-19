"use strict";

const openJoin = document.querySelector("#open-join");
const closeJoin = document.querySelector("#close-join");
const panel = document.querySelector("#join-panel");
const form = document.querySelector("#interest-form");
const submit = form.querySelector('button[type="submit"]');
const status = document.querySelector("#form-status");
const stateInput = form.elements.state;
const cityInput = form.elements.city;
const firstName = form.elements.first_name;
const lastName = form.elements.last_name;
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

function setPanelOpen(isOpen) {
  panel.hidden = !isOpen;
  openJoin.setAttribute("aria-expanded", String(isOpen));

  if (isOpen) {
    firstName.focus({ preventScroll: true });
    panel.scrollIntoView({ behavior: motion.matches ? "smooth" : "instant", block: "start" });
  } else {
    closeCityOptions();
    openJoin.focus();
  }
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
  [form.elements.phone, "Enter your phone number."],
  [cityInput, "Enter your city."],
  [form.elements.message, "Tell us why you’re interested in MEN."]
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

    form.reset();
    syncCityField();
    showStatus(
      "success",
      "Thank you for your interest in MEN. We’ve received your request and will be in touch about the next steps.",
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
