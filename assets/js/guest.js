import { SITE_CONFIG } from "./config.js";
import { getConfigError, getSupabaseClient } from "./supabase-client.js";

const REDIRECT_DELAY_MS = 1500;
const EMAIL_ERROR =
  "Please check that your email address is correct.";
const RATING_COPY = {
  1: "1 star — We're sorry. Please tell us what happened.",
  2: "2 stars — We would value the chance to do better.",
  3: "3 stars — Thank you for your honesty. What could we improve?",
  4: "4 stars — Lovely. Thank you for staying with us.",
  5: "5 stars — Exceptional. Thank you for staying with us.",
};

const elements = {
  stars: document.getElementById("star-rating"),
  starButtons: [...document.querySelectorAll(".star")],
  ratingCaption: document.getElementById("rating-caption"),
  ratingView: document.getElementById("rating-view"),
  highRatingPanel: document.getElementById("high-rating-panel"),
  highRatingCopy: document.getElementById("high-rating-copy"),
  googleLink: document.getElementById("google-review-link"),
  redirectNote: document.getElementById("redirect-note"),
  form: document.getElementById("private-feedback-form"),
  formStatus: document.getElementById("feedback-status"),
  submitButton: document.getElementById("feedback-submit"),
  submitLabel: document.getElementById("feedback-submit-label"),
  name: document.getElementById("guest-name"),
  email: document.getElementById("guest-email"),
  comments: document.getElementById("guest-comments"),
  website: document.getElementById("guest-website"),
  confirmation: document.getElementById("confirmation-panel"),
  confirmationTitle: document.getElementById("confirmation-title"),
  confirmationCopy: document.getElementById("confirmation-copy"),
  year: document.getElementById("copyright-year"),
};

let selectedRating = 0;
let previewRating = 0;
let redirectTimer = null;
let isSubmitting = false;

init();

function init() {
  if (elements.year) {
    elements.year.textContent = String(new Date().getFullYear());
  }

  // This is set on page load so the fallback link is always ready.
  elements.googleLink.href = SITE_CONFIG.googleReviewUrl;

  elements.starButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectRating(Number(button.dataset.rating));
    });

    button.addEventListener("pointerenter", () => {
      previewRating = Number(button.dataset.rating);
      paintStars(previewRating);
    });

    button.addEventListener("pointerleave", () => {
      previewRating = 0;
      paintStars(selectedRating);
    });

    button.addEventListener("focus", () => {
      previewRating = Number(button.dataset.rating);
      paintStars(previewRating);
    });

    button.addEventListener("blur", () => {
      previewRating = 0;
      paintStars(selectedRating);
    });
  });

  elements.stars.addEventListener("keydown", handleStarKeydown);
  elements.form.addEventListener("submit", handleSubmit);
  elements.email.addEventListener("input", clearEmailValidity);
}

function handleStarKeydown(event) {
  const button = event.target.closest(".star");
  if (!button) return;

  const current = selectedRating || Number(button.dataset.rating);
  let next = current;

  switch (event.key) {
    case "ArrowRight":
    case "ArrowDown":
      next = Math.min(5, current + 1);
      break;
    case "ArrowLeft":
    case "ArrowUp":
      next = Math.max(1, current - 1);
      break;
    case "Home":
      next = 1;
      break;
    case "End":
      next = 5;
      break;
    default:
      return;
  }

  event.preventDefault();
  selectRating(next);
  const nextButton = elements.starButtons[next - 1];
  nextButton?.focus();
}

function selectRating(value) {
  if (!Number.isInteger(value) || value < 1 || value > 5 || isSubmitting) {
    return;
  }

  selectedRating = value;
  previewRating = 0;
  paintStars(value);
  syncStarAccessibility();

  elements.ratingCaption.textContent = RATING_COPY[value];
  elements.ratingCaption.classList.toggle("is-selected", true);
  elements.ratingCaption.classList.toggle("is-warm", value >= 4);

  clearStatus();
  clearEmailValidity();

  if (value >= 4) {
    showGoogleRedirect(value);
  } else {
    showPrivateForm();
  }
}

function paintStars(value) {
  elements.starButtons.forEach((button, index) => {
    button.classList.toggle("is-active", index < value);
  });
}

