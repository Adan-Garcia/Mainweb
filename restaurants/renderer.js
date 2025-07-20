const restaurantList = document.getElementById("restaurantList");
const locationFilter = document.getElementById("locationFilter");
const mealFilter = document.getElementById("mealFilter");
const sortOption = document.getElementById("sortOption");
const searchInput = document.getElementById("searchInput");
const minPriceInput = document.getElementById("minPriceInput");
const maxPriceInput = document.getElementById("maxPriceInput");
const serviceTypeFilter = document.getElementById("serviceTypeFilter");

const dialog = document.getElementById("addDialog");

const nameInput = document.getElementById("nameInput");
const locationInput = document.getElementById("locationInput");
const mealInput = document.getElementById("mealInput");
const ratingInput = document.getElementById("ratingInput");
const favoriteInput = document.getElementById("favoriteInput");
const descInput = document.getElementById("descInput");
const categoryInput = document.getElementById("categoryInput");
const priceAndCuisineInput = document.getElementById("priceAndCuisineInput");
const venueLocationInput = document.getElementById("venueLocationInput");
const serviceTypeInput = document.getElementById("serviceTypeInput");
const imageInput = document.getElementById("imageInput");
const altInput = document.getElementById("altInput");

let data = [];
let editingIndex = null;

async function loadAndRender() {
  data = loadData() || [];
  renderList();
}
function importData(file) {
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const imported = JSON.parse(event.target.result);
      saveData(imported); // Save to localStorage
      alert("Data imported successfully!");
      // optionally refresh the UI here
    } catch (e) {
      alert("Invalid file format.");
    }
  };
  reader.readAsText(file);
}
function exportData() {
  const data = localStorage.getItem("restaurantData");
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "restaurants.json";
  a.click();

  URL.revokeObjectURL(url);
}
function loadData() {
  const data = localStorage.getItem("restaurantData");
  return data ? JSON.parse(data) : null;
}
function saveData(data) {
  localStorage.setItem("restaurantData", JSON.stringify(data));
}

