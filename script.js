const CATEGORY_ICONS = {
  "Schools": "🎓", "Colleges & Training": "🏫", "Clothing, Jewellery & Tailoring": "🛍️",
  "Mobile, Electronics & Computers": "📱", "Grocery & Supermarkets": "🛒",
  "Hospitals & Clinics": "🏥", "Medical Stores & Pharmacies": "💊",
  "Restaurants & Food": "🍽️", "Hotels & Lodges": "🛏️",
  "Salons, Beauty & Personal Care": "💇", "Petrol Bunks & Automotive": "⛽",
  "Banks, ATMs & Public Services": "🏦", "Temples, Theatres & Places": "📍"
};
const MAIN_CATEGORIES = [
  {label:"Schools", match:["Schools"], icon:"🎓"},
  {label:"Colleges", match:["Colleges & Training"], icon:"🏫"},
  {label:"Clothing & Jewellery", match:["Clothing, Jewellery & Tailoring"], icon:"🛍️"},
  {label:"Mobile & Electronics", match:["Mobile, Electronics & Computers"], icon:"📱"},
  {label:"Grocery & Supermarkets", match:["Grocery & Supermarkets"], icon:"🛒"},
  {label:"Hospitals & Clinics", match:["Hospitals & Clinics"], icon:"🏥"},
  {label:"Medical Stores", match:["Medical Stores & Pharmacies"], icon:"💊"},
  {label:"Restaurants & Food", match:["Restaurants & Food"], icon:"🍽️"},
  {label:"Hotels & Lodges", match:["Hotels & Lodges"], icon:"🛏️"},
  {label:"Salons & Beauty", match:["Salons, Beauty & Personal Care"], icon:"💇"},
  {label:"Petrol Bunks", match:["Petrol Bunks & Automotive"], icon:"⛽"},
  {label:"Banks & Public Services", match:["Banks, ATMs & Public Services"], icon:"🏦"},
  {label:"Temples & Places", match:["Temples, Theatres & Places"], icon:"📍"}
];
const state = { query:"", category:"", sort:"name" };
const $ = (id) => document.getElementById(id);
const normalized = (value) => String(value || "").toLowerCase().trim();
const allCategories = [...new Set(MANUGURU_LISTINGS.map(item => item.category))];

function buildCategories() {
  const grid = $("categoryGrid");
  MAIN_CATEGORIES.forEach(cat => {
    const count = MANUGURU_LISTINGS.filter(item => cat.match.includes(item.category)).length;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-card";
    button.dataset.category = cat.match[0];
    button.innerHTML = `<span class="category-icon">${cat.icon}</span><strong>${cat.label}</strong>`;
    button.title = `${count} listings currently in this category`;
    button.addEventListener("click", () => {
      state.category = state.category === cat.match[0] ? "" : cat.match[0];
      $("categoryFilter").value = state.category;
      updateActiveCategory();
      renderListings();
      $("directory").scrollIntoView({behavior:"smooth"});
    });
    grid.appendChild(button);
  });
  const filter = $("categoryFilter");
  allCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    filter.appendChild(option);
  });
  $("totalCount").textContent = `${MANUGURU_LISTINGS.length} listings`;
}
function updateActiveCategory() {
  document.querySelectorAll(".category-card").forEach(card => {
    card.classList.toggle("active", card.dataset.category === state.category);
  });
  const category = MAIN_CATEGORIES.find(c => c.match[0] === state.category);
  $("directoryTitle").textContent = category ? `${category.label} in Manuguru` : "Explore Manuguru";
}
function iconFor(category) { return CATEGORY_ICONS[category] || "📍"; }
function filteredListings() {
  let items = MANUGURU_LISTINGS.filter(item => {
    const matchesCategory = !state.category || item.category === state.category;
    const haystack = normalized(`${item.name} ${item.category} ${item.area}`);
    return matchesCategory && haystack.includes(normalized(state.query));
  });
  items.sort((a,b) => state.sort === "category"
    ? a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
    : a.name.localeCompare(b.name));
  return items;
}
function safeText(text) {
  return String(text || "").replace(/[&<>"']/g, char => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[char]));
}
function renderListings() {
  const grid = $("listingGrid");
  const items = filteredListings();
  grid.replaceChildren();
  $("resultCount").textContent = `Showing ${items.length} of ${MANUGURU_LISTINGS.length} listings`;
  $("emptyState").hidden = items.length !== 0;
  items.forEach(item => {
    const card = document.createElement("article");
    card.className = "listing-card";
    const hasPhone = item.phone && item.phone.trim();
    const phoneHref = hasPhone ? `tel:${item.phone.replace(/[^\d+]/g,"")}` : "";
    card.innerHTML = `
      <div class="listing-top"><span class="listing-icon">${iconFor(item.category)}</span><span class="category-tag">${safeText(item.category)}</span></div>
      <h3>${safeText(item.name)}</h3>
      <div class="listing-location"><span>⌖</span><span>${safeText(item.area || "Manuguru; exact address not listed")}</span></div>
      <div class="listing-actions">
        ${hasPhone ? `<a class="action primary" href="${safeText(phoneHref)}">Call business</a>` : `<span class="action disabled">Phone not listed</span>`}
        <a class="action" target="_blank" rel="noopener noreferrer" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name+" "+item.area+" Manuguru Telangana")}">Directions ↗</a>
      </div>`;
    grid.appendChild(card);
  });
}
$("searchForm").addEventListener("submit", event => {
  event.preventDefault();
  state.query = $("searchInput").value;
  renderListings();
  $("directory").scrollIntoView({behavior:"smooth"});
});
$("searchInput").addEventListener("input", event => {
  state.query = event.target.value;
  renderListings();
});
$("categoryFilter").addEventListener("change", event => {
  state.category = event.target.value;
  updateActiveCategory();
  renderListings();
});
$("sortFilter").addEventListener("change", event => {
  state.sort = event.target.value;
  renderListings();
});
$("clearFilters").addEventListener("click", () => {
  state.query = ""; state.category = ""; state.sort = "name";
  $("searchInput").value = ""; $("categoryFilter").value = ""; $("sortFilter").value = "name";
  updateActiveCategory(); renderListings();
});
$("year").textContent = new Date().getFullYear();
buildCategories();
updateActiveCategory();
renderListings();