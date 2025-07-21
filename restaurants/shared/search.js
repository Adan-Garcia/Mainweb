let validTypes = ["restaurant", "store", "service", "attraction"]; // example types
const attachpoint = document.getElementById("display");
const UItypeConfigs = {
  restaurant: {
    filters: {
      search: { label: "Search", enabled: true },
      location: { label: "Location", enabled: true },
      tag: { label: "Tag", enabled: true },
      type: { label: "Type", enabled: true },
      minPrice: { label: "Min Price", enabled: true },
      maxPrice: { label: "Max Price", enabled: true },
      sort: { label: "Sort", enabled: true },
    },
    sortOptions: [
      { value: "default", label: "Sort: Default" },
      { value: "rating", label: "Sort by Rating" },
      { value: "favorite", label: "Sort by Favorites" },
      { value: "minPriceAsc", label: "Sort by Min Price ↑" },
      { value: "minPriceDesc", label: "Sort by Min Price ↓" },
      { value: "maxPriceAsc", label: "Sort by Max Price ↑" },
      { value: "maxPriceDesc", label: "Sort by Max Price ↓" },
    ],
  },
};
// Get type from data attribute (example: <div id="app" data-type="restaurant"></div>)
const appElement = document.getElementById("app");
const typeAttr = appElement ? appElement.dataset.type : null;
const type = validTypes.includes(typeAttr) ? typeAttr : "restaurant";

function createFilterUI() {
  // Clear app content first
  const config = UItypeConfigs[type] || {
    filters: {
      search: { label: "Search", enabled: true },
      location: { label: "Location", enabled: true },
      tag: { label: "Tag", enabled: true },
      type: { label: "Type", enabled: true },
      minPrice: { label: "Min Price", enabled: true },
      maxPrice: { label: "Max Price", enabled: true },
      sort: { label: "Sort", enabled: true },
    },
    sortOptions: [
      { value: "default", label: "Sort: Default" },
      { value: "rating", label: "Sort by Rating" },
      { value: "favorite", label: "Sort by Favorites" },
      { value: "minPriceAsc", label: "Sort by Min Price ↑" },
      { value: "minPriceDesc", label: "Sort by Min Price ↓" },
      { value: "maxPriceAsc", label: "Sort by Max Price ↑" },
      { value: "maxPriceDesc", label: "Sort by Max Price ↓" },
    ],
  };
  const controls = document.createElement("div");
  controls.id = "controls";
  attachpoint.appendChild(controls);

  if (config.filters.search?.enabled) {
    const input = document.createElement("input");
    input.id = "searchInput";
    input.type = "search";
    input.placeholder = `${config.filters.search.label} entries...`;
    input.style.cssText = "margin-bottom: 8px; width: 100%; padding: 6px";
    controls.appendChild(input);
  }

  if (config.filters.location?.enabled) {
    controls.appendChild(
      createSelect("locationFilter", config.filters.location.label)
    );
  }

  if (config.filters.tag?.enabled) {
    controls.appendChild(createSelect("tagFilter", config.filters.tag.label));
  }

  if (config.filters.minPrice?.enabled) {
    controls.appendChild(
      createLabeledInput(
        "minPriceInput",
        config.filters.minPrice.label,
        "number"
      )
    );
  }

  if (config.filters.maxPrice?.enabled) {
    controls.appendChild(
      createLabeledInput(
        "maxPriceInput",
        config.filters.maxPrice.label,
        "number"
      )
    );
  }

  if (config.filters.type?.enabled) {
    controls.appendChild(createSelect("typeFilter", config.filters.type.label));
  }

  if (config.filters.sort?.enabled) {
    const select = document.createElement("select");
    select.id = "sortOption";
    config.sortOptions.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt.value;
      option.textContent = opt.label;
      select.appendChild(option);
    });
    controls.appendChild(select);
  }

  const addBtn = document.createElement("button");
  addBtn.id = "addBtn";
  addBtn.textContent = "+ Add Entry";
  controls.appendChild(addBtn);

  const exportDiv = document.createElement("div");
  exportDiv.style.marginTop = "8px";
  exportDiv.innerHTML = `
    <button onclick="exportData()">📤 Export</button>
    <label style="cursor: pointer">
      📥 Import
      <input type="file" accept=".json" style="display: none" onchange="importData(this.files[0])" />
    </label>
  `;
  controls.appendChild(exportDiv);
}

function createSelect(id, label) {
  const select = document.createElement("select");
  select.id = id;
  const option = document.createElement("option");
  option.value = "All";
  option.textContent = `All ${label}s`;
  select.appendChild(option);
  return select;
}

function createLabeledInput(id, label, type = "text") {
  const wrapper = document.createElement("label");
  wrapper.style.marginLeft = "8px";
  wrapper.textContent = `${label}: `;

  const input = document.createElement("input");
  input.id = id;
  input.type = type;
  input.placeholder = label;
  input.style.width = "80px";
  input.min = "0";
  if (type === "number") input.step = "0.01";

  wrapper.appendChild(input);
  return wrapper;
}
function createpage() {
  const header = document.createElement("h1");
  header.innerText = `${type.charAt(0).toUpperCase() + type.slice(1)}'s Search`;
  attachpoint.appendChild(header);

  createFilterUI();

  const restaurantList = document.createElement("div");
  restaurantList.id = "entryList";
  attachpoint.appendChild(restaurantList);

  createdialog();
  if (window.initRendererJS) window.initRendererJS();
}

function createdialog() {
  const dialog = document.createElement("dialog");
  dialog.id = "addDialog";
  dialog.innerHTML = `
      <form method="dialog">
        <h3>Add/Edit Restaurant</h3>
        <input id="nameInput" placeholder="Name" required />
        <input
          id="locationInput"
          placeholder="Location (e.g. Magic Kingdom)"
          required
        />
        <select id="tagInput">
          <option>Breakfast</option>
          <option>Lunch</option>
          <option>Dinner</option>
          <option>Snack</option>
        </select>
        <input
          id="ratingInput"
          type="number"
          min="1"
          max="5"
          placeholder="Rating (1-5)"
        />
        <label><input type="checkbox" id="favoriteInput" /> Favorite</label>
        <textarea id="descInput" placeholder="Description"></textarea>
        <input id="categoryInput" placeholder="Category" />
        <input id="detailInput" placeholder="Details" />
        <input id="venueInput" placeholder="Venue Location" />
        <input id="typeInput" placeholder="Service Type" />
        <input id="imageInput" placeholder="Image URL" />
        <input id="altInput" placeholder="Image Alt Text" />

        <button type="submit">Save</button>
      </form>`;
  attachpoint.appendChild(dialog);
}
document.addEventListener("DOMContentLoaded", createpage);
