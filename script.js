
/* ==========================================
   MANUGURU TOWN GUIDE
   Directory, Search, Filters & Navigation
========================================== */

"use strict";

const CATEGORY_ICONS = {
  "Schools": "🎓",
  "Colleges & Training": "🏫",
  "Clothing, Jewellery & Tailoring": "🛍️",
  "Mobile, Electronics & Computers": "📱",
  "Grocery & Supermarkets": "🛒",
  "Hospitals & Clinics": "🏥",
  "Medical Stores & Pharmacies": "💊",
  "Restaurants & Food": "🍽️",
  "Hotels & Lodges": "🛏️",
  "Salons, Beauty & Personal Care": "💇",
  "Petrol Bunks & Automotive": "⛽",
  "Banks, Atms & Public Services": "🏦",
  "Banks, ATMs & Public Services": "🏦",
  "Temples, Theatres & Places": "📍"
};

const state = {
  query: "",
  category: "",
  sort: "name"
};

const $ = id => document.getElementById(id);

const listings = Array.isArray(window.MANUGURU_LISTINGS)
  ? window.MANUGURU_LISTINGS
  : [];

const normalize = value =>
  String(value ?? "").toLocaleLowerCase().trim();

const allCategories = [
  ...new Set(
    listings
      .map(item => String(item.category || "").trim())
      .filter(Boolean)
  )
].sort((a, b) => a.localeCompare(b));

function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function iconFor(category) {
  return CATEGORY_ICONS[category] || "📍";
}

/* Populate the category dropdown */
function buildCategoryFilter() {
  const filter = $("categoryFilter");
  if (!filter) return;

  filter.replaceChildren();

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All categories";
  filter.appendChild(allOption);

  allCategories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    filter.appendChild(option);
  });
}

/* Filter and sort the directory */
function filteredListings() {
  const query = normalize(state.query);

  return listings
    .filter(item => {
      const searchableText = normalize([
        item.name,
        item.category,
        item.area,
        item.phone
      ].join(" "));

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesCategory =
        !state.category || item.category === state.category;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (state.sort === "category") {
        return String(a.category || "").localeCompare(
          String(b.category || "")
        ) || String(a.name || "").localeCompare(
          String(b.name || "")
        );
      }

      return String(a.name || "").localeCompare(
        String(b.name || "")
      );
    });
}

/* Create a listing card */
function createListingCard(item) {
  const card = document.createElement("article");
  card.className = "listing-card";

  const name = item.name || "Unnamed listing";
  const category = item.category || "Local listing";
  const area = item.area || "Exact address not listed";
  const phone = String(item.phone || "").trim();

  const phoneDigits = phone.replace(/[^\d+]/g, "");
  const hasPhone = /\d{5,}/.test(phoneDigits);

  const mapQuery = [
    name,
    area,
    "Manuguru",
    "Telangana"
  ].join(" ");

  card.innerHTML = `
    <div class="listing-top">
      <span class="listing-icon" aria-hidden="true">
        ${iconFor(category)}
      </span>
      <span class="category-tag">${safeText(category)}</span>
    </div>

    <h3>${safeText(name)}</h3>

    <div class="listing-location">
      <span aria-hidden="true">⌖</span>
      <span>${safeText(area)}</span>
    </div>

    <div class="listing-actions">
      ${
        hasPhone
          ? `<a class="action primary"
                href="tel:${safeText(phoneDigits)}">Call</a>`
          : `<span class="action disabled">Phone not listed</span>`
      }

      <a class="action"
         href="https://www.google.com/maps/search/?api=1&amp;query=${encodeURIComponent(mapQuery)}"
         target="_blank"
         rel="noopener noreferrer">Directions ↗</a>
    </div>
  `;

  return card;
}

/* Render the directory */
function renderListings() {
  const grid = $("listingGrid");
  if (!grid) return;

  const items = filteredListings();
  const fragment = document.createDocumentFragment();

  items.forEach(item => {
    fragment.appendChild(createListingCard(item));
  });

  grid.replaceChildren(fragment);

  const resultCount = $("resultCount");
  if (resultCount) {
    resultCount.textContent =
      `Showing ${items.length} of ${listings.length} listings`;
  }

  const emptyState = $("emptyState");
  if (emptyState) {
    emptyState.hidden = items.length > 0;
  }

  const totalCount = $("totalCount");
  if (totalCount) {
    totalCount.textContent = `${listings.length} listings`;
  }

  const heroCount = $("heroCount");
  if (heroCount) {
    heroCount.textContent = listings.length.toLocaleString();
  }

  const title = $("directoryTitle");
  if (title) {
    title.textContent = state.category
      ? `${state.category} in Manuguru`
      : "Explore Manuguru";
  }

  document.querySelectorAll("[data-category]").forEach(element => {
    element.classList.toggle(
      "active",
      element.dataset.category === state.category
    );
  });
}

/* Search form */
const searchForm = $("searchForm");

if (searchForm) {
  searchForm.addEventListener("submit", event => {
    event.preventDefault();

    state.query = $("searchInput")?.value || "";
    renderListings();

    $("directory")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
}

/* Live search */
const searchInput = $("searchInput");

if (searchInput) {
  searchInput.addEventListener("input", event => {
    state.query = event.target.value;
    renderListings();
  });
}

/* Category dropdown */
const categoryFilter = $("categoryFilter");

if (categoryFilter) {
  categoryFilter.addEventListener("change", event => {
    state.category = event.target.value;
    renderListings();
  });
}

/* Sorting */
const sortFilter = $("sortFilter");

if (sortFilter) {
  sortFilter.addEventListener("change", event => {
    state.sort = event.target.value;
    renderListings();
  });
}

/* Clear filters */
const clearFilters = $("clearFilters");

if (clearFilters) {
  clearFilters.addEventListener("click", () => {
    state.query = "";
    state.category = "";
    state.sort = "name";

    if ($("searchInput")) $("searchInput").value = "";
    if ($("categoryFilter")) $("categoryFilter").value = "";
    if ($("sortFilter")) $("sortFilter").value = "name";

    renderListings();
  });
}

/* Category shortcut navigation */
document.querySelectorAll("[data-category]").forEach(element => {
  element.addEventListener("click", event => {
    const category = element.dataset.category;

    if (!allCategories.includes(category)) return;

    event.preventDefault();

    state.category = category;
    state.query = "";

    if ($("searchInput")) $("searchInput").value = "";
    if ($("categoryFilter")) {
      $("categoryFilter").value = category;
    }

    renderListings();

    $("directory")?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});

/* Footer year */
const year = $("year");

if (year) {
  year.textContent = new Date().getFullYear();
}

/* Initialise the directory */
buildCategoryFilter();
renderListings();
