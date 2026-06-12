// netlify/functions/templates.js
//
// MvA Communicatie — Mail-templates
//
// Elke template is een functie die een payload-object ontvangt en
// een object teruggeeft met:
//   { onderwerp, htmlBody, textBody, ontvanger_rol }
//
// Templates worden geregistreerd in TEMPLATES_PER_EVENT.
// Om een nieuw event-type toe te voegen: nieuwe template-functie schrijven
// en koppelen in de TEMPLATES_PER_EVENT map.

// ── Gedeelde HTML-styling ──────────────────────────────────
const SHARED_STYLE = `
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #2D2D2D; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; }
  h1 { color: #1A2B5F; font-size: 22px; margin-bottom: 8px; }
  .badge { display: inline-block; background: #E8500A; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 16px; }
  .pand { background: #F4F5F8; padding: 14px 18px; border-radius: 8px; margin: 16px 0; font-size: 15px; }
  .pand strong { color: #1A2B5F; }
  h2 { color: #1A2B5F; font-size: 16px; margin-top: 24px; margin-bottom: 8px; }
  ul { padding-left: 20px; }
  li { margin-bottom: 10px; }
  .nudge { background: #FEF6F0; border-left: 3px solid #E8500A; padding: 12px 16px; margin: 20px 0; font-size: 14px; color: #6B4423; border-radius: 4px; }
  .btn { display: inline-block; background: #E8500A; color: white !important; padding: 10px 22px; border-radius: 6px; font-weight: 600; text-decoration: none; margin: 4px 0; font-size: 14px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E5ED; color: #6B7280; font-size: 12px; }
`;

const WRAP_HTML = (innerBody) => `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<style>${SHARED_STYLE}</style>
</head>
<body>
${innerBody}
<div class="footer">
  Deze mail is automatisch verzonden door MvA Communicatie.<br>
  Makelaars van Amsterdam &middot; MvA Intelligence
</div>
</body>
</html>`;


// ════════════════════════════════════════════════════════════
// TEMPLATE 1: woning_aangekocht
// ════════════════════════════════════════════════════════════
function templateAankoop(payload) {
  const pandAdres = payload?.pand_adres || '[adres pand]';
  const makelaarNaam = payload?.makelaar_naam || 'makelaar';

  const onderwerp = `Aankoop afgerond: ${pandAdres} — stappenplan dossierafhandeling`;

  const htmlBody = WRAP_HTML(`
  <div class="badge">AANKOOP AFGEROND</div>
  <h1>Stappenplan voor afhandeling aankoopdossier</h1>

  <div class="pand">
    Pand: <strong>${pandAdres}</strong>
  </div>

  <p>Beste ${makelaarNaam},</p>

  <p>De woning heeft zojuist de status <strong>aangekocht</strong> gekregen.
  Hieronder vind je het stappenplan om je aankoopdossier correct af te handelen.</p>

  <h2>Te ondernemen acties</h2>
  <ul>
    <li><strong>Concept factuur opmaken</strong> — maak in Effytool een concept factuur aan zodat de administratieve afhandeling op tijd kan worden voorbereid.</li>
    <li><strong>WWFT en ID Check en controle dossier</strong> — dit is het moment om je dossier goed te controleren. Heb je aan al je verplichtingen voldaan?</li>
    <li><strong>Social media</strong> — vanuit dit moment wordt ook de doorvertaling gemaakt naar marketing. De aankoop kan worden aangeleverd voor social media bij Dominique en Kyra.</li>
  </ul>

  <p>Door deze stappen consequent te volgen, houden we onze kwaliteit hoog en onze processen strak. Dank voor je inzet hierin!</p>
  `);

  const textBody = `AANKOOP AFGEROND — Stappenplan voor afhandeling aankoopdossier

Pand: ${pandAdres}

Beste ${makelaarNaam},

De woning heeft zojuist de status aangekocht gekregen.
Hieronder vind je het stappenplan om je aankoopdossier correct af te handelen.

Te ondernemen acties:
- Concept factuur opmaken — maak in Effytool een concept factuur aan zodat de administratieve afhandeling op tijd kan worden voorbereid.
- WWFT en ID Check en controle dossier — dit is het moment om je dossier goed te controleren. Heb je aan al je verplichtingen voldaan?
- Social media — vanuit dit moment wordt ook de doorvertaling gemaakt naar marketing. De aankoop kan worden aangeleverd voor social media bij Dominique en Kyra.

Door deze stappen consequent te volgen, houden we onze kwaliteit hoog en onze processen strak. Dank voor je inzet hierin!

---
Deze mail is automatisch verzonden door MvA Communicatie.
Makelaars van Amsterdam — MvA Intelligence`;

  return {
    onderwerp,
    htmlBody,
    textBody,
    ontvanger_rol: 'makelaar'
  };
}


