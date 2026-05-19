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
  }
  // Toekomstige event-types hier toevoegen.
  // Voorbeeld:
  //   'otd_getekend': { naam: 'otd_bevestiging_v1', bouw: templateOTD },
};

module.exports = { TEMPLATES_PER_EVENT };
