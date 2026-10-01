# Design 2 — wireframes

ASCII, not pixel-exact. Tokens and components: [`DESIGN.md`](DESIGN.md).

## Homepage `/` — 1280px

```
+------------------------------------------------------------------------------+
| [mark] Esyres                              Prijava  Registracija  [Panel]    |
+------------------------------------------------------------------------------+
|                                                                              |
|  Rezervacije bez jurnjave          +--------------------------------------+  |
|  za terminom            (display)  | Zahtjevi mock (pastel cards)         |  |
|  Odabereš dan i vrijeme...          |  [pink 09:00 Ana · Šišanje ] Prihvati|  |
|  [ Pronađi salon ]  Imaš salon? ->  |  [yellow 10:30 Lejla · Feniranje]   |  |
|                                    |  [blue 13:00 Predloženo]             |  |
|                                    +--------------------------------------+  |
|                                                                              |
|  KAKO RADI                                                                   |
|  [1 pink: Odaberi salon] [2 yellow: Pošalji zahtjev] [3 blue: Salon potvrdi] |
|                                                                              |
|  [ ZA GOSTE (pink, rounded-3xl)       ] [ ZA SALONE (blue, rounded-3xl)   ] |
|  [ - bez aplikacije - bez poziva      ] [ - zahtjevi na jednom mjestu     ] |
|  [ [Pronađi salon]                    ] [ [Otvori panel]                  ] |
|                                                                              |
|  POPULARNO U SARAJEVU                                         Prikaži sve -> |
|  [Salon Mira 🟢] [Studio Luna 🟡] [ ... ] [ ... ]                           |
|                                                                              |
|  ČESTA PITANJA                                                               |
|  [> Da li moram instalirati aplikaciju?                                   ]  |
|  [> Koliko košta?                                                         ]  |
|  [> Šta ako salon predloži drugo vrijeme?                                 ]  |
+------------------------------------------------------------------------------+
| (dark) Esyres · Sarajevo · Termini bez jurnjave.      Saloni  Panel          |
+------------------------------------------------------------------------------+
```

Phone (390px): same order, one column; mock below the CTA; Popularno strip scrolls horizontally.

## Owner shell — 1280px

```
+------+--------------------------------------------------------------------+
| (blk)|  Dobrodošli, Amira          Salon Mira v          [Telefon]        |
| [mk] |                                                                    |
| [cal]|  +--------------------------------------------------------------+  |
| [lst]|  |  page content (rounded-3xl canvas panel)                     |  |
| [cht]|  |                                                              |  |
|  (2) |  |                                                              |  |
| [bar]|  +--------------------------------------------------------------+  |
| [shp]|                                                                    |
| [ger]|                                                                    |
| [out]|                                                                    |
+------+--------------------------------------------------------------------+
```

Phone:

```
+--------------------------------+
| [mark] Salon Mira v  [Odjava]  |
| Dobrodošli, Amira   (display)  |
|                                |
|  content                       |
|                                |
+--------------------------------+
| [cal] [lst] [cht] [shp] [ger] |  (icon tabs, no labels, fixed)
+--------------------------------+
```

## Zahtjevi — Kalendar (week grid)

```
 ‹  28. 9. – 4. 10. 2026  ›                                     [Telefon]
+--------+--------+--------+--------+--------+--------+--------+
| PON 28 | UTO 29 | SRI 30 | ČET 1  | PET 2  | SUB 3  | NED 4  |
|(pink hd)|       |        |        |        |        |        |
|[y 09:00]|[b 10:00]      |[y 11:00]|        | Zatvor.|        |
| Ana    | Predl. |        | Lejla  |        |        |        |
|[y 12:30]|       |        |        |        |        |        |
+--------+--------+--------+--------+--------+--------+--------+
 ZAHTJEVI · PON 28. 9. (3)
 [pink 09:00 Ana · Šišanje · 45 min · Bez pref.   (Prihvati) (Predloži) (Odbij)]
```

Phone: day chips row (PON … NED), then the selected day column, then the Zahtjevi pile.

## Zahtjevi — Kanban

```
 [PON 28][UTO 29]...[NED 4]  ‹ ›                                 [Telefon]
+----------------+----------------+----------------+----------------+
| ZAHTJEVI  (3)  | PREDLOŽENO (1) | POTVRĐENO (4)  | ZAVRŠENO I     |
|                |                |                | OTKAZANO (2)   |
|[pink 09:00 Ana]|[blue 10:00 Mia]|[yel 11:00 Lea] |[grey 08:00 ...]|
| (Prihvati)     |                |                |                |
+----------------+----------------+----------------+----------------+
```

Phone: columns scroll horizontally with snap.

## Zapisi

Kalendar: origin chips + day chips; selected day as a vertical timeline of pastel `StatusCard`s. Kanban: same filters; the four status columns.

## Postavke

```
 PRIKAZ
 [ Kalendar | Kanban ]   Kako vidiš Zahtjeve i Zapise.

 LOZINKA
 [trenutna] [nova] [potvrdi]  [Sačuvaj]
```