// ════════════════════════════════════════════════════════════
// TEMPLATE 2: woning_verkocht
// ════════════════════════════════════════════════════════════
function templateVerkoop(payload) {
  const pandAdres = payload?.pand_adres || '[adres pand]';
  const makelaarNaam = payload?.makelaar_naam || 'makelaar';

  const onderwerp = `Verkoop afgerond: ${pandAdres} — stappenplan dossierafhandeling`;

  const htmlBody = WRAP_HTML(`
  <div class="badge">VERKOOP AFGEROND</div>
  <h1>Stappenplan voor afhandeling verkoopdossier</h1>

  <div class="pand">
    Pand: <strong>${pandAdres}</strong>
  </div>

  <p>Beste ${makelaarNaam},</p>

  <p>De woning heeft zojuist de status <strong>verkocht</strong> gekregen.
  Hieronder vind je het overzicht van de stappen die nog moeten worden gedaan
  om het verkoopdossier correct en volgens protocol af te handelen.</p>

  <h2>Te ondernemen acties</h2>
  <ul>
    <li><strong>Social media</strong> — Dominique en Kyra gaan aan de slag met de social media posts voor de kanalen van het kantoor.</li>
    <li><strong>WWFT en ID Check en controle dossier</strong> — dit is het moment om je dossier goed te controleren. Heb je aan al je verplichtingen voldaan?</li>
    <li><strong>Concept factuur opmaken</strong> — maak in Effytool een concept factuur aan zodat de administratieve afhandeling op tijd kan worden voorbereid.</li>
    <li><strong>Flyers versturen</strong> — dit is het goede moment om een flyer te versturen. Monique pakt deze taak op en zal in Yisual de bestelling gereed maken.
      <br><a href="https://yisual.nl" class="btn" target="_blank" rel="noopener">Open Yisual</a>
    </li>
  </ul>

  <div class="nudge">
    <strong>Wist je dat</strong> het versturen van flyers je 1 à 2 opdrachten per jaar extra op kan leveren?
    Een kleine investering met zichtbaar resultaat!
  </div>

  <p>Door deze stappen consequent te volgen, houden we onze kwaliteit hoog en onze processen strak. Dank voor je inzet hierin!</p>
  `);

  const textBody = `VERKOOP AFGEROND — Stappenplan voor afhandeling verkoopdossier

Pand: ${pandAdres}

Beste ${makelaarNaam},

De woning heeft zojuist de status verkocht gekregen.
Hieronder vind je het overzicht van de stappen die nog moeten worden gedaan
om het verkoopdossier correct en volgens protocol af te handelen.

Te ondernemen acties:
- Social media — Dominique en Kyra gaan aan de slag met de social media posts voor de kanalen van het kantoor.
- WWFT en ID Check en controle dossier — dit is het moment om je dossier goed te controleren. Heb je aan al je verplichtingen voldaan?
- Concept factuur opmaken — maak in Effytool een concept factuur aan zodat de administratieve afhandeling op tijd kan worden voorbereid.
- Flyers versturen — dit is het goede moment om een flyer te versturen. Monique pakt deze taak op en zal in Yisual de bestelling gereed maken.
  Open Yisual: https://yisual.nl

Wist je dat het versturen van flyers je 1 à 2 opdrachten per jaar extra op kan leveren? Een kleine investering met zichtbaar resultaat!

Door deze stappen consequent te volgen, houden we onze kwaliteit hoog en onze processen strak. Dank voor je inzet hierin!

---
Deze mail is automatisch verzonden door MvA Communicatie.
Makelaars van Amsterdam — MvA Intelligence`;

  return {
    onderwerp,
    htmlBody,
    textBody,
    ontvanger_rol: 'makelaar'
  };
}


