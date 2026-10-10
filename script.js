(() => {
  "use strict";
  const listings = Array.isArray(window.MANUGURU_LISTINGS) ? window.MANUGURU_LISTINGS :
    Array.isArray(window.TOWN_GUIDE_DATA) ? window.TOWN_GUIDE_DATA : [];
  const $ = id => document.getElementById(id);
  const icons = {
    "Schools":"🎓","Colleges & Training":"🎓","Clothing, Jewellery & Tailoring":"🛍️",
    "Mobile, Electronics & Computers":"📱","Grocery & Supermarkets":"🛒",
    "Hospitals & Clinics":"🩺","Medical Stores & Pharmacies":"💊","Restaurants & Food":"🍽️",
    "Hotels & Lodges":"🏨","Salons, Beauty & Personal Care":"✂️",
    "Petrol Bunks & Automotive":"⛽","Banks, Atms & Public Services":"🏛️",
    "Banks, ATMs & Public Services":"🏛️","Temples, Theatres & Places":"📍","Transport":"🚌"
  };
  const categories = [
    {label:"Businesses & Shops", description:"Stores, restaurants, services and more", match:["Grocery & Supermarkets","Clothing, Jewellery & Tailoring","Mobile, Electronics & Computers","Restaurants & Food","Hotels & Lodges"], icon:"🏪", tone:"orange"},
    {label:"Healthcare", description:"Hospitals, clinics, pharmacies and diagnostic centers", match:["Hospitals & Clinics","Medical Stores & Pharmacies"], icon:"♧", tone:"red"},
    {label:"Public Services", description:"Municipality, public offices and essential contacts", match:["Banks, Atms & Public Services","Banks, ATMs & Public Services"], icon:"🏛️", tone:"blue"},
    {label:"Home Services", description:"Electricians, plumbers, mechanics and repair services", match:["Home Services"], icon:"🛠️", tone:"purple"},
    {label:"Education", description:"Schools, colleges, coaching and more", match:["Schools","Colleges & Training"], icon:"🎓", tone:"green"},
    {label:"Transport", description:"Travel, auto services, logistics and more", match:["Transport","Petrol Bunks & Automotive"], icon:"🚌", tone:"cyan"},
    {label:"Fashion & Personal Care", description:"Clothing, jewellery, salons and beauty", match:["Clothing, Jewellery & Tailoring","Salons, Beauty & Personal Care"], icon:"✂️", tone:"rose"},
    {label:"Places & Attractions", description:"Temples, theatres and local places", match:["Temples, Theatres & Places"], icon:"📍", tone:"gold"}
  ];
  const state = {query:"", category:"", group:"", sort:"name", language:"en"};
  const normalize = value => String(value ?? "").toLocaleLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").trim();
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  function getGroup(item, group) {
    const def = categories.find(c => c.label === group);
    return !def || def.match.includes(item.category);
  }
  function buildCategoryCards() {
    const grid = $("categoryGrid");
    if (!grid) return;
    grid.innerHTML = categories.map(c => `
      <button class="category-card" type="button" data-group="${esc(c.label)}" aria-label="Browse ${esc(c.label)}">
        <span class="category-symbol ${c.tone}">${c.icon}</span>
        <strong>${esc(c.label)}</strong>
        <small>${esc(c.description)}</small><span class="category-arrow" aria-hidden="true">›</span>
      </button>`).join("");
    grid.querySelectorAll("[data-group]").forEach(btn => btn.addEventListener("click", () => {
      state.group = btn.dataset.group; state.category = "";
      if ($("categoryFilter")) $("categoryFilter").value = "";
      render(); $("directory").scrollIntoView({behavior:"smooth"});
    }));
  }
  function buildFilter() {
    const select = $("categoryFilter");
    if (!select) return;
    const value = select.value;
    const names = [...new Set(listings.map(x => x.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    select.innerHTML = '<option value="">All categories</option>' + names.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join("");
    if (names.includes(value)) select.value = value;
  }
  function filtered() {
    const query = normalize(state.query);
    let result = listings.filter(item => {
      const text = normalize([item.name,item.category,item.area,item.address,item.description].filter(Boolean).join(" "));
      return (!query || text.includes(query)) &&
        (!state.category || item.category === state.category) &&
        getGroup(item,state.group);
    });
    result.sort((a,b) => {
      if (state.sort === "category") return String(a.category||"").localeCompare(String(b.category||"")) || String(a.name||"").localeCompare(String(b.name||""));
      if (state.sort === "area") return String(a.area||a.address||"").localeCompare(String(b.area||b.address||""));
      return String(a.name||"").localeCompare(String(b.name||""));
    });
    return result;
  }
  function card(item) {
    const phone = String(item.phone || "").replace(/[^\d+]/g,"");
    const query = encodeURIComponent(`${item.name || ""}, ${item.area || item.address || ""}, Manuguru, Telangana`);
    const call = phone ? `<a class="action primary" href="tel:${esc(phone)}">Call</a>` : `<span class="action disabled" aria-label="No phone number available">Phone unavailable</span>`;
    return `<article class="listing-card">
      <div class="listing-top"><span class="listing-icon">${icons[item.category] || "📍"}</span><span class="category-tag">${esc(item.category || "Local listing")}</span></div>
      <h3>${esc(item.name || "Unnamed listing")}</h3>
      <p class="listing-location"><span aria-hidden="true">⌖</span><span>${esc(item.area || item.address || "Location not provided")}</span></p>
      <div class="listing-actions">${call}<a class="action" href="https://www.google.com/maps/search/?api=1&query=${query}" target="_blank" rel="noopener noreferrer">Directions ↗</a></div>
    </article>`;
  }
  function render() {
    const result = filtered();
    const grid = $("listingGrid");
    if (grid) grid.innerHTML = result.map(card).join("");
    if ($("resultCount")) $("resultCount").textContent = `${result.length} ${result.length === 1 ? "listing" : "listings"} found`;
    if ($("emptyState")) $("emptyState").hidden = result.length !== 0;
    if ($("listingGrid")) $("listingGrid").hidden = result.length === 0;
    if ($("directoryTitle")) $("directoryTitle").textContent = state.group || state.category || (state.query ? `Results for “${state.query}”` : "Explore Manuguru");
    if ($("directorySubtitle")) $("directorySubtitle").textContent = state.group ? `Browse ${state.group.toLowerCase()} in Manuguru.` : "Find businesses, public services and useful places around town.";
    document.querySelectorAll(".category-card[data-group]").forEach(btn => btn.classList.toggle("active",btn.dataset.group === state.group));
    if ($("totalCount")) $("totalCount").textContent = `${listings.length} listings`;
  }
  function clear() {
    state.query = ""; state.category = ""; state.group = ""; state.sort = "name";
    if ($("searchInput")) $("searchInput").value = "";
    if ($("categoryFilter")) $("categoryFilter").value = "";
    if ($("sortFilter")) $("sortFilter").value = "name";
    render();
  }
  $("searchForm")?.addEventListener("submit", e => {
    e.preventDefault(); state.query = $("searchInput")?.value || ""; state.group = ""; state.category = "";
    if ($("categoryFilter")) $("categoryFilter").value = "";
    render(); $("directory").scrollIntoView({behavior:"smooth"});
  });
  $("searchInput")?.addEventListener("input", () => { state.query = $("searchInput").value; render(); });
  $("categoryFilter")?.addEventListener("change", e => { state.category = e.target.value; state.group = ""; render(); });
  $("sortFilter")?.addEventListener("change", e => { state.sort = e.target.value; render(); });
  $("clearFilters")?.addEventListener("click", clear);
  $("emptyClear")?.addEventListener("click", clear);
  document.querySelectorAll("[data-query]").forEach(btn => btn.addEventListener("click", () => {
    state.query = btn.dataset.query || ""; state.group = ""; state.category = "";
    if ($("searchInput")) $("searchInput").value = state.query;
    if ($("categoryFilter")) $("categoryFilter").value = "";
    render(); $("directory").scrollIntoView({behavior:"smooth"});
  }));
  document.querySelectorAll(".service-highlight[data-category]").forEach(btn => btn.addEventListener("click", () => {
    state.category = ""; state.query = ""; state.group = btn.dataset.category === "Transport" ? "Transport" :
      btn.dataset.category === "Temples, Theatres & Places" ? "Places & Attractions" : "Public Services";
    if ($("searchInput")) $("searchInput").value = "";
    if ($("categoryFilter")) $("categoryFilter").value = "";
    render(); $("directory").scrollIntoView({behavior:"smooth"});
  }));
  function setLanguage(language) {
    state.language = language;
    document.body.classList.toggle("telugu",language === "te");
    document.documentElement.lang = language === "te" ? "te" : "en";
    document.querySelectorAll("[data-en][data-te]").forEach(el => {
      el.textContent = el.dataset[language];
      if (el.id === "heroTitle" && language === "en") el.innerHTML = "Your Manuguru,<br><em>All in One Place</em>";
      if (el.id === "heroTitle" && language === "te") el.innerHTML = "మన మణుగూరు,<br><em>అన్నీ ఒకే చోట</em>";
    });
    $("englishButton")?.classList.toggle("selected",language === "en");
    $("teluguButton")?.classList.toggle("selected",language === "te");
    if ($("searchInput")) $("searchInput").placeholder = language === "te" ? "వ్యాపారాలు, సేవలు లేదా ప్రభుత్వ కార్యాలయాలను వెతకండి..." : "Search businesses, services, or public offices...";
  }
  $("englishButton")?.addEventListener("click",()=>setLanguage("en"));
  $("teluguButton")?.addEventListener("click",()=>setLanguage("te"));
  if ($("year")) $("year").textContent = new Date().getFullYear();
  buildCategoryCards(); buildFilter(); render();
})();