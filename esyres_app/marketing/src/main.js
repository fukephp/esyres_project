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

const FORMSPREE_PLACEHOLDER = "PLACEHOLDER_REPLACE_ME";

const waitlistForm = document.getElementById("waitlist-form");
const waitlistNote = document.getElementById("waitlist-note");

if (waitlistForm) {
  waitlistForm.addEventListener("submit", (event) => {
    const action = waitlistForm.getAttribute("action") || "";
    const required = ["salon_name", "owner_name", "email"];
    let valid = true;

    required.forEach((name) => {
      const input = waitlistForm.elements.namedItem(name);
      if (!(input instanceof HTMLInputElement)) return;
      const empty = !input.value.trim();
      input.classList.toggle("is-invalid", empty);
      if (empty) valid = false;
      if (name === "email" && input.value.trim() && !input.checkValidity()) {
        input.classList.add("is-invalid");
        valid = false;
      }
    });

    if (!valid) {
      event.preventDefault();
      if (waitlistNote) {
        waitlistNote.hidden = false;
        waitlistNote.textContent = "Please fill in salon name, owner name, and a valid email.";
      }
      return;
    }

    if (action.includes(FORMSPREE_PLACEHOLDER)) {
      event.preventDefault();
      if (waitlistNote) {
        waitlistNote.hidden = false;
        waitlistNote.textContent =
          "Formspree is not connected yet. Replace PLACEHOLDER_REPLACE_ME in the form action before go-live — your interest was not submitted.";
      }
    }
  });
}
