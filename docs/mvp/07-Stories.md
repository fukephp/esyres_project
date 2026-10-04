# User Stories

*Representative stories per epic — enough to scope and start building, not an exhaustive backlog. Format: As a [user], I want [goal], so that [benefit].*

**Inventory for what-next / story-loop is `docs/stories/` (`STORY-01` … `STORY-108`, `STORY-110`), not this file.** Acceptance criteria live only on those story files. This page stays the narrative source those files were split from.

## Epic 1 — Salon Discovery & Profile Browsing

- As a guest who typed `/`, I want a Bosnian homepage and then the live salon list at `/salons`, so that I can see the product without a separate marketing site.
- As a guest or owner, I want the same Esyres top-nav on public and owner pages, so that I can always go home and use only the actions that belong on that page.
- As a logged-in guest or owner, I want Odjava in the top-nav to look like a destructive action, so I can tell it apart from Panel and from Prijava.
- As a logged-in guest or owner, I want Dobrodošli and my Ime i prezime in the top-nav on every page, so that I can see I am signed in without opening Moje rezervacije.
- As a guest, I want the top-nav and the page content to share one width on public pages, so that the logo and the main column line up.
- As a customer, I want to see salons near my current location without logging in, so that I can start browsing immediately from a QR code or IG link.
- As a customer, I want a saved municipality to be that nearby point, so that the browser is not asked while a place is set, and Popular in Sarajevo still covers an empty place.
- As a customer, I want a fallback list ("Popular in Sarajevo") when location is denied or unavailable, so that I never hit a blank screen.
- As a customer, I want the public pages to share one card system, so that the homepage, discovery, a salon, and my bookings feel like the same product.
- As a customer, I want a few suggested salons that share a discovery chip with a booking I already made, so that my profile can point me at another shop of that kind.
- As a customer, I want to filter by a discovery chip (Kosa / Šminka / Masaža) or search by name, so that I can find a relevant salon quickly.
- As a customer, I want the salon profile and picker to group services under the owner’s category names, so that the menu matches the shop instead of three locked types.
- As a customer, I want `/salons` to show a short card teaser and then a richer results list when I filter, search, or show all, so that I can pick a salon without opening every profile.
- As a customer, I want to see a salon's services, prices, hours, and a busy-level badge on its profile, so that I can decide whether to request an appointment.
- As a customer, I want the salon profile to show the address when it exists, and Radno vrijeme as the days the salon is open, so that I can read the shop before I send.
- As a customer, I want every Pošalji zahtjev on the salon profile to look and feel like one primary action, so that sending a request is obvious and the press feels physical.
- As a customer, I want a single send on the salon profile — under the title on a phone, in a sticky sidebar on a wide screen — so that I am not looking at two identical buttons.
- As a customer, I want Pošalji zahtjev after the hours list, so that send is a button and the hours stay information.
- As a logged-in customer, I want Moje rezervacije on the homepage, so that bookings are one tap from `/`.
- As a logged-in customer, I want Profil in the top-nav before Moje rezervacije, so that my profile is one tap away.

## Epic 2 — Booking Request Flow (Customer)

- As a customer, I want to select multiple services in one request, so that I don't need to submit separate requests for a haircut and a color.
- As a customer, I want to optionally pick a specific worker or say "no preference," so that I have control when I care, and less friction when I don't.
- As a customer, I want Radno vrijeme to show when the salon is open, and Pošalji zahtjev to open a request I leave only with Zatvori, so that I can ask for a time without the hours list acting as the button.
- As a customer, I want to pick a quarter start on Pošalji zahtjev and see which ones are Zauzet, so that I ask for a time the salon can still take.
- As a customer, I want to send Pošalji zahtjev for an open day without picking a quarter, so that the salon can offer a time.
- As a customer, I want a second request for a service I already have that day to be refused, so that I cannot spam the same service.
- As a customer, I want to create an account with email and password without a homepage login wall, so that I can browse first and sign in when I request or open My Bookings.
- As a customer or someone opening a panel, I want to type my Ime i prezime when I register and see Rezervacije or Panel on the auth shell, so that my name is real and I know which door I opened.
- As a customer or someone opening a panel, I want one centered login box with sliding Prijava / Registracija tabs and forgot password on every surface, so that signing in works the same everywhere and I can reset a lost password by email.
- As a customer, I want to verify my email before my request is sent, so that the salon can reach me with reminders.
- As a customer, I want to verify my phone with OTP before my request is sent (optional earlier, required at submit), so that the salon can SMS me if push fails.
- As a customer, I want confirmation that my request was sent and is awaiting salon response (accept or counter-propose), so that I know what to expect next.

## Epic 3 — Zahtjevi & Time Proposal (Owner)

- As an owner, I want occupying rows on the selected-day list to show which service is on that worker, so that the list is the current-job board.
- As an owner, I want Zahtjevi as a month navigator with worker-colored occupying dots and a selected-day list, so that I can pick a day without a 15-minute worker grid.
- As an owner, I want that selected-day list to read as a diary (one clock gutter, hairline occupying rows, Inter day heading), so that I can scan start times down one column.
- As an owner, I want pending requests for a day in a till-pile (collapse with count when more than two), then soon occupying, then the rest including changed time, so that pending is not buried in the clock.
- As an owner, I want titled break and closed rows on that list, so that I see when chairs are off.
- As an owner, I want to see all pending requests for a day in one queue, sorted so urgent ones aren't buried, so that nothing slips through.
- As an owner, I want to accept a guest's preferred time in one tap when it works, so that simple requests don't need an extra back-and-forth.
- As an owner, I want to counter-propose a different time from Request Detail, so that I can adjust when the preferred time doesn't fit without dragging.
- As an owner, I want Request Detail in the same Cal card as Zahtjevi, so that counter-propose is not a blank column after the month-and-list.
- As an owner, I want Request Detail as a modal over Zahtjevi or Zapisi, so that I can act on a booking without leaving the board.
- As an owner, I want Request Detail to slide in from the right over the board without leaving the page, so that I can act on a booking while my week, day, and columns stay where I left them.
- As an owner, I want to confirm a no-preference request that already has a time by tapping a free worker, so that the guest is not asked again.
- As an owner, I want to decline a request with an optional reason, so that the customer understands why without me needing to propose a time first.
- As an owner, I want Telefon as modal steps on Zahtjevi, with Danas, Sutra, or another day and tappable quarter-hour starts, so that I can write a phone booking with a few taps while I am still on the call.
- As an owner, I want Telefon to refuse a start that is already past, so that a phone booking cannot be written for a time that has already gone.
- As a guest or an owner, I want pages and lists to show a calm skeleton of what is coming while they load (owner pages inside the shell frame), so that the screen does not jump.
- As an owner, I want each confirmed card on Zahtjevi to show how far that appointment has run, and the menu as icons only, so that I can see progress without a wide labeled sidebar.
- As an owner, I want visits that are happening now in a first Kanban column, and checkboxes to hide that column or the finished one, so that the board stays the pipeline I need.
- As an owner, I want one button with the count of pending reservations that jumps me to that day, so that I can accept or decline without hunting the week.
- As an owner, I want a button to collapse and expand the menu, so that I can use icons or read the labels.

## Epic 4 — Booking Lifecycle & Customer Response

- As a customer, I want to approve, reject, or ask for a different day or time once a counter-proposed time is offered, so that I stay in control of the final appointment. Asking for a different day or time updates the same request (new preferred date/time, back to pending), not a duplicate.
- As an owner, I want to be notified immediately when a customer responds to a proposed time, so that I can react (e.g. re-propose) quickly.
- As a customer, I want to see all my requests (Pending / Time Proposed / Confirmed / Declined) in one place, so that I can track their status.
- As a customer, I want a profile with my latest booking and a link to that list, so that Moji zahtjevi is not the only page I have.

## Epic 5 — Reschedule & Cancellation

- As a customer, I want to reschedule a confirmed booking without losing my original appointment until the new time is approved, so that I'm never left with nothing.
- As a customer, I want to cancel a booking and see a warning (not a block) if I'm cancelling late, so that I understand the impact without being locked out.
- As an owner, I want a configurable minimum cancellation notice window, so that late cancellations are visible in my stats.

## Epic 6 — Notifications

- As an owner, I want real-time push notifications for new requests and customer responses, so that I don't have to keep checking the app manually.
- As a customer, I want to be notified by SMS if a push notification doesn't reach me (e.g. on iOS), so that I don't miss a time-critical update.
- As a customer, I want a reminder email before my appointment, so that I don't forget it.

## Epic 7 — Salon & Service Management (Owner Onboarding)

- As a person with no booking on this account, I want to submit my first salon by name from Get your panel, so that an admin can approve it before I open the panel.
- As an owner, I want a salon catalog of shops I own with whether each is open now, so that I can see all my shops without treating the switcher as a directory.
- As an owner, I want my salon catalog as boxed shops with an Edit button and a plus under the title to add another shop, so that I can pick a shop or create one without a table list.
- As an owner, I want to edit a salon’s name and address on `/owner/salons/:id`, so that the catalog has a place for the rest of the profile to land.
- As an owner, I want to add a description, a main image, and a gallery on salon edit Informacije, so that the shop’s catalog copy and photos live on Esyres before guests see them.
- As an owner, I want to add another salon I own from `/owner/salons/create` with name and address, so that I do not reuse `/create-salon` as a second factory.
- As an owner, I want to set my working hours, breaks, and cancellation notice window, so that the system reflects how my salon actually runs.
- As an owner, I want to add/edit services with durations and prices, so that customers see accurate options.
- As an owner, I want to create named service categories and attach services to the selected category, so that the guest menu matches my real cjenovnik instead of locked hair / make-up / massage.
- As an owner, I want to add workers to my salon, so that customers can request them specifically or leave it open. Workers follow the salon’s hours.
- As an owner, I want each worker to have a photo, an about text, experience, and lists of talents, specializations, certificates, education, brands, and strongest services, so the salon’s team is described before guests see it.
- As an owner, I want salon edit split into exclusive sections, so I can edit one chunk at a time on a full-width page instead of a stacked skinny form.
- As an owner, I want each weekday on Radno vrijeme collapsed until I open it, so that I can scan the week without scrolling through seven expanded editors.
- As an owner, I want to switch between salons I own, so that each shop has its own profile, queue, and QR without mixing them.
- As an owner, I want to change my password on `/owner/settings`, so that I can rotate the shared credential without a founder reset.
- As an owner, I want a Chat switch on Postavke, default off, so that the menu hides a tab I am not using.
- As a customer who opens an owner route, I want to be sent straight back to where I was, so that I never see an owner panel skeleton or a "not an owner" page.

## Epic 8 — Trust Signal Data Foundations

- As an owner, I want to see when a returning customer physically scanned my QR code and verified, so that I know they're a real repeat visitor, not just a remote favorite.
- As a customer, I want to save a salon from its page and see those salons on my profile, so that I can return without searching.
- As the platform, I want to capture response-time and no-show data from day one, so that trust badges can be computed later without a backfill gap.
- As an owner, I want this guest's other confirmed bookings and a no-show mark on Request Detail, so that I know who already came before I accept, without a customers screen.

## Epic 9 — Basic Stats & Owner Insights

- As an owner, I want to see bookings per week, busiest hours, and cancellation rate, so that I can understand how my salon is actually running.
- As an owner, I want to see how many people scanned my QR code and how many converted into verified visits, so that I know if the sticker is working.

## Epic 10 — Salon Booking Assistant (scripted intake)

Not on `/salon/:id` (STORY-89). The stories below are the assistant contract, not a profile button.

- As a customer, I want an alternate chat on the salon profile when I am not sure which service or time to pick, so that I can still send the same kind of request without hunting a slot grid.
- As a customer, I want Pitaj salon to open a full-canvas chat overlay so I can talk to this salon without the hours list competing with the conversation.
- As a customer, I want choosing a native date or time in Pitaj salon (or the picker overlay) to keep that overlay open, so I can finish the request and still use Reci nam što ti treba / Nisi sigurna? Pitaj salon after I close it.
- As a customer, I want the chat to suggest 1–3 preferred times from hours and how busy the day looks, so that I can choose a time without seeing the owner's real calendar.
- As a customer, I want the chat to speak as this salon in Bosnian and only use that salon's live services, prices, hours, address, workers, and busy-level, so that it does not invent policies or feel like a third brand.
- As a customer, I want send gates to stay the same as the picker (login, verified email, phone OTP), so that the salon still gets a reachable guest. If I am already verified, I want one confirm at the end.
- As an owner, I want assistant-originated requests in the same pending queue, tagged and with a collapsed transcript on Request Detail, so that I can accept or counter-propose without a second workflow.
- As an owner, I want a chat tab with a badge for conversations that have not become a request yet, so that in-flight chats are visible without replacing the panel as home.
- As an owner, I want optional Take over so I can handle one conversation myself, and I want the assistant to keep going (and still be able to send a request) unless I have tapped Take over. After hours or DND, take-over is off.
- As an owner, I want the assistant to say it does not know when the answer is not in live salon data, and optionally ping me, without making the guest wait on me.

## Epic 11 — Visit ratings

Locked in `docs/mvp/06-Epics.md`. Stories: STORY-104, STORY-105, STORY-106.

- As a customer, I want to give a salon one score from its page, so that the average reflects that salon and not one finished visit.
- As a guest, I want to see only that average and how many ratings exist, so that I can judge the salon before I send a request.
- As a logged-in customer, I want to read comments and leave one reply, so that I can respond to another customer’s visit.
- As a customer, I want my own ratings listed on my profile, so that I can open the salon I scored.
- As an owner, I want every rating of my salon on salon edit, so that I can read them without a reviews screen.

## Epic 12 — Admin

Locked in `docs/mvp/06-Epics.md`. Story: STORY-110.

- As a person with no booking on this account, I want my first salon to stay pending, so that naming a shop does not open the owner panel.
- As an admin, I want to sign in on Prijava and land on Pregled, so that I see how many salons are waiting, how many salons have an owner, and how many reservations exist.
- As an admin, I want to approve or reject a pending salon, so that a real shop can open the panel and a refused name can be submitted again.

---

## Note

These stories reflect **locked MVP scope only**. Stories for Phase 2 items (badge display, Viber/WhatsApp / Instagram DM channels, LLM NLU, native app, etc.) are intentionally not written yet — writing them now would imply a commitment that hasn't been made.
