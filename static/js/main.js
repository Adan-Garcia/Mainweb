document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".reveal");

  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => observer.observe(el));
});


// Playable demos load only when asked (they're several MB).
document.addEventListener("click", (event) => {
  const button = event.target.closest(".demo-play");
  if (!button) return;
  const frame = button.closest(".demo-frame");
  const iframe = document.createElement("iframe");
  iframe.src = frame.dataset.src;
  iframe.title = frame.dataset.title + " demo";
  iframe.allow = "autoplay; fullscreen; gamepad";
  iframe.setAttribute("allowfullscreen", "");
  frame.replaceChildren(iframe);
  iframe.addEventListener("load", () => iframe.focus());
});
