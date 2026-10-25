import { getConfigError, getSupabaseClient } from "./supabase-client.js";

const PAGE_SIZE = 12;
const SEARCH_DELAY_MS = 320;

const elements = {
  loginView: document.getElementById("login-view"),
  loginForm: document.getElementById("login-form"),
  loginEmail: document.getElementById("staff-email"),
  loginPassword: document.getElementById("staff-password"),
  loginSubmit: document.getElementById("login-submit"),
  loginSubmitLabel: document.getElementById("login-submit-label"),
  loginMessage: document.getElementById("login-message"),
  configNotice: document.getElementById("config-notice"),

  dashboardView: document.getElementById("dashboard-view"),
  dashboardTitle: document.getElementById("dashboard-title"),
  adminAccount: document.getElementById("admin-account"),
  adminEmail: document.getElementById("admin-email"),
  signoutButton: document.getElementById("signout-button"),
  refreshButton: document.getElementById("refresh-button"),

  totalCount: document.getElementById("total-count"),
  pendingCount: document.getElementById("pending-count"),
  reviewedCount: document.getElementById("reviewed-count"),

  searchInput: document.getElementById("search-input"),
  ratingFilter: document.getElementById("rating-filter"),
  statusFilter: document.getElementById("status-filter"),
  resultsCount: document.getElementById("results-count"),

  boardTitle: document.getElementById("board-title"),
  boardStatus: document.getElementById("board-status"),
  boardStatusText: document.getElementById("board-status-text"),
  loadingBar: document.getElementById("loading-bar"),
  feedbackList: document.getElementById("feedback-list"),
  emptyState: document.getElementById("empty-state"),
  emptyTitle: document.getElementById("empty-title"),
  emptyCopy: document.getElementById("empty-copy"),
  errorState: document.getElementById("error-state"),
  retryButton: document.getElementById("retry-button"),

  pagination: document.getElementById("pagination"),
  paginationSummary: document.getElementById("pagination-summary"),
  previousButton: document.getElementById("previous-button"),
  nextButton: document.getElementById("next-button"),
};

const state = {
  session: null,
  page: 0,
  total: 0,
  loading: false,
  filters: {
    search: "",
    rating: "",
    status: "",
  },
};

let supabase = null;
let requestId = 0;
let searchTimer = null;
let statusTimer = null;

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
});

init();

async function init() {
  bindEvents();

  const configError = getConfigError();
  if (configError) {
    showLogin();
    showConfigProblem(
      `${configError} Apply supabase/schema.sql and complete the setup steps in README.md.`,
    );
    return;
  }

  try {
    supabase = await getSupabaseClient();

    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_OUT") return;
      // Our own sign-out and failed access checks handle their own messages.
      if (elements.dashboardView.hidden) return;
      resetDashboard();
      showLogin("Your session has ended. Please sign in again.", "info");
    });

    if (data.session) {
      await enterStaffArea(data.session, { moveFocus: false });
    } else {
      showLogin();
    }
  } catch (error) {
    console.error("[Staff portal] Could not start.", error);
    showLogin();
    showConfigProblem(
      "The staff portal could not start. Check your internet connection and reload the page. If this continues, re-run the Supabase setup in README.md.",
    );
  }
}

function bindEvents() {
  elements.loginForm.addEventListener("submit", handleLogin);
  elements.loginEmail.addEventListener("input", clearEmailInvalid);
  elements.signoutButton.addEventListener("click", handleSignOut);
  elements.refreshButton.addEventListener("click", handleRefresh);
  elements.retryButton.addEventListener("click", () => loadFeedback());

  elements.searchInput.addEventListener("input", () => {
    state.filters.search = elements.searchInput.value;
    state.page = 0;
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => {
      if (!elements.dashboardView.hidden) loadFeedback();
    }, SEARCH_DELAY_MS);
  });

  elements.ratingFilter.addEventListener("change", () => {
    state.filters.rating = elements.ratingFilter.value;
    resetPageAndLoad();
  });

  elements.statusFilter.addEventListener("change", () => {
    state.filters.status = elements.statusFilter.value;
    resetPageAndLoad();
  });

  elements.previousButton.addEventListener("click", () => {
    if (state.page === 0) return;
    state.page -= 1;
    loadFeedback();
    scrollToBoard();
  });

  elements.nextButton.addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
    if (state.page >= totalPages - 1) return;
    state.page += 1;
    loadFeedback();
    scrollToBoard();
  });
}

