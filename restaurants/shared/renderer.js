const typeConfigs = {
  restaurant: {
    fields: ["detail", "type"],
    labels: {
      detail: "Price & Cuisine",
      type: "Service Type",
    },
  },
  store: {
    fields: ["location", "venue", "category", "type"],
    labels: {
      location: "Area",
      venue: "Venue",
      category: "Store Type",
      type: "Merch Type",
    },
  },
  ride: {
    fields: ["location", "category", "thrillLevel", "minHeight"],
    labels: {
      location: "Park",
      category: "Ride Type",
      thrillLevel: "Thrill",
      minHeight: "Min Height",
    },
  },
};

// Storage helpers
function loadData(type) {
  const stored = localStorage.getItem(type + "Data");
  return stored ? JSON.parse(stored) : null;
}

function saveData(type, data) {
  localStorage.setItem(type + "Data", JSON.stringify(data));
}

// Import / Export
function importDataf(file, type, onComplete) {
  const reader = new FileReader();
  reader.onload = function (event) {
    try {
      const imported = JSON.parse(event.target.result);
      saveData(type, imported);
      alert("Data imported successfully!");
      onComplete();
    } catch (e) {
      alert("Invalid file format.");
    }
  };
  reader.readAsText(file);
}

function exportDataf(type, data) {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${type}s.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Main Renderer
window.initRendererJS = function () {
  const appElement = document.getElementById("app");
  const typeAttr = appElement ? appElement.dataset.type : null;
  const type = validTypes.includes(typeAttr) ? typeAttr : "restaurant";

  let data = loadData(type) || [];
  let editingIndex = null;
  const config = typeConfigs[type] || { fields: [], labels: {} };

  // DOM references
  const entryList = document.getElementById("entryList");
  const locationFilter = document.getElementById("locationFilter");
  const tagFilter = document.getElementById("tagFilter");
  const typeFilter = document.getElementById("typeFilter");
  const sortOption = document.getElementById("sortOption");
  const searchInput = document.getElementById("searchInput");
  const minPriceInput = document.getElementById("minPriceInput");
  const maxPriceInput = document.getElementById("maxPriceInput");

  const dialog = document.getElementById("addDialog");
  const nameInput = document.getElementById("nameInput");
  const locationInput = document.getElementById("locationInput");
  const tagInput = document.getElementById("tagInput");
  const ratingInput = document.getElementById("ratingInput");
  const favoriteInput = document.getElementById("favoriteInput");
  const descInput = document.getElementById("descInput");
  const categoryInput = document.getElementById("categoryInput");
  const detailInput = document.getElementById("detailInput");
  const venueInput = document.getElementById("venueInput");
  const typeInput = document.getElementById("typeInput");
  const imageInput = document.getElementById("imageInput");
  const altInput = document.getElementById("altInput");

  function renderList() {
    entryList.innerHTML = "";

    const min = parseFloat(minPriceInput.value);
    const max = parseFloat(maxPriceInput.value);
    const search = searchInput.value.trim().toLowerCase();

    const filtered = data.filter((d) => {
      const locationOk =
        locationFilter.value === "All" || d.location === locationFilter.value;
      const tagOk = tagFilter.value === "All" || d.tag === tagFilter.value;
      const typeOk = typeFilter.value === "All" || d.type === typeFilter.value;

      const entryMin = typeof d.minPrice === "number" ? d.minPrice : 0;
      const entryMax = typeof d.maxPrice === "number" ? d.maxPrice : Infinity;

      const priceOk =
        (isNaN(min) || entryMax >= min) && (isNaN(max) || entryMin <= max);

      const fieldsToSearch = [
        d.name,
        d.location,
        d.tag,
        d.category,
        d.detail,
        d.venue,
        d.type,
        d.description,
        d.alt,
      ];

      const matchesSearch =
        search === "" ||
        fieldsToSearch.some((field) => field?.toLowerCase().includes(search));

      return locationOk && tagOk && typeOk && priceOk && matchesSearch;
    });

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
    }

    for (const entry of sorted) {
      const index = data.indexOf(entry);
      const el = document.createElement("div");
      el.className = "card";

      let dynamicFieldsHTML = "";
      for (const field of config.fields) {
        const value = entry[field];
        if (value !== undefined && value !== "") {
          const label = config.labels[field] || field;
          dynamicFieldsHTML += `<p><strong>${label}:</strong> ${value}</p>`;
        }
      }

      el.innerHTML = `
        <div class="text-content">
          <h3>${entry.favorite ? "❤️ " : ""}<a href="${
        entry.url || "#"
      }" target="_blank">${entry.name}</a></h3>
          <small>${entry.location || "Unknown"} | ${entry.tag || "Tag"} | ⭐${
        entry.rating || "–"
      }</small>
          ${dynamicFieldsHTML}
          <p>${entry.description || ""}</p>
          <div class="card-actions">
            <button onclick="edit(${index})">Edit</button>
            <button onclick="del(${index})">Delete</button>
          </div>
        </div>
        ${
          entry.image
            ? `<img src="${entry.image}" alt="${
                entry.alt || entry.name
              }" loading="lazy" />`
            : ""
        }
      `;
      entryList.appendChild(el);
    }

    updateFilterOptions(locationFilter, "location", "All Locations");
    updateFilterOptions(tagFilter, "tag", "All Tags");
    updateFilterOptions(typeFilter, "type", "All Types");
  }

  function updateFilterOptions(selectEl, key, label) {
    const current = selectEl.value;
    const values = [...new Set(data.map((d) => d[key]).filter(Boolean))];
    selectEl.innerHTML =
      `<option value="All">${label}</option>` +
      values
        .map(
          (val) =>
            `<option value="${val}" ${
              val === current ? "selected" : ""
            }>${val}</option>`
        )
        .join("");
  }

  // Event bindings
  document.getElementById("addBtn").onclick = () => {
    editingIndex = null;
    nameInput.value = "";
    locationInput.value = "";
    tagInput.value = "";
    ratingInput.value = "";
    favoriteInput.checked = false;
    descInput.value = "";
    categoryInput.value = "";
    detailInput.value = "";
    venueInput.value = "";
    typeInput.value = "";
    imageInput.value = "";
    altInput.value = "";
    dialog.showModal();
  };

  dialog.addEventListener("close", () => {
    if (!nameInput.value || !locationInput.value) return;

    const entry = {
      name: nameInput.value,
      location: locationInput.value,
      tag: tagInput.value,
      rating: parseInt(ratingInput.value) || 0,
      favorite: favoriteInput.checked,
      description: descInput.value,
      category: categoryInput.value,
      detail: detailInput.value,
      venue: venueInput.value,
      type: typeInput.value,
      image: imageInput.value,
      alt: altInput.value,
    };

    if (editingIndex != null) {
      data[editingIndex] = entry;
    } else {
      data.push(entry);
    }

    saveData(type, data);
    renderList();
  });

  // Filters
  locationFilter.onchange = renderList;
  tagFilter.onchange = renderList;
  typeFilter.onchange = renderList;
  sortOption.onchange = renderList;
  searchInput.oninput = renderList;
  minPriceInput.oninput = renderList;
  maxPriceInput.oninput = renderList;

  // Initialize list
  renderList();

  // Global functions
  window.edit = (index) => {
    const e = data[index];
    editingIndex = index;
    nameInput.value = e.name || "";
    locationInput.value = e.location || "";
    tagInput.value = e.tag || "";
    ratingInput.value = e.rating || "";
    favoriteInput.checked = e.favorite || false;
    descInput.value = e.description || "";
    categoryInput.value = e.category || "";
    detailInput.value = e.detail || "";
    venueInput.value = e.venue || "";
    typeInput.value = e.type || "";
    imageInput.value = e.image || "";
    altInput.value = e.alt || "";
    dialog.showModal();
  };

  window.del = (index) => {
    data.splice(index, 1);
    saveData(type, data);
    renderList();
  };

  window.importData = (file) =>
    importDataf(file, type, () => {
      data = loadData(type) || [];
      renderList();
    });

  window.exportData = () => exportDataf(type, data);
};
