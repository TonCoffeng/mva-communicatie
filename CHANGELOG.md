# CHANGELOG — mva-communicatie

Nieuwste wijzigingen bovenaan. Architectuurbesluiten staan in de Beslissingenlog van MVA_Intelligence_Technische_Manual.md; dit bestand logt code-wijzigingen in deze repo.

---

## 12 juni 2026 — verstuur-mail v2: klant-routing, testmodus, idempotentie

**verstuur-mail.js (v2):**
- **Ontvanger-routing per rol:** templates met `ontvanger_rol: 'klant'` mailen naar `payload.klant_email`; rol `'makelaar'` naar `payload.makelaar_email`. Ontbreekt het adres (buiten testmodus), dan gaat het event op `gefaald` met duidelijke melding.
- **Testmodus-schakelaar:** Netlify env var `COMM_TESTMODUS`. Standaard AAN (alle mail naar toncoffeng@makelaarsvan.nl — veilige default). Pas op `uit` zetten als de echte klant-routing live mag. Respons vermeldt altijd `testmodus` en `echte_ontvanger`.
- **Idempotentie-slot:** events met status `verwerkt` worden niet nogmaals verzonden (HTTP 409). Bewust opnieuw verzenden kan met `{"event_id": N, "forceer": true}` — alleen voor testen.
- Afzendernaam gewijzigd van "MvA Intelligence" naar "Makelaars van Amsterdam" (klantmails verdienen de merknaam).

## 12 juni 2026 — OTD-klantmails + publieke brochures

**templates.js (v2 van de klant-templates):**
- Nieuw: `otd_getekend_aankoop` (otd_klant_aankoop_v2) — klantmail na tekenen aankoop-OTD, opgebouwd uit de 9 stappen van de brochure "Uw droomwoning aankopen". NL + EN.
- Nieuw: `otd_getekend_verkoop` (otd_klant_verkoop_v2) — klantmail na tekenen verkoop-OTD, opgebouwd uit de 7 stappen van "Uw woningpromotieplan" incl. mediamix-samenvatting. NL + EN, pandadres optioneel.
- Klantmail-styling volledig inline (Gmail/Outlook strippen `<style>` in de head); genummerde stappen als tabel-rijen met oranje nummerbolletjes.
- Brochure-URL's als constante (`BROCHURES`) — bestand vervangen in `public/brochures/` raakt templates niet.
- Bestaande interne makelaar-templates (`woning_aangekocht`, `woning_verkocht`) ongewijzigd.

**public/brochures/ (nieuw):** negen brochures publiek op vaste URL's via communicatie.makelaarsvan.nl/brochures/:
aankoop-9-stappen.pdf (+ -en), woningpromotieplan.pdf (+ -en), verkoopbrochure.pdf (+ -en), spotlightbrochure.pdf, woning-in-de-media.pdf, prijslijst.pdf.
Rationale: SharePoint-Documentenbibliotheek vereist login en is dus ongeschikt als klantlink; deze repo is de publieke spiegel.

**Payload-contract klantmails:**
`{ klant_naam, klant_email, makelaar_naam, pand_adres?, taal: 'nl'|'en' }` — `bron` in communicatie_events wordt 'mva-otd' bij de automatische koppeling (nu 'handmatig-test').

---

## 19 mei 2026 — PoC v0.1 (zie MVA_Communicatie_Stand_Van_Zaken_PoC_v01.docx)

- Generieke pijplijn event → router → template → Resend → log.
- Templates `woning_aangekocht` en `woning_verkocht` (interne makelaar-stappenplannen).
- Tabellen `communicatie_events` en `communicatie_log` in Supabase-hoofdproject.
- Resend-domein makelaarsvan.nl geverifieerd per 20 mei 2026.