function syncStarAccessibility() {
  elements.starButtons.forEach((button) => {
    const value = Number(button.dataset.rating);
    button.setAttribute("aria-checked", String(value === selectedRating));
    button.tabIndex = value === (selectedRating || 1) ? 0 : -1;
  });
}

function showPrivateForm() {
  cancelRedirect();
  elements.highRatingPanel.hidden = true;
  elements.form.hidden = false;
}

function showGoogleRedirect(rating) {
  cancelRedirect();
  elements.form.hidden = true;
  elements.highRatingPanel.hidden = false;

  elements.highRatingCopy.textContent =
    rating === 5
      ? "We are delighted you enjoyed your stay. We will open Google so you can share your experience with other travellers."
      : "We are so glad you enjoyed your stay. We will open Google so you can share your experience with other travellers.";

  elements.redirectNote.textContent =
    "Opening Google in a moment. If nothing happens, use the button above.";

  redirectTimer = window.setTimeout(() => {
    redirectTimer = null;
    window.location.assign(SITE_CONFIG.googleReviewUrl);
  }, REDIRECT_DELAY_MS);
}

function cancelRedirect() {
  if (redirectTimer !== null) {
    window.clearTimeout(redirectTimer);
    redirectTimer = null;
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  if (isSubmitting) return;

  clearStatus();
  clearEmailValidity();

  const name = elements.name.value.trim();
  const email = elements.email.value.trim();
  const comments = elements.comments.value.trim();

  if (selectedRating < 1 || selectedRating > 3) {
    showStatus(
      "Please choose a rating before sending your feedback.",
      "error",
    );
    return;
  }

  if (email && !elements.email.checkValidity()) {
    elements.email.setAttribute("aria-invalid", "true");
    elements.email.focus();
    showStatus(EMAIL_ERROR, "error");
    return;
  }

  // A hidden honeypot field catches naive spam bots without troubling guests.
  if (elements.website.value.trim()) {
    showConfirmation(email);
    return;
  }

  const configError = getConfigError();
  if (configError) {
    console.error(`[Guest feedback] ${configError}`);
    showStatus(
      "Online feedback is unavailable right now. Please share your experience with our front desk, or try again later.",
      "error",
    );
    return;
  }

  setSubmitting(true);

  try {
    const supabase = await getSupabaseClient();
    const { error } = await supabase.from("feedback").insert({
      rating: selectedRating,
      guest_name: name || null,
      guest_email: email || null,
      comments: comments || null,
    });

    if (error) throw error;
    showConfirmation(email);
  } catch (error) {
    console.error("[Guest feedback] Could not save the feedback.", error);
    showStatus(
      "We could not send your feedback just now. Please try again, or speak with our front desk.",
      "error",
    );
    setSubmitting(false);
  }
}

function showStatus(message, type) {
  elements.formStatus.textContent = message;
  elements.formStatus.hidden = false;
  elements.formStatus.classList.toggle("is-error", type === "error");
  elements.formStatus.classList.toggle("is-info", type === "info");
  elements.formStatus.setAttribute(
    "role",
    type === "error" ? "alert" : "status",
  );
}

function clearStatus() {
  elements.formStatus.textContent = "";
  elements.formStatus.hidden = true;
  elements.formStatus.classList.remove("is-error", "is-info");
}

function clearEmailValidity() {
  elements.email.removeAttribute("aria-invalid");

  if (elements.formStatus.textContent === EMAIL_ERROR) {
    clearStatus();
  }
}

function setSubmitting(isBusy) {
  isSubmitting = isBusy;
  elements.submitButton.disabled = isBusy;
  elements.submitButton.setAttribute("aria-busy", String(isBusy));
  elements.submitLabel.textContent = isBusy
    ? "Sending your note…"
    : "Send private feedback";
  elements.starButtons.forEach((button) => {
    button.disabled = isBusy;
  });
}

function showConfirmation(email) {
  cancelRedirect();
  setSubmitting(true);
  elements.submitButton.removeAttribute("aria-busy");
  elements.ratingView.hidden = true;
  elements.confirmation.hidden = false;

  elements.confirmationCopy.textContent = email
    ? "Your note has been shared privately with our resort team. We may be in touch at the email you shared."
    : "Your note has been shared privately with our resort team. Thank you for helping us do better.";

  elements.confirmationTitle.focus({ preventScroll: true });
  elements.confirmation.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "center",
  });
}
