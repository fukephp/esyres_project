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

const hash = window.location.hash.slice(1);
if (hash) {
  const target = document.getElementById(hash);
  if (target) {
    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
}