// ════════════════════════════════════════════════════════════
// BROCHURES — vaste publieke adressen
// PDF's staan in public/brochures/ van deze repo.
// Bestand vervangen = nieuwe brochure, template blijft ongemoeid.
// ════════════════════════════════════════════════════════════
const BROCHURE_BASIS = 'https://communicatie.makelaarsvan.nl/brochures';
const BROCHURES = {
  aankoop_nl: `${BROCHURE_BASIS}/aankoop-9-stappen.pdf`,
  promotieplan_nl: `${BROCHURE_BASIS}/woningpromotieplan.pdf`,
  promotieplan_en: `${BROCHURE_BASIS}/woningpromotieplan-en.pdf`
};

// Extra styling voor klantmails (genummerd stappenplan in brochure-stijl)
const STAPPEN_STYLE_HINT = `
  ol.stappen { padding-left: 0; list-style: none; counter-reset: stap; margin: 20px 0; }
  ol.stappen li { counter-increment: stap; position: relative; padding: 0 0 14px 44px; margin: 0; }
  ol.stappen li::before { content: counter(stap); position: absolute; left: 0; top: 0;
    width: 28px; height: 28px; line-height: 28px; text-align: center;
    background: #E8500A; color: white; border-radius: 50%; font-weight: 700; font-size: 14px; }
  ol.stappen li strong { color: #1A2B5F; display: block; }
  ol.stappen li span { font-size: 14px; color: #4B5563; }
`;

const WRAP_HTML_KLANT = (innerBody, lang = 'nl') => `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<style>${SHARED_STYLE}${STAPPEN_STYLE_HINT}</style>
</head>
<body>
${innerBody}
<div class="footer">
  Makelaars van Amsterdam &middot; Valkenburgerstraat 67B, 1011 MG Amsterdam<br>
  +31 (0)20 333 11 10 &middot; amsterdam@makelaarsvan.nl &middot; www.makelaarsvan.amsterdam
</div>
</body>
</html>`;


