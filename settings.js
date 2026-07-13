"use strict";

const STORAGE_KEY = "capstone-settings";

const defaultSettings = {
  profile: {
    fullName: "",
    email: "",
    bio: "",
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: false,
    weeklyDigest: true,
    marketingEmails: false,
  },
  appearance: {
    theme: "system",
    fontSize: "medium",
    accentColor: "#4f46e5",
  },
  privacy: {
    publicProfile: true,
    activityStatus: false,
    analytics: true,
  },
};

let settings = loadSettings();

let navItems;
let sections;
let statusMessage;
let profileForm;
let notificationsForm;
let appearanceForm;
let privacyForm;
let accentColorInput;
let accentColorValue;

document.addEventListener("DOMContentLoaded", init);

function init() {
  navItems = document.querySelectorAll(".nav-item");
  sections = document.querySelectorAll(".settings-section");
  statusMessage = document.getElementById("status-message");

  profileForm = document.getElementById("profile-form");
  notificationsForm = document.getElementById("notifications-form");
  appearanceForm = document.getElementById("appearance-form");
  privacyForm = document.getElementById("privacy-form");

  accentColorInput = document.getElementById("accent-color");
  accentColorValue = document.getElementById("accent-color-value");

  initNavigation();
  populateForms();
  applyAppearance();
  bindEvents();
}

