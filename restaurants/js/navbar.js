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
