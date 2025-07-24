document.querySelector(".hamburger").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("is-active");
});

function updateSidebarState() {
  const sidebar = document.getElementById("sidebar");
  if (window.innerWidth > 768) {
    sidebar.classList.add("is-active");
  } else {
    sidebar.classList.remove("is-active");
  }
}

// Run on page load
updateSidebarState();

// Run on resize
window.addEventListener("resize", updateSidebarState);
window.addEventListener("scroll", () => {
  document.getElementById("sidebar").classList.remove("is-active");
});

// Export all localStorage data to a JSON file
window.exportLocalStorageToJSON = function () {
  const allData = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    try {
      allData[key] = JSON.parse(localStorage.getItem(key));
    } catch {
      allData[key] = localStorage.getItem(key);
    }
  }

  const blob = new Blob([JSON.stringify(allData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "localStorage-export.json";
  a.click();
  URL.revokeObjectURL(url);
};
function readAndImport(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const jsonString = event.target.result;
    importLocalStorageFromJSON(jsonString, { merge: false });
  };
  reader.readAsText(file);
}
// Import a JSON string into localStorage
// merge = false (default) will clear localStorage first
window.importLocalStorageFromJSON = function (
  jsonString,
  { merge = false } = {}
) {
  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (e) {
    console.error("Invalid JSON:", e);
    return;
  }

  if (!merge) {
    localStorage.clear();
  }

  for (const [key, value] of Object.entries(parsed)) {
    localStorage.setItem(
      key,
      typeof value === "string" ? value : JSON.stringify(value)
    );
  }

  console.log("localStorage updated.");
};
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/restaurants/service-worker.js")
    .then((reg) => console.log("SW registered:", reg.scope))
    .catch((err) => console.error("SW registration failed:", err));
}