/* --------------------------------------------------------------------------
   Authentication
   -------------------------------------------------------------------------- */

async function handleLogin(event) {
  event.preventDefault();
  clearLoginMessage();
  clearEmailInvalid();

  const email = elements.loginEmail.value.trim();
  const password = elements.loginPassword.value;

  if (!email || !elements.loginEmail.checkValidity()) {
    elements.loginEmail.setAttribute("aria-invalid", "true");
    elements.loginEmail.focus();
    showLoginMessage("Enter a valid email address.", "error");
    return;
  }

  if (!password) {
    elements.loginPassword.focus();
    showLoginMessage("Enter your password.", "error");
    return;
  }

  setLoginBusy(true);

  try {
    if (!supabase) supabase = await getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (!data.session) {
      throw new Error("Sign-in completed without a session.");
    }

    elements.loginPassword.value = "";
    await enterStaffArea(data.session, { moveFocus: true });
  } catch (error) {
    console.error("[Staff portal] Sign-in failed.", error);
    showLoginMessage(friendlyLoginError(error), "error");
  } finally {
    setLoginBusy(false);
  }
}

async function enterStaffArea(session, { moveFocus }) {
  try {
    if (!supabase) supabase = await getSupabaseClient();

    const { data: isAdmin, error } = await supabase.rpc("is_admin");
    if (error) throw error;

    if (isAdmin !== true) {
      await safeSignOut();
      showLogin(
        "This account is not approved for staff access. Contact the resort manager to request access.",
        "error",
      );
      return false;
    }

    state.session = session;
    state.page = 0;
    showDashboard(session.user);

    await Promise.all([loadStats(), loadFeedback()]);

    if (moveFocus) {
      elements.dashboardTitle.focus({ preventScroll: true });
    }

    return true;
  } catch (error) {
    console.error("[Staff portal] Staff access could not be verified.", error);
    await safeSignOut();
    showLogin(
      "Staff access could not be verified. Check that supabase/schema.sql has been applied, then try again.",
      "error",
    );
    return false;
  }
}

async function handleSignOut() {
  elements.signoutButton.disabled = true;
  const previousLabel = elements.signoutButton.textContent;
  elements.signoutButton.textContent = "Signing out…";

  if (supabase) await safeSignOut();

  elements.signoutButton.disabled = false;
  elements.signoutButton.textContent = previousLabel;
  showLogin("You have signed out.", "info");
}

async function safeSignOut() {
  if (!supabase) return;

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.warn(
      "[Staff portal] Global sign-out failed; clearing this browser's session instead.",
      error,
    );
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch (localError) {
      console.warn("[Staff portal] Local sign-out also failed.", localError);
    }
  }
}

function showDashboard(user) {
  elements.loginView.hidden = true;
  elements.dashboardView.hidden = false;
  elements.adminAccount.hidden = false;

  const email = user?.email || "Signed-in staff";
  elements.adminEmail.textContent = email;
  elements.adminEmail.title = email;
  document.title = "Private Notes · Kumarakom Lake Resort";
}

function showLogin(message = "", tone = "info") {
  requestId += 1;
  state.session = null;
  state.loading = false;
  state.page = 0;

  elements.loginView.hidden = false;
  elements.dashboardView.hidden = true;
  elements.adminAccount.hidden = true;
  elements.adminEmail.textContent = "";
  elements.loginPassword.value = "";
  elements.signoutButton.disabled = false;
  document.title = "Staff Portal · Kumarakom Lake Resort";

  state.filters = { search: "", rating: "", status: "" };
  elements.searchInput.value = "";
  elements.ratingFilter.value = "";
  elements.statusFilter.value = "";

  resetDashboard();

  if (message) {
    showLoginMessage(message, tone);
  } else {
    clearLoginMessage();
  }
}

function setLoginBusy(isBusy) {
  elements.loginEmail.disabled = isBusy;
  elements.loginPassword.disabled = isBusy;
  elements.loginSubmit.disabled = isBusy;
  elements.loginSubmit.setAttribute("aria-busy", String(isBusy));
  elements.loginSubmitLabel.textContent = isBusy ? "Signing in…" : "Sign in";

  if (!isBusy) {
    elements.loginEmail.disabled = false;
    elements.loginPassword.disabled = false;
    elements.loginSubmit.disabled = false;
  }
}

function showLoginMessage(message, tone) {
  elements.loginMessage.textContent = message;
  elements.loginMessage.hidden = false;
  elements.loginMessage.classList.toggle("is-error", tone === "error");
  elements.loginMessage.classList.toggle("is-success", tone === "success");
}