// ════════════════════════════════════════════════════════════
// TEMPLATE 3: otd_getekend_aankoop — klantmail na tekenen
// Inhoud volgt de brochure "Uw droomwoning aankopen" (9 stappen).
// payload: { klant_naam, makelaar_naam, taal: 'nl'|'en' }
// ════════════════════════════════════════════════════════════
function templateOTDAankoop(payload) {
  const klantNaam = payload?.klant_naam || '';
  const makelaarNaam = payload?.makelaar_naam || 'uw makelaar';
  const taal = (payload?.taal || 'nl').toLowerCase();

  if (taal === 'en') {
    const onderwerp = 'Welcome to Makelaars van Amsterdam — your purchase journey in 9 steps';
    const aanhef = klantNaam ? `Dear ${klantNaam},` : 'Dear client,';

    const stappenEN = [
      ['Introduction & orientation', 'One point of contact, short lines, clear fees — completed, welcome!'],
      ['Housing wishes & search profile', 'Together we define your budget, wishes and search area, and activate your property match alerts.'],
      ['Viewings & market insight', 'We schedule viewings, assess the condition of each property and advise on structural surveys.'],
      ['Purchase strategy & negotiation', 'Market data, realistic value and the right bidding strategy — always in consultation with you.'],
      ['Agreement & purchase contract', 'We confirm the deal in writing and review the purchase agreement and resolutive conditions.'],
      ['Financing & valuation', 'We arrange the valuation report and keep an eye on your financing deadlines.'],
      ['Legal matters & notary', 'We check the deed of transfer and the completion statement, and manage all key dates.'],
      ['Key transfer & completion', 'Final inspection, meter readings, utilities — and we accompany you at the notary.'],
      ['Aftercare & service', 'Our service does not stop at completion. Questions or advice? We remain at your side.']
    ];

    const htmlBody = WRAP_HTML_KLANT(`
    <div class="badge">PURCHASE AGREEMENT SIGNED</div>
    <h1>Welcome — this is your route to your new home</h1>

    <p>${aanhef}</p>

    <p>Thank you for your trust in Makelaars van Amsterdam. Your purchase assignment has been
    signed and ${makelaarNaam} will guide you personally through every step. This is the plan:</p>

    <ol class="stappen">
      ${stappenEN.map(([t, d]) => `<li><strong>${t}</strong><span>${d}</span></li>`).join('\n      ')}
    </ol>

    <p>You can read the full step-by-step plan in our brochure (in Dutch):</p>
    <p><a href="${BROCHURES.aankoop_nl}" class="btn" target="_blank" rel="noopener">View the brochure (PDF)</a></p>

    <p>Questions in the meantime? ${makelaarNaam} is your direct point of contact.</p>
    `, 'en');

    const textBody = `PURCHASE AGREEMENT SIGNED — Welcome to Makelaars van Amsterdam

${aanhef}

Thank you for your trust. Your purchase assignment has been signed and ${makelaarNaam} will guide you through every step:

${stappenEN.map(([t, d], i) => `${i + 1}. ${t} — ${d}`).join('\n')}

Full brochure (in Dutch): ${BROCHURES.aankoop_nl}

Questions? ${makelaarNaam} is your direct point of contact.

---
Makelaars van Amsterdam — Valkenburgerstraat 67B, 1011 MG Amsterdam
+31 (0)20 333 11 10 — amsterdam@makelaarsvan.nl`;

    return { onderwerp, htmlBody, textBody, ontvanger_rol: 'klant' };
  }

  // ── Nederlandse variant ──
  const onderwerp = 'Welkom bij Makelaars van Amsterdam — uw aankooptraject in 9 stappen';
  const aanhef = klantNaam ? `Beste ${klantNaam},` : 'Beste klant,';

  const stappenNL = [
    ['Kennismaken & oriëntatiegesprek', 'Eén gezicht, korte lijnen en heldere tarieven — deze stap is afgerond, welkom!'],
    ['Woonwensen & zoekopdracht', 'Samen bepalen we budget, wensen en zoekgebied en zetten we uw woningmatch-alerts aan.'],
    ['Bezichtigen & marktinformatie', 'Wij plannen bezichtigingen in, beoordelen de staat van onderhoud en adviseren over een bouwkundige keuring.'],
    ['Aankoopstrategie & onderhandeling', 'Marktinformatie, reële waarde en de juiste biedstrategie — altijd in overleg met u.'],
    ['Overeenstemming & koopovereenkomst', 'Wij bevestigen de afspraken schriftelijk en controleren de koopovereenkomst en ontbindende voorwaarden.'],
    ['Financiering & taxatie', 'Wij regelen het taxatierapport en bewaken de termijnen van uw financiering.'],
    ['Juridische zaken & notaris', 'Wij controleren de akte van levering en de nota van afrekening en agenderen alle belangrijke data.'],
    ['Sleuteloverdracht & oplevering', 'Eindinspectie, meterstanden, nutsvoorzieningen — en wij begeleiden u bij de notaris.'],
    ['Nazorg & service', 'Onze service stopt niet na de levering. Vragen of advies? Wij blijven voor u klaarstaan.']
  ];

  const htmlBody = WRAP_HTML_KLANT(`
  <div class="badge">OPDRACHT TOT DIENSTVERLENING GETEKEND</div>
  <h1>Welkom — dit is de route naar uw nieuwe woning</h1>

  <p>${aanhef}</p>

  <p>Hartelijk dank voor uw vertrouwen in Makelaars van Amsterdam. Uw aankoopopdracht is
  getekend en ${makelaarNaam} begeleidt u persoonlijk bij iedere stap. Zo ziet het plan eruit:</p>

  <ol class="stappen">
    ${stappenNL.map(([t, d]) => `<li><strong>${t}</strong><span>${d}</span></li>`).join('\n    ')}
  </ol>

  <p>Het volledige stappenplan leest u terug in onze brochure:</p>
  <p><a href="${BROCHURES.aankoop_nl}" class="btn" target="_blank" rel="noopener">Bekijk de brochure (PDF)</a></p>

  <p>Heeft u tussendoor vragen? ${makelaarNaam} is uw directe aanspreekpunt.</p>
  `);

  const textBody = `OPDRACHT TOT DIENSTVERLENING GETEKEND — Welkom bij Makelaars van Amsterdam

${aanhef}

Hartelijk dank voor uw vertrouwen. Uw aankoopopdracht is getekend en ${makelaarNaam} begeleidt u bij iedere stap:

${stappenNL.map(([t, d], i) => `${i + 1}. ${t} — ${d}`).join('\n')}

Volledige brochure: ${BROCHURES.aankoop_nl}

Vragen? ${makelaarNaam} is uw directe aanspreekpunt.

---
Makelaars van Amsterdam — Valkenburgerstraat 67B, 1011 MG Amsterdam
+31 (0)20 333 11 10 — amsterdam@makelaarsvan.nl`;

  return { onderwerp, htmlBody, textBody, ontvanger_rol: 'klant' };
}


