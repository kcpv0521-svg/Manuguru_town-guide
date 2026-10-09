
/* ==========================================
   MANUGURU TOWN GUIDE
   Search, filters, sorting and listing cards
   ========================================== */

(() => {
  "use strict";

  const listings = Array.isArray(window.MANUGURU_LISTINGS)
    ? window.MANUGURU_LISTINGS
    : Array.isArray(window.TOWN_GUIDE_DATA)
      ? window.TOWN_GUIDE_DATA
      : [];

  const $ = (id) => document.getElementById(id);

  const searchForm = $("searchForm");
  const searchInput = $("searchInput");
  const categoryFilter = $("categoryFilter");
  const sortFilter = $("sortFilter");
  const listingGrid = $("listingGrid");
  const resultCount = $("resultCount");
  const directoryTitle = $("directoryTitle");
  const directorySubtitle = $("directorySubtitle");
  const clearFilters = $("clearFilters");
  const emptyState = $("emptyState");

  const CATEGORY_ICONS = {
    "Schools": "🎓",
    "Colleges & Training": "📚",
    "Clothing, Jewellery & Tailoring": "👕",
    "Mobile, Electronics & Computers": "📱",
    "Grocery & Supermarkets": "🛒",
    "Hospitals & Clinics": "🏥",
    "Medical Stores & Pharmacies": "💊",
    "Restaurants & Food": "🍽️",
    "Hotels & Lodges": "🏨",
    "Salons, Beauty & Personal Care": "✂️",
    "Petrol Bunks & Automotive": "🚗",
    "Banks, Atms & Public Services": "🏦",
    "Temples, Theatres & Places": "📍",
    "Transport": "🚌"
  };

  const CATEGORY_GROUPS = {
    "Shopping & Daily Needs": [
      "Grocery & Supermarkets"
    ],
    "Food & Restaurants": [
      "Restaurants & Food",
      "Hotels & Lodges"
    ],
    "Healthcare": [
      "Hospitals & Clinics",
      "Medical Stores & Pharmacies"
    ],
    "Education": [
      "Schools",
      "Colleges & Training"
    ],
    "Banks & Public Services": [
      "Banks, Atms & Public Services"
    ],
    "Electronics & Mobile": [
      "Mobile, Electronics & Computers"
    ],
    "Automotive & Fuel": [
      "Petrol Bunks & Automotive"
    ],
    "Fashion & Jewellery": [
      "Clothing, Jewellery & Tailoring"
    ],
    "Transport": [
      "Transport"
    ]
  };

  let activeShortcut = "";

  function normalize(value) {
    return String(value ?? "")
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function getCategoryNames() {
    return [...new Set(
      listings
        .map((item) => item.category)
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));
  }

  function setupCategoryFilter() {
    if (!categoryFilter) return;

    const currentValue = categoryFilter.value;

    categoryFilter.innerHTML =
      '<option value="">All categories</option>' +
      getCategoryNames().map((category) =>
        `<option value="${escapeHTML(category)}">${escapeHTML(category)}</option>`
      ).join("");

    if ([...categoryFilter.options].some(
      (option) => option.value === currentValue
    )) {
      categoryFilter.value = currentValue;
    }
  }

  function getShortcutCategories(shortcut) {
    if (CATEGORY_GROUPS[shortcut]) {
      return CATEGORY_GROUPS[shortcut];
    }

    return [shortcut];
  }

  function getFilteredListings() {
    const query = normalize(searchInput?.value);
    const selectedCategory = categoryFilter?.value || "";
    const sortBy = sortFilter?.value || "name";

    let results = listings.filter((item) => {
      const searchableText = normalize([
        item.name,
        item.category,
        item.area,
        item.address,
        item.description
      ].filter(Boolean).join(" "));

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesFilter =
        !selectedCategory || item.category === selectedCategory;

      const shortcutCategories =
        activeShortcut ? getShortcutCategories(activeShortcut) : [];

      const matchesShortcut =
        !activeShortcut || shortcutCategories.includes(item.category);

      return matchesSearch && matchesFilter && matchesShortcut;
    });

    results.sort((a, b) => {
      if (sortBy === "category") {
        return String(a.category || "").localeCompare(
          String(b.category || "")
        ) || String(a.name || "").localeCompare(String(b.name || ""));
      }

      if (sortBy === "area") {
        return String(a.area || a.address || "").localeCompare(
          String(b.area || b.address || "")
        );
      }

      return String(a.name || "").localeCompare(
        String(b.name || "")
      );
    });

    return results;
  }

  function createListingCard(item) {
    const name = escapeHTML(item.name || "Unnamed listing");
    const category = escapeHTML(item.category || "Local listing");
    const area = escapeHTML(item.area || item.address || "Location not provided");
    const icon = CATEGORY_ICONS[item.category] || "📍";

    const phone = String(item.phone || "").replace(/[^\d+]/g, "");
    const callButton = phone
      ? `<a class="listing-action" href="tel:${escapeHTML(phone)}">Call</a>`
      : "";

    const mapQuery = encodeURIComponent(
      `${item.name || ""}, ${item.area || item.address || ""}, Manuguru, Telangana`
    );

    const directionsButton =
      `<a class="listing-action listing-action-secondary"
          href="https://www.google.com/maps/search/?api=1&query=${mapQuery}"
          target="_blank"
          rel="noopener noreferrer">Directions</a>`;

    return `
      <article class="listing-card">
        <div class="listing-card-icon" aria-hidden="true">${icon}</div>
        <div class="listing-card-content">
          <p class="listing-category">${category}</p>
          <h3>${name}</h3>
          <p class="listing-area">📍 ${area}</p>
          <div class="listing-actions">
            ${callButton}
            ${directionsButton}
          </div>
        </div>
      </article>
    `;
  }

  function renderListings() {
    if (!listingGrid) return;

    const results = getFilteredListings();

    listingGrid.innerHTML = results
      .map(createListingCard)
      .join("");

    if (resultCount) {
      resultCount.textContent =
        `${results.length} ${results.length === 1 ? "listing" : "listings"} found`;
    }

    if (emptyState) {
      emptyState.hidden = results.length !== 0;
    }

    if (listingGrid) {
      listingGrid.hidden = results.length === 0;
    }

    if (directoryTitle) {
      directoryTitle.textContent = activeShortcut
        ? activeShortcut
        : categoryFilter?.value || "Explore the Directory";
    }

    if (directorySubtitle) {
      directorySubtitle.textContent = activeShortcut
        ? `Discover ${activeShortcut.toLowerCase()} in Manuguru.`
        : "Find local businesses, essential services and places around Manuguru.";
    }
  }

  function resetFilters() {
    if (searchInput) searchInput.value = "";
    if (categoryFilter) categoryFilter.value = "";
    if (sortFilter) sortFilter.value = "name";

    activeShortcut = "";
    renderListings();
  }

  if (searchForm) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      renderListings();

      $("directory")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderListings);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", () => {
      activeShortcut = "";
      renderListings();
    });
  }

  if (sortFilter) {
    sortFilter.addEventListener("change", renderListings);
  }

  if (clearFilters) {
    clearFilters.addEventListener("click", resetFilters);
  }

  document.querySelectorAll("[data-category]").forEach((element) => {
    element.addEventListener("click", (event) => {
      const shortcut = element.dataset.category;
      if (!shortcut) return;

      event.preventDefault();

      activeShortcut = shortcut;

      if (categoryFilter) {
        categoryFilter.value = "";
      }

      renderListings();

      $("directory")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  const yearElement = $("year");
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  setupCategoryFilter();
  renderListings();

  console.info(
    `Manuguru Town Guide initialized with ${listings.length} listings.`
  );
})();