function clearLoginMessage() {
  elements.loginMessage.textContent = "";
  elements.loginMessage.hidden = true;
  elements.loginMessage.classList.remove("is-error", "is-success");
}

function clearEmailInvalid() {
  elements.loginEmail.removeAttribute("aria-invalid");
}

function showConfigProblem(message) {
  elements.configNotice.textContent = message;
  elements.configNotice.hidden = false;
  elements.loginEmail.disabled = true;
  elements.loginPassword.disabled = true;
  elements.loginSubmit.disabled = true;
}

function friendlyLoginError(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "The email or password is not correct.";
  }
  if (message.includes("email not confirmed")) {
    return "This staff account has not been confirmed yet. Ask the resort manager to confirm it.";
  }
  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("load failed")
  ) {
    return "Could not reach Supabase. Check your internet connection and try again.";
  }
  if (message.includes("rate limit") || error?.status === 429) {
    return "Too many sign-in attempts. Please wait a moment and try again.";
  }

  return "Sign-in failed. Please check your details and try again.";
}

/* --------------------------------------------------------------------------
   Dashboard data
   -------------------------------------------------------------------------- */

async function loadStats() {
  if (!supabase || elements.dashboardView.hidden) return;

  try {
    const countQuery = (reviewed) => {
      let query = supabase
        .from("feedback")
        .select("id", { count: "exact", head: true });
      if (typeof reviewed === "boolean") {
        query = query.eq("reviewed", reviewed);
      }
      return query;
    };

    const [allResult, pendingResult, reviewedResult] = await Promise.all([
      countQuery(),
      countQuery(false),
      countQuery(true),
    ]);

    const error =
      allResult.error || pendingResult.error || reviewedResult.error;
    if (error) throw error;

    elements.totalCount.textContent = String(allResult.count ?? 0);
    elements.pendingCount.textContent = String(pendingResult.count ?? 0);
    elements.reviewedCount.textContent = String(reviewedResult.count ?? 0);
  } catch (error) {
    console.error("[Staff portal] Could not load feedback counts.", error);
    elements.totalCount.textContent = "—";
    elements.pendingCount.textContent = "—";
    elements.reviewedCount.textContent = "—";
  }
}

async function loadFeedback() {
  if (elements.dashboardView.hidden || !supabase) return;

  const localRequestId = ++requestId;
  state.loading = true;
  setListLoading(true);
  elements.errorState.hidden = true;

  try {
    let query = supabase.from("feedback").select(
      "id, rating, guest_name, guest_email, comments, reviewed, reviewed_at, created_at",
      { count: "exact" },
    );

    query = applyFilters(query);

    const from = state.page * PAGE_SIZE;
    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    if (localRequestId !== requestId) return;

    const total = count ?? data.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    if (state.page >= totalPages) {
      state.page = totalPages - 1;
      await loadFeedback();
      return;
    }

    state.total = total;
    renderFeedback(data);
    renderPagination();
    updateResultsLabel();
  } catch (error) {
    if (localRequestId !== requestId) return;

    console.error("[Staff portal] Could not load feedback.", error);
    elements.feedbackList.replaceChildren();
    elements.feedbackList.setAttribute("aria-busy", "false");
    elements.emptyState.hidden = true;
    elements.pagination.hidden = true;
    elements.errorState.hidden = false;
    elements.resultsCount.textContent = "";
  } finally {
    if (localRequestId === requestId) {
      state.loading = false;
      setListLoading(false);
      if (elements.errorState.hidden) renderPagination();
    }
  }
}

function applyFilters(query) {
  if (state.filters.rating) {
    query = query.eq("rating", Number(state.filters.rating));
  }

  if (state.filters.status === "new") {
    query = query.eq("reviewed", false);
  } else if (state.filters.status === "reviewed") {
    query = query.eq("reviewed", true);
  }

  const search = cleanSearchTerm(state.filters.search);
  if (search) {
    query = query.or(
      `guest_name.ilike.%${search}%,guest_email.ilike.%${search}%,comments.ilike.%${search}%`,
    );
  }

  return query;
}