// ════════════════════════════════════════════════════════════
// TEMPLATE 4: otd_getekend_verkoop — klantmail na tekenen
// Inhoud volgt de brochure "Uw woningpromotieplan" (7 stappen).
// payload: { klant_naam, makelaar_naam, pand_adres, taal: 'nl'|'en' }
// ════════════════════════════════════════════════════════════
function templateOTDVerkoop(payload) {
  const klantNaam = payload?.klant_naam || '';
  const makelaarNaam = payload?.makelaar_naam || 'uw makelaar';
  const pandAdres = payload?.pand_adres || '';
  const taal = (payload?.taal || 'nl').toLowerCase();

  const pandBlokHTML = pandAdres
    ? `<div class="pand">${taal === 'en' ? 'Property' : 'Woning'}: <strong>${pandAdres}</strong></div>`
    : '';
  const pandBlokTekst = pandAdres ? `${taal === 'en' ? 'Property' : 'Woning'}: ${pandAdres}\n\n` : '';

  if (taal === 'en') {
    const onderwerp = pandAdres
      ? `Your property promotion plan for ${pandAdres}`
      : 'Your property promotion plan — what happens next';
    const aanhef = klantNaam ? `Dear ${klantNaam},` : 'Dear client,';

    const stappenEN = [
      ['Coming to market soon', 'A pre-selected group of buyers receives a property match alert before your home officially enters the market.'],
      ['Your property in the spotlight', 'Launch via your own property website with unique URL plus a targeted social media campaign — including 24/7 viewing scheduling and 3D tours.'],
      ['New on the market', 'Listing on Funda, Huispedia and Pararius with a media package designed for the highest possible ranking.'],
      ['Exclusive Open House', 'If desired, we organise an exclusive Open House so interested buyers can view your home without obligation.'],
      ['Successfully sold', 'We celebrate the result and inform neighbours, followers and home seekers — strengthening your sale and the neighbourhood.'],
      ['Give compliments', 'Share your experience as a review or fan video; every submission enters a draw for a luxury dinner for two.'],
      ['Choose your media mix', 'Standard package: professional photography incl. 360° and virtual tour, property video, measurement report and 2D/3D floorplans. Add-ons: premium video, 3D model, neighbourhood and aerial photography, artist impressions.']
    ];

    const htmlBody = WRAP_HTML_KLANT(`
    <div class="badge">SALES AGREEMENT SIGNED</div>
    <h1>Welcome — this is your property promotion plan</h1>

    ${pandBlokHTML}

    <p>${aanhef}</p>

    <p>Thank you for your trust in Makelaars van Amsterdam. Your sales assignment has been
    signed and ${makelaarNaam} will now put your home on the market with a plan. These are the steps:</p>

    <ol class="stappen">
      ${stappenEN.map(([t, d]) => `<li><strong>${t}</strong><span>${d}</span></li>`).join('\n      ')}
    </ol>

    <p>Read the full plan, including all media options, in our brochure:</p>
    <p><a href="${BROCHURES.promotieplan_en}" class="btn" target="_blank" rel="noopener">View the brochure (PDF)</a></p>

    <p>Questions in the meantime? ${makelaarNaam} is your direct point of contact.</p>
    `, 'en');

    const textBody = `SALES AGREEMENT SIGNED — Your property promotion plan

${pandBlokTekst}${aanhef}

Thank you for your trust. Your sales assignment has been signed and ${makelaarNaam} will put your home on the market with a plan:

${stappenEN.map(([t, d], i) => `${i + 1}. ${t} — ${d}`).join('\n')}

Full brochure: ${BROCHURES.promotieplan_en}

Questions? ${makelaarNaam} is your direct point of contact.

---
Makelaars van Amsterdam — Valkenburgerstraat 67B, 1011 MG Amsterdam
+31 (0)20 333 11 10 — amsterdam@makelaarsvan.nl`;

    return { onderwerp, htmlBody, textBody, ontvanger_rol: 'klant' };
  }

  // ── Nederlandse variant ──
  const onderwerp = pandAdres
    ? `Uw woningpromotieplan voor ${pandAdres}`
    : 'Uw woningpromotieplan — zo brengen wij uw woning naar de markt';
  const aanhef = klantNaam ? `Beste ${klantNaam},` : 'Beste klant,';

  const stappenNL = [
    ['Binnenkort in de verkoop', 'Een vooraf geselecteerde groep kopers ontvangt een woningmatch-alert nog vóór uw woning officieel op de markt komt.'],
    ['Uw woning in de schijnwerpers', 'Lancering via uw eigen woningwebsite met unieke URL plus een gerichte social media-campagne — inclusief 24/7 bezichtiging inplannen en 3D-tours.'],
    ['Nieuw in de verkoop', 'Plaatsing op Funda, Huispedia en Pararius met een mediapakket gericht op een zo hoog mogelijke ranking.'],
    ['Exclusief Open Huis', 'Indien gewenst organiseren wij een exclusief Open Huis zodat geïnteresseerden vrijblijvend kunnen bezichtigen.'],
    ['Succesvol verkocht', 'Wij vieren het resultaat en informeren buren, volgers en woningzoekers — goed voor uw verkoop én de buurt.'],
    ['Complimenten geven', 'Deel uw ervaring als review of fanvideo; iedere inzender maakt kans op een luxe diner voor twee.'],
    ['Kies uw mediamix', 'Standaard: professionele fotografie incl. 360° en virtuele tour, woningvideo, meetrapport en 2D/3D-plattegronden. Uitbreidingen: premium video, 3D-model, wijk- en hoogtefotografie, artist impressions.']
  ];

  const htmlBody = WRAP_HTML_KLANT(`
  <div class="badge">OPDRACHT TOT DIENSTVERLENING GETEKEND</div>
  <h1>Welkom — dit is uw woningpromotieplan</h1>

  ${pandBlokHTML}

  <p>${aanhef}</p>

  <p>Hartelijk dank voor uw vertrouwen in Makelaars van Amsterdam. Uw verkoopopdracht is
  getekend en ${makelaarNaam} brengt uw woning nu met een plan naar de markt. Dit zijn de stappen:</p>

  <ol class="stappen">
    ${stappenNL.map(([t, d]) => `<li><strong>${t}</strong><span>${d}</span></li>`).join('\n    ')}
  </ol>

  <p>Het volledige plan, inclusief alle mediamogelijkheden, leest u terug in onze brochure:</p>
  <p><a href="${BROCHURES.promotieplan_nl}" class="btn" target="_blank" rel="noopener">Bekijk de brochure (PDF)</a></p>

  <p>Heeft u tussendoor vragen? ${makelaarNaam} is uw directe aanspreekpunt.</p>
  `);

  const textBody = `OPDRACHT TOT DIENSTVERLENING GETEKEND — Uw woningpromotieplan

${pandBlokTekst}${aanhef}

Hartelijk dank voor uw vertrouwen. Uw verkoopopdracht is getekend en ${makelaarNaam} brengt uw woning met een plan naar de markt:

${stappenNL.map(([t, d], i) => `${i + 1}. ${t} — ${d}`).join('\n')}

Volledige brochure: ${BROCHURES.promotieplan_nl}

Vragen? ${makelaarNaam} is uw directe aanspreekpunt.

---
Makelaars van Amsterdam — Valkenburgerstraat 67B, 1011 MG Amsterdam
+31 (0)20 333 11 10 — amsterdam@makelaarsvan.nl`;

  return { onderwerp, htmlBody, textBody, ontvanger_rol: 'klant' };
}


// ════════════════════════════════════════════════════════════
// REGISTRATIE — koppel event_type aan template-functie
// ════════════════════════════════════════════════════════════
const TEMPLATES_PER_EVENT = {
  'woning_aangekocht': {
    naam: 'aankoop_stappenplan_v1',
    bouw: templateAankoop
  },
  'woning_verkocht': {
    naam: 'verkoop_stappenplan_v1',
    bouw: templateVerkoop
  },
  'otd_getekend_aankoop': {
    naam: 'otd_klant_aankoop_v1',
    bouw: templateOTDAankoop
  },
  'otd_getekend_verkoop': {
    naam: 'otd_klant_verkoop_v1',
    bouw: templateOTDVerkoop
  }
  // Toekomstige event-types hier toevoegen.
};

module.exports = { TEMPLATES_PER_EVENT };
