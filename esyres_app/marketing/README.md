# Esyres marketing site (Design 1)

Static Vite + HTML/CSS site. Run from this folder:

```text
npm run dev
npm run build
```

## Formspree (salon waitlist)

`signup.html` posts to Formspree. Before go-live, replace the placeholder form id in the form `action`:

`https://formspree.io/f/PLACEHOLDER_REPLACE_ME`

→ `https://formspree.io/f/<your-form-id>`

Until that is set, the page shows an honest “Formspree not connected” message on submit and does not pretend the waitlist joined.