function loadSettings() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return deepMerge(defaultSettings, JSON.parse(stored));
    }
  } catch (error) {
    console.warn("Could not load settings:", error);
  }
  return structuredClone(defaultSettings);
}

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function deepMerge(target, source) {
  const result = structuredClone(target);

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

function initNavigation() {
  navItems.forEach(function (item) {
    item.addEventListener("click", function () {
      switchSection(item.dataset.section);
    });
  });
}

function switchSection(sectionId) {
  navItems.forEach(function (item) {
    item.classList.toggle("active", item.dataset.section === sectionId);
  });

  sections.forEach(function (section) {
    section.classList.toggle("active", section.id === "section-" + sectionId);
  });
}

function populateForms() {
  document.getElementById("full-name").value = settings.profile.fullName;
  document.getElementById("email").value = settings.profile.email;
  document.getElementById("bio").value = settings.profile.bio;

  document.getElementById("email-notifications").checked =
    settings.notifications.emailNotifications;
  document.getElementById("push-notifications").checked =
    settings.notifications.pushNotifications;
  document.getElementById("weekly-digest").checked =
    settings.notifications.weeklyDigest;
  document.getElementById("marketing-emails").checked =
    settings.notifications.marketingEmails;

  document.getElementById("theme").value = settings.appearance.theme;
  document.getElementById("font-size").value = settings.appearance.fontSize;
  accentColorInput.value = settings.appearance.accentColor;
  accentColorValue.textContent = settings.appearance.accentColor;

  document.getElementById("public-profile").checked =
    settings.privacy.publicProfile;
  document.getElementById("activity-status").checked =
    settings.privacy.activityStatus;
  document.getElementById("analytics").checked = settings.privacy.analytics;
}

function bindEvents() {
  profileForm.addEventListener("submit", handleProfileSubmit);
  profileForm.addEventListener("reset", function () {
    setTimeout(function () {
      document.getElementById("full-name-error").textContent = "";
      document.getElementById("email-error").textContent = "";
      populateForms();
    }, 0);
  });

  notificationsForm.addEventListener("submit", handleNotificationsSubmit);
  appearanceForm.addEventListener("submit", handleAppearanceSubmit);
  privacyForm.addEventListener("submit", handlePrivacySubmit);

  accentColorInput.addEventListener("input", handleAccentColorInput);

  document.getElementById("theme").addEventListener("change", handleThemeChange);
  document.getElementById("font-size").addEventListener("change", handleFontSizeChange);

  document
    .getElementById("change-password-btn")
    .addEventListener("click", handleChangePassword);

  document
    .getElementById("export-data-btn")
    .addEventListener("click", exportData);

  document
    .getElementById("delete-account-btn")
    .addEventListener("click", deleteAccount);

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", handleSystemThemeChange);
}

function handleAccentColorInput() {
  accentColorValue.textContent = accentColorInput.value;
  document.documentElement.style.setProperty("--accent", accentColorInput.value);
}

function handleThemeChange() {
  settings.appearance.theme = document.getElementById("theme").value;
  applyTheme();
}

function handleFontSizeChange() {
  settings.appearance.fontSize = document.getElementById("font-size").value;
  applyFontSize();
}

function handleSystemThemeChange() {
  if (settings.appearance.theme === "system") {
    applyTheme();
  }
}

function handleChangePassword() {
  showStatus("Password change is not available in this demo.", "error");
}

function handleProfileSubmit(event) {
  event.preventDefault();

  const fullName = document.getElementById("full-name").value.trim();
  const email = document.getElementById("email").value.trim();
  const bio = document.getElementById("bio").value.trim();
  const fullNameError = document.getElementById("full-name-error");
  const emailError = document.getElementById("email-error");

  fullNameError.textContent = "";
  emailError.textContent = "";

  let hasError = false;

  if (!fullName) {
    fullNameError.textContent = "Full name is required.";
    hasError = true;
  }

  if (!email) {
    emailError.textContent = "Email address is required.";
    hasError = true;
  } else if (!isValidEmail(email)) {
    emailError.textContent = "Please enter a valid email address.";
    hasError = true;
  }

  if (hasError) {
    return;
  }

  settings.profile = { fullName, email, bio };
  saveSettings();
  showStatus("Profile saved successfully.", "success");
}

function handleNotificationsSubmit(event) {
  event.preventDefault();

  settings.notifications = {
    emailNotifications: document.getElementById("email-notifications").checked,
    pushNotifications: document.getElementById("push-notifications").checked,
    weeklyDigest: document.getElementById("weekly-digest").checked,
    marketingEmails: document.getElementById("marketing-emails").checked,
  };

  saveSettings();
  showStatus("Notification preferences saved.", "success");
}

function handleAppearanceSubmit(event) {
  event.preventDefault();

  settings.appearance = {
    theme: document.getElementById("theme").value,
    fontSize: document.getElementById("font-size").value,
    accentColor: accentColorInput.value,
  };

  saveSettings();
  applyAppearance();
  showStatus("Appearance settings saved.", "success");
}

function handlePrivacySubmit(event) {
  event.preventDefault();

  settings.privacy = {
    publicProfile: document.getElementById("public-profile").checked,
    activityStatus: document.getElementById("activity-status").checked,
    analytics: document.getElementById("analytics").checked,
  };

  saveSettings();
  showStatus("Privacy settings saved.", "success");
}

function applyAppearance() {
  applyTheme();
  applyFontSize();
  applyAccentColor();
}

function applyTheme() {
  const theme = settings.appearance.theme;
  let resolved = theme;

  if (theme === "system") {
    resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  document.documentElement.setAttribute("data-theme", resolved);
}

function applyFontSize() {
  document.documentElement.setAttribute(
    "data-font-size",
    settings.appearance.fontSize
  );
}

function applyAccentColor() {
  document.documentElement.style.setProperty(
    "--accent",
    settings.appearance.accentColor
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.className = "status-message " + type;
  statusMessage.hidden = false;

  clearTimeout(showStatus.timer);
  showStatus.timer = setTimeout(function () {
    statusMessage.hidden = true;
  }, 4000);
}

function exportData() {
  const blob = new Blob([JSON.stringify(settings, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "settings-export.json";
  link.click();
  URL.revokeObjectURL(url);

  showStatus("Settings exported successfully.", "success");
}

function deleteAccount() {
  const confirmed = window.confirm(
    "Are you sure you want to delete your account? This action cannot be undone."
  );

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  settings = structuredClone(defaultSettings);
  populateForms();
  applyAppearance();
  showStatus("Account data cleared.", "success");
}
