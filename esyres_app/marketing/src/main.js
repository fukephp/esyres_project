const uskoro = document.getElementById("uskoro");

document.querySelectorAll("[data-scroll-to]").forEach((el) => {
  el.addEventListener("click", (event) => {
    const id = el.getAttribute("data-scroll-to");
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  });
});

// Deep-link to #uskoro on load
if (window.location.hash === "#uskoro" && uskoro) {
  requestAnimationFrame(() => {
    uskoro.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
