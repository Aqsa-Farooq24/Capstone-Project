"use strict";

/**
 * Settings page — loads saved preferences, validates input, and persists to localStorage.
 */

const STORAGE_KEY = "user-settings";

const defaultSettings = {
  username: "",
  email: "",
  theme: "light",
};

/** Cached DOM references, populated on DOMContentLoaded */
const elements = {};

let savedTheme = defaultSettings.theme;

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  loadSettingsIntoForm();
  applyTheme(elements.theme.value);
  bindEvents();
}

/** Store frequently used elements once to avoid repeated lookups */
function cacheElements() {
  elements.form = document.getElementById("settings-form");
  elements.username = document.getElementById("username");
  elements.email = document.getElementById("email");
  elements.theme = document.getElementById("theme");
  elements.usernameError = document.getElementById("username-error");
  elements.emailError = document.getElementById("email-error");
  elements.statusMessage = document.getElementById("status-message");
}

function bindEvents() {
  elements.form.addEventListener("submit", handleSubmit);

  // Clear field errors as the user types — improves UX without hiding submit-time checks
  elements.username.addEventListener("input", function () {
    clearFieldError(elements.username, elements.usernameError);
  });

  elements.email.addEventListener("input", function () {
    clearFieldError(elements.email, elements.emailError);
  });

  // Preview theme immediately; value is persisted only on successful Save
  elements.theme.addEventListener("change", function () {
    applyTheme(elements.theme.value);
  });
}

function handleSubmit(event) {
  event.preventDefault();

  hideStatusMessage();

  const username = elements.username.value.trim();
  const email = elements.email.value.trim();
  const theme = elements.theme.value;

  const isValid = validateForm(username, email);

  if (!isValid) {
    focusFirstInvalidField();
    return;
  }

  const settings = { username, email, theme };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    showStatusMessage("Could not save settings. Please try again.", "error");
    console.warn("Save failed:", error);
    return;
  }

  savedTheme = theme;
  applyTheme(theme);
  showStatusMessage("Settings saved successfully.", "success");
}

/**
 * Validate username and email.
 * Returns true when all checks pass, false otherwise.
 */
function validateForm(username, email) {
  let isValid = true;

  clearFieldError(elements.username, elements.usernameError);
  clearFieldError(elements.email, elements.emailError);

  if (!username) {
    setFieldError(
      elements.username,
      elements.usernameError,
      "Username is required."
    );
    isValid = false;
  }

  if (!email) {
    setFieldError(
      elements.email,
      elements.emailError,
      "Email is required."
    );
    isValid = false;
  } else if (!isValidEmail(email)) {
    setFieldError(
      elements.email,
      elements.emailError,
      "Please enter a valid email address."
    );
    isValid = false;
  }

  return isValid;
}

function isValidEmail(email) {
  // Simple format check — sufficient for client-side validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Mark a field invalid and show its error message below the input */
function setFieldError(input, errorElement, message) {
  input.setAttribute("aria-invalid", "true");
  errorElement.textContent = message;
}

/** Reset invalid state and clear the error message */
function clearFieldError(input, errorElement) {
  input.setAttribute("aria-invalid", "false");
  errorElement.textContent = "";
}

/** Move keyboard focus to the first field that failed validation */
function focusFirstInvalidField() {
  if (elements.username.getAttribute("aria-invalid") === "true") {
    elements.username.focus();
    return;
  }

  if (elements.email.getAttribute("aria-invalid") === "true") {
    elements.email.focus();
  }
}

function loadSettingsIntoForm() {
  const settings = readStoredSettings();

  elements.username.value = settings.username;
  elements.email.value = settings.email;
  elements.theme.value = settings.theme === "dark" ? "dark" : "light";
  savedTheme = elements.theme.value;
}

function readStoredSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return structuredClone(defaultSettings);
    }

    const parsed = JSON.parse(stored);

    return {
      username: typeof parsed.username === "string" ? parsed.username : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      theme: parsed.theme === "dark" ? "dark" : "light",
    };
  } catch (error) {
    console.warn("Could not read settings:", error);
    return structuredClone(defaultSettings);
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function showStatusMessage(message, type) {
  elements.statusMessage.textContent = message;
  elements.statusMessage.className = "status-message " + type;
  elements.statusMessage.hidden = false;
}

function hideStatusMessage() {
  elements.statusMessage.hidden = true;
  elements.statusMessage.textContent = "";
}