function renderList() {
  restaurantList.innerHTML = "";

  // Parse price filter inputs
  const minPriceFilter = parseFloat(minPriceInput.value);
  const maxPriceFilter = parseFloat(maxPriceInput.value);

  // Prepare global search string (lowercase)
  const searchTerm = searchInput.value.trim().toLowerCase();

  // Filters
  const filtered = data.filter((r) => {
    const locOk =
      locationFilter.value === "All" || r.location === locationFilter.value;
    const mealOk = mealFilter.value === "All" || r.meal === mealFilter.value;
    const serviceTypeOk =
      serviceTypeFilter.value === "All" ||
      r.serviceType === serviceTypeFilter.value;
    // Safely parse minPrice and maxPrice from data (fall back to 0 / Infinity)
    const minPrice = typeof r.minPrice === "number" ? r.minPrice : 0;
    const maxPrice = typeof r.maxPrice === "number" ? r.maxPrice : Infinity;

    // Price filtering:
    const priceOk =
      (isNaN(minPriceFilter) || maxPrice >= minPriceFilter) &&
      (isNaN(maxPriceFilter) || minPrice <= maxPriceFilter);

    // Global search: check all string fields, including alt text and nested info
    const fieldsToSearch = [
      r.name,
      r.location,
      r.meal,
      r.category,
      r.serviceType,
      r.priceAndCuisine,
      r.venueLocation,
      r.description,
      r.alt,
    ];

    const matchesSearch =
      searchTerm === "" ||
      fieldsToSearch.some(
        (field) => field && String(field).toLowerCase().includes(searchTerm)
      );

    return locOk && mealOk && priceOk && matchesSearch && serviceTypeOk;
  });

  // Sorting
  let sorted = [...filtered];
  switch (sortOption.value) {
    case "rating":
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;

    case "favorite":
      sorted.sort((a, b) => (b.favorite ? 1 : 0) - (a.favorite ? 1 : 0));
      break;

    case "minPriceAsc":
      sorted.sort(
        (a, b) => (a.minPrice || Infinity) - (b.minPrice || Infinity)
      );
      break;

    case "minPriceDesc":
      sorted.sort((a, b) => (b.minPrice || 0) - (a.minPrice || 0));
      break;

    case "maxPriceAsc":
      sorted.sort(
        (a, b) => (a.maxPrice || Infinity) - (b.maxPrice || Infinity)
      );
      break;

    case "maxPriceDesc":
      sorted.sort((a, b) => (b.maxPrice || 0) - (a.maxPrice || 0));
      break;

    default:
      // default sort (maybe by name or leave as-is)
      break;
  }

  // Render each restaurant card with updated layout
  for (const rest of sorted) {
    const originalIndex = data.indexOf(rest);
    const el = document.createElement("div");
    el.className = "card";

    el.innerHTML = `
    <div class="text-content">
      <h3>${rest.favorite ? "❤️ " : ""}${rest.name}</h3>
      <small>
        ${rest.location} | ${rest.meal || "Unknown"} | ⭐${rest.rating || "–"}
      </small>
      <p><strong>Category:</strong> ${rest.category || "N/A"}</p>
      <p><strong>Price & Cuisine:</strong> ${rest.priceAndCuisine || "N/A"}</p>
      <p><strong>Venue Location:</strong> ${rest.venueLocation || "N/A"}</p>
      <p><strong>Service Type:</strong> ${rest.serviceType || "N/A"}</p>
      <p>${rest.description || ""}</p>
      <div class="card-actions">
        <button onclick="edit(${originalIndex})">Edit</button>
        <button onclick="del(${originalIndex})">Delete</button>
      </div>
    </div>
    ${
      rest.image
        ? `<img src="${rest.image}" alt="${
            rest.alt || rest.name
          }" loading="lazy" />`
        : ""
    }
  `;
    restaurantList.appendChild(el);
  }

  updateServiceTypeFilterOptions();
  updateLocationFilterOptions();
  updateMealFilterOptions();
}

function updateMealFilterOptions() {
  const currentMeal = mealFilter.value;
  const meals = [...new Set(data.map((d) => d.meal).filter(Boolean))];

  mealFilter.innerHTML =
    `<option value="All">All Meals</option>` +
    meals
      .map(
        (m) =>
          `<option value="${m}" ${
            m === currentMeal ? "selected" : ""
          }>${m}</option>`
      )
      .join("");
}
function updateServiceTypeFilterOptions() {
  const currentSelection = serviceTypeFilter.value;
  const serviceTypes = [
    ...new Set(data.map((d) => d.serviceType).filter(Boolean)),
  ];

  serviceTypeFilter.innerHTML =
    `<option value="All">All Service Types</option>` +
    serviceTypes
      .map(
        (type) =>
          `<option value="${type}" ${
            type === currentSelection ? "selected" : ""
          }>${type}</option>`
      )
      .join("");
}

function updateLocationFilterOptions() {
  const currentSelection = locationFilter.value;
  const locations = [...new Set(data.map((d) => d.location).filter(Boolean))];

  locationFilter.innerHTML =
    `<option value="All">All Locations</option>` +
    locations
      .map(
        (loc) =>
          `<option value="${loc}" ${
            loc === currentSelection ? "selected" : ""
          }>${loc}</option>`
      )
      .join("");
}

document.getElementById("addBtn").onclick = () => {
  editingIndex = null;
  nameInput.value = "";
  locationInput.value = "";
  mealInput.value = "Lunch";
  ratingInput.value = "";
  favoriteInput.checked = false;
  descInput.value = "";
  dialog.showModal();
};

dialog.addEventListener("close", () => {
  if (!nameInput.value || !locationInput.value) return;

  const entry = {
    name: nameInput.value,
    location: locationInput.value,
    meal: mealInput.value,
    rating: parseInt(ratingInput.value) || 0,
    favorite: favoriteInput.checked,
    description: descInput.value,

    category: categoryInput.value,
    priceAndCuisine: priceAndCuisineInput.value,
    venueLocation: venueLocationInput.value,
    serviceType: serviceTypeInput.value,
    image: imageInput.value,
    alt: altInput.value,
  };

  if (editingIndex != null) {
    data[editingIndex] = entry;
  } else {
    data.push(entry);
  }

  saveData(data);
  renderList();
});

window.edit = (index) => {
  const r = data[index];
  editingIndex = index;

  nameInput.value = r.name || "";
  locationInput.value = r.location || "";
  mealInput.value = r.meal || "Lunch";
  ratingInput.value = r.rating || "";
  favoriteInput.checked = r.favorite || false;
  descInput.value = r.description || "";

  categoryInput.value = r.category || "";
  priceAndCuisineInput.value = r.priceAndCuisine || "";
  venueLocationInput.value = r.venueLocation || "";
  serviceTypeInput.value = r.serviceType || "";
  imageInput.value = r.image || "";
  altInput.value = r.alt || "";

  dialog.showModal();
};

window.del = (index) => {
  data.splice(index, 1);
  saveData(data);
  renderList();
};

// Event listeners for filters + search
locationFilter.onchange = renderList;
mealFilter.onchange = renderList;
sortOption.onchange = renderList;
searchInput.oninput = renderList;
minPriceInput.oninput = renderList;
maxPriceInput.oninput = renderList;
serviceTypeFilter.onchange = renderList;

// Initial load & render
loadAndRender();
