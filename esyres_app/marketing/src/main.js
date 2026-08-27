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

const track = document.querySelector("[data-strip-track]");
const prev = document.querySelector("[data-strip-prev]");
const next = document.querySelector("[data-strip-next]");

if (track && prev && next) {
  const scrollByTile = (direction) => {
    const tile = track.querySelector(".icon-tile");
    const amount = tile ? tile.getBoundingClientRect().width + 16 : 160;
    track.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  prev.addEventListener("click", () => scrollByTile(-1));
  next.addEventListener("click", () => scrollByTile(1));
}

// Deep-link to #uskoro on load
if (window.location.hash === "#uskoro" && uskoro) {
  requestAnimationFrame(() => {
    uskoro.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