function cleanSearchTerm(value) {
  return value
    .replace(/[^\p{L}\p{N}@._+\-\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

function renderFeedback(items) {
  const fragment = document.createDocumentFragment();

  for (const item of items) {
    fragment.append(createFeedbackCard(item));
  }

  elements.feedbackList.replaceChildren(fragment);
  elements.feedbackList.setAttribute("aria-busy", "false");
  elements.emptyState.hidden = items.length !== 0;

  if (items.length === 0) {
    const filtered = hasActiveFilters();
    elements.emptyTitle.textContent = filtered
      ? "No matching notes"
      : "No private notes yet";
    elements.emptyCopy.textContent = filtered
      ? "Try a different search or filter. All notes are kept private to your team."
      : "New private feedback from guests will appear here as soon as it is sent.";
  }
}

function createFeedbackCard(item) {
  const reviewed = Boolean(item.reviewed);
  const displayName = item.guest_name?.trim() || "Anonymous guest";

  const article = createElement(
    "article",
    `feedback-item${reviewed ? " feedback-item--reviewed" : " feedback-item--new"}`,
  );
  article.dataset.feedbackId = item.id;

  const top = createElement("div", "feedback-item__top");
  const identity = createElement("div");
  const guestLine = createElement("div", "guest-line");
  const avatar = createElement(
    "span",
    "guest-avatar",
    getInitial(displayName),
  );
  avatar.setAttribute("aria-hidden", "true");

  const name = createElement("h3", "guest-name", displayName);
  guestLine.append(avatar, name);

  const meta = createElement("p", "guest-meta");
  const stars = createElement("span", "mini-stars");
  stars.setAttribute("role", "img");
  stars.setAttribute("aria-label", `Rated ${item.rating} out of 5 stars`);
  stars.append(
    createElement("span", "mini-stars__filled", "★".repeat(item.rating)),
    createElement("span", "mini-stars__empty", "★".repeat(5 - item.rating)),
  );

  meta.append(stars);

  if (item.guest_email) {
    meta.append(createElement("span", "meta-dot", "·"));
    const emailLink = createElement("a", "", item.guest_email);
    emailLink.href = `mailto:${item.guest_email}`;
    meta.append(emailLink);
  }

  meta.append(createElement("span", "meta-dot", "·"));
  const createdTime = createElement("time", "", formatDateTime(item.created_at));
  createdTime.dateTime = item.created_at || "";
  if (item.created_at) createdTime.title = item.created_at;
  meta.append(createdTime);

  identity.append(guestLine, meta);

  const badge = createElement(
    "span",
    `status-badge ${reviewed ? "status-badge--reviewed" : "status-badge--new"}`,
    reviewed ? "Reviewed" : "Needs review",
  );

  top.append(identity, badge);

  const comment = createElement(
    "p",
    `feedback-item__comment${item.comments ? "" : " is-empty"}`,
    item.comments || "No written comment.",
  );

  const footer = createElement("div", "feedback-item__footer");
  const timestamp = createElement(
    "span",
    "feedback-item__timestamp",
    reviewed && item.reviewed_at
      ? `Reviewed ${formatDate(item.reviewed_at)}`
      : reviewed
        ? "Reviewed by staff"
        : "Not yet reviewed",
  );

  const reviewButton = createElement(
    "button",
    "button button--outline review-button",
    reviewed ? "Mark as new" : "Mark as reviewed",
  );
  reviewButton.type = "button";
  reviewButton.setAttribute(
    "aria-label",
    reviewed
      ? `Mark feedback from ${displayName} as not reviewed`
      : `Mark feedback from ${displayName} as reviewed`,
  );
  reviewButton.addEventListener("click", () => {
    toggleReviewed(item, reviewButton);
  });

  footer.append(timestamp, reviewButton);
  article.append(top, comment, footer);

  return article;
}

function getInitial(value) {
  const firstCharacter = Array.from(value.trim())[0];
  return firstCharacter ? firstCharacter.toLocaleUpperCase() : "G";
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function renderPagination() {
  const totalPages = Math.max(1, Math.ceil(state.total / PAGE_SIZE));
  const start = state.total === 0 ? 0 : state.page * PAGE_SIZE + 1;
  const end = Math.min((state.page + 1) * PAGE_SIZE, state.total);

  elements.pagination.hidden = state.total <= PAGE_SIZE;
  elements.paginationSummary.textContent = `Showing ${start}–${end} of ${state.total} ${pluralizeNote(state.total)}`;
  elements.previousButton.disabled = state.page === 0 || state.loading;
  elements.nextButton.disabled =
    state.page >= totalPages - 1 || state.loading;
}

function updateResultsLabel() {
  const filtered = hasActiveFilters();
  if (state.total === 0) {
    elements.resultsCount.textContent = filtered
      ? "No matching notes"
      : "No notes yet";
    return;
  }

  elements.resultsCount.textContent = `${state.total} ${
    filtered ? "matching " : ""
  }${pluralizeNote(state.total)} · newest first`;
}

async function toggleReviewed(item, button) {
  if (!supabase || !state.session?.user) return;

  const markReviewed = !item.reviewed;
  const originalLabel = button.textContent;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  button.textContent = markReviewed ? "Marking…" : "Reopening…";

  const payload = markReviewed
    ? {
        reviewed: true,
        reviewed_at: new Date().toISOString(),
        reviewed_by: state.session.user.id,
      }
    : {
        reviewed: false,
        reviewed_at: null,
        reviewed_by: null,
      };

  try {
    const { error } = await supabase
      .from("feedback")
      .update(payload)
      .eq("id", item.id);

    if (error) throw error;

    await Promise.all([loadStats(), loadFeedback()]);

    if (elements.dashboardView.hidden) return;

    showTemporaryStatus(
      markReviewed
        ? "Feedback marked as reviewed."
        : "Feedback marked as needing review.",
    );

    const refreshedButton = elements.feedbackList.querySelector(
      `[data-feedback-id="${CSS.escape(item.id)}"] .review-button`,
    );

    if (refreshedButton) {
      refreshedButton.focus({ preventScroll: true });
    } else if (elements.errorState.hidden) {
      elements.boardTitle.focus({ preventScroll: true });
    } else {
      elements.retryButton.focus({ preventScroll: true });
    }
  } catch (error) {
    console.error("[Staff portal] Could not update the note.", error);
    button.disabled = false;
    button.removeAttribute("aria-busy");
    button.textContent = originalLabel;
    showTemporaryStatus(
      "This note could not be updated. Please try again.",
      true,
    );
  }
}

async function handleRefresh() {
  if (state.loading) return;
  await Promise.all([loadStats(), loadFeedback()]);

  if (elements.dashboardView.hidden) return;
  if (elements.errorState.hidden) {
    showTemporaryStatus("Feedback refreshed.");
  }
}

function resetPageAndLoad() {
  window.clearTimeout(searchTimer);
  state.page = 0;
  loadFeedback();
}

function scrollToBoard() {
  elements.boardTitle.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
    block: "start",
  });
}

function resetDashboard() {
  window.clearTimeout(searchTimer);
  window.clearTimeout(statusTimer);
  elements.feedbackList.replaceChildren();
  elements.feedbackList.setAttribute("aria-busy", "false");
  elements.emptyState.hidden = true;
  elements.errorState.hidden = true;
  elements.pagination.hidden = true;
  elements.resultsCount.textContent = "";
  elements.paginationSummary.textContent = "";
  elements.totalCount.textContent = "—";
  elements.pendingCount.textContent = "—";
  elements.reviewedCount.textContent = "—";
  elements.refreshButton.disabled = false;
  elements.boardStatus.hidden = true;
  elements.boardStatus.classList.remove("is-error");
  elements.loadingBar.hidden = false;
  elements.boardStatusText.textContent = "";
}

function setListLoading(isLoading) {
  elements.feedbackList.setAttribute("aria-busy", String(isLoading));
  elements.refreshButton.disabled = isLoading;
  elements.retryButton.disabled = isLoading;
  elements.loadingBar.hidden = !isLoading;

  if (isLoading) {
    window.clearTimeout(statusTimer);
    elements.boardStatus.hidden = false;
    elements.boardStatus.classList.remove("is-error");
    elements.boardStatusText.textContent = "Loading feedback…";
  } else {
    elements.boardStatus.hidden = true;
    elements.boardStatusText.textContent = "";
  }
}

function showTemporaryStatus(message, isError = false) {
  window.clearTimeout(statusTimer);
  elements.loadingBar.hidden = true;
  elements.boardStatus.hidden = false;
  elements.boardStatus.classList.toggle("is-error", isError);
  elements.boardStatusText.textContent = message;

  if (!isError) {
    statusTimer = window.setTimeout(() => {
      if (!state.loading) elements.boardStatus.hidden = true;
    }, 4000);
  }
}

function formatDateTime(value) {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return dateTimeFormatter.format(date);
}

function formatDate(value) {
  if (!value) return "an unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "an unknown date";
  return dateFormatter.format(date);
}

function pluralizeNote(count) {
  return count === 1 ? "note" : "notes";
}

function hasActiveFilters() {
  return Boolean(
    state.filters.search.trim() ||
      state.filters.rating ||
      state.filters.status,
  );
}
