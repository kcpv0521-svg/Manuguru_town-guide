
/* ==========================================
   MANUGURU TOWN GUIDE
   Directory search, filters and navigation
========================================== */

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
  "Banks, ATMs & Public Services": "🏦",
  "Temples, Theatres & Places": "📍"
};

const state = {
  query: "",
  category: "",
  sort: "name"
};

const $ = id => document.getElementById(id);

const normalize = value =>
  String(value ?? "").toLocaleLowerCase().trim();

const listings = Array.isArray(window.MANUGURU_LISTINGS)
  ? window.MANUGURU_LISTINGS
  : [];

const allCategories = [
  ...new Set(listings.map(item => item.category).filter(Boolean))
].sort((a, b) => a.localeCompare(b));

/* Safely display text from directory records */
function safeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

/* Populate category filters without duplicate options */
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

/* Category icon helper */
function iconFor(category) {
  return CATEGORY_ICONS[category] || "📍";
}

/* Search and filter records */
function filteredListings() {
  const items = listings.filter(item => {
    const name = item.name || "";
    const category = item.category || "";
    const area = item.area || "";
    const phone = item.phone || "";

    const searchableText = normalize(
      `${name} ${category} ${area} ${phone}`
    );

    const matchesSearch =
      !state.query || searchableText.includes(normalize(state.query));

    const matchesCategory =
      !state.category || category === state.category;

    return matchesSearch && matchesCategory;
  });

  items.sort((a, b) => {
    if (state.sort === "category") {
      return (a.category || "").localeCompare(b.category || "") ||
        (a.name || "").localeCompare(b.name || "");
    }

    return (a.name || "").localeCompare(b.name || "");
  });

  return items;
}

/* Build a directory card */
function createListingCard(item) {
  const card = document.createElement("article");
  card.className = "listing-card";

  const name = item.name || "Unnamed listing";
  const category = item.category || "Local listing";
  const area = item.area || "Manuguru; exact address not listed";
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
      <span class="listing-icon">${iconFor(category)}</span>
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

/* Render filtered directory results */
function renderListings() {
  const grid = $("listingGrid");
  if (!grid) return;

  const items = filteredListings();
  grid.replaceChildren();

  const fragment = document.createDocumentFragment();

  items.forEach(item => {
    fragment.appendChild(createListingCard(item));
  });

  grid.appendChild(fragment);

  const resultCount = $("resultCount");
  if (resultCount) {
    resultCount.textContent =
      `Showing ${items.length} of ${listings.length} listings`;
  }

  const emptyState = $("emptyState");
  if (emptyState) {
    emptyState.hidden = items.length !== 0;
  }

  const totalCount = $("totalCount");
  if (totalCount) {
    totalCount.textContent = `${listings.length} listings`;
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

/* Connect the existing search form */
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

/* Update results while typing */
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

/* Clear all filters */
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

/* Category shortcuts can filter the directory when configured */
document.querySelectorAll("[data-category]").forEach(element => {
  element.addEventListener("click", event => {
    const category = element.dataset.category;

    if (!allCategories.includes(category)) return;

    event.preventDefault();

    state.category = category;

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

/* Initialise */
buildCategoryFilter();
renderListings();
