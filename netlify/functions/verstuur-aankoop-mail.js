// netlify/functions/verstuur-aankoop-mail.js
//
// MvA Communicatie — PoC: verstuur aankoop-stappenplan mail
//
// Wordt aangeroepen met POST { event_id: <bigint> }
// Haalt event op uit communicatie_events, verstuurt mail via Resend,
// logt resultaat in communicatie_log.
//
// Voor PoC: hard-coded ontvanger (toncoffeng@makelaarsvan.nl),
// hard-coded template (aankoop_stappenplan_v1).
// In fase 2: ontvanger en template komen uit event-payload en regels-tabel.

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// PoC-config: deze worden later dynamisch
const TEST_ONTVANGER_EMAIL = 'toncoffeng@makelaarsvan.nl';
const TEST_ONTVANGER_NAAM = 'Ton Coffeng';
const RESEND_VAN = 'MvA Communicatie <onboarding@resend.dev>';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

const resend = new Resend(RESEND_API_KEY);

// ── Mail-template: aankoop stappenplan ─────────────────────
function bouwAankoopStappenplanMail(eventData) {
  const pandAdres = eventData?.pand_adres || '[adres pand]';
  const makelaarNaam = eventData?.makelaar_naam || TEST_ONTVANGER_NAAM;

  const onderwerp = `Aankoop afgerond: ${pandAdres} — stappenplan dossierafhandeling`;

  const htmlBody = `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #2D2D2D; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; }
  h1 { color: #1A2B5F; font-size: 22px; margin-bottom: 8px; }
  .badge { display: inline-block; background: #E8500A; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 16px; }
  .pand { background: #F4F5F8; padding: 14px 18px; border-radius: 8px; margin: 16px 0; font-size: 15px; }
  .pand strong { color: #1A2B5F; }
  h2 { color: #1A2B5F; font-size: 16px; margin-top: 24px; margin-bottom: 8px; }
  ul { padding-left: 20px; }
  li { margin-bottom: 10px; }
  .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E5ED; color: #6B7280; font-size: 12px; }
</style>
</head>
<body>
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

  <div class="footer">
    Deze mail is automatisch verzonden door MvA Communicatie.<br>
    Makelaars van Amsterdam &middot; MvA Intelligence
  </div>
</body>
</html>`;

  // Plain-text fallback voor mail-clients zonder HTML
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

  return { onderwerp, htmlBody, textBody };
}

// ── Hoofdhandler ────────────────────────────────────────────
exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Methode niet toegestaan, gebruik POST' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const eventId = body.event_id;

    if (!eventId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'event_id ontbreekt in body' })
      };
    }

    // ── 1. Event ophalen ──────────────────────────────────
    const { data: evt, error: evtErr } = await supabase
      .from('communicatie_events')
      .select('*')
      .eq('id', eventId)
      .maybeSingle();

    if (evtErr) throw new Error('Event ophalen: ' + evtErr.message);
    if (!evt) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: `Event ${eventId} niet gevonden` })
      };
    }

    // ── 2. Valideer event_type (PoC: alleen woning_aangekocht) ──
    if (evt.event_type !== 'woning_aangekocht') {
      return {
        statusCode: 422,
        headers,
        body: JSON.stringify({
          error: `Event-type '${evt.event_type}' wordt nog niet ondersteund. Alleen 'woning_aangekocht' werkt in deze PoC.`
        })
      };
    }

    // ── 3. Markeer event als in_behandeling ──────────────
    await supabase
      .from('communicatie_events')
      .update({ status: 'in_behandeling' })
      .eq('id', eventId);

    // ── 4. Bouw mail-inhoud ──────────────────────────────
    const { onderwerp, htmlBody, textBody } = bouwAankoopStappenplanMail(evt.payload);

    // ── 5. Log-regel aanmaken (status: queued) ───────────
    const { data: logRij, error: logErr } = await supabase
      .from('communicatie_log')
      .insert({
        event_id: eventId,
        template_naam: 'aankoop_stappenplan_v1',
        onderwerp: onderwerp,
        ontvanger_email: TEST_ONTVANGER_EMAIL,
        ontvanger_naam: TEST_ONTVANGER_NAAM,
        ontvanger_rol: 'makelaar',
        status: 'queued',
        body_snapshot: textBody
      })
      .select()
      .single();

    if (logErr) throw new Error('Log aanmaken: ' + logErr.message);

    // ── 6. Verstuur via Resend ────────────────────────────
    let resendResult;
    try {
      resendResult = await resend.emails.send({
        from: RESEND_VAN,
        to: [TEST_ONTVANGER_EMAIL],
        subject: onderwerp,
        html: htmlBody,
        text: textBody,
      });
    } catch (sendErr) {
      // Markeer log als gefaald
      await supabase
        .from('communicatie_log')
        .update({
          status: 'gefaald',
          fout_bericht: sendErr.message
        })
        .eq('id', logRij.id);

      // Markeer event als gefaald
      await supabase
        .from('communicatie_events')
        .update({
          status: 'gefaald',
          error_bericht: 'Resend faalde: ' + sendErr.message
        })
        .eq('id', eventId);

      throw new Error('Resend verzending: ' + sendErr.message);
    }

    // Resend kan ook in respons een error-object teruggeven
    if (resendResult?.error) {
      const foutmelding = resendResult.error.message || JSON.stringify(resendResult.error);

      await supabase
        .from('communicatie_log')
        .update({
          status: 'gefaald',
          fout_bericht: foutmelding
        })
        .eq('id', logRij.id);

      await supabase
        .from('communicatie_events')
        .update({
          status: 'gefaald',
          error_bericht: 'Resend respons-fout: ' + foutmelding
        })
        .eq('id', eventId);

      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Resend gaf fout terug', detail: foutmelding })
      };
    }

    const resendId = resendResult?.data?.id || null;

    // ── 7. Update log: verzonden ─────────────────────────
    await supabase
      .from('communicatie_log')
      .update({
        status: 'verzonden',
        verzonden_op: new Date().toISOString(),
        resend_id: resendId
      })
      .eq('id', logRij.id);

    // ── 8. Update event: verwerkt ────────────────────────
    await supabase
      .from('communicatie_events')
      .update({
        status: 'verwerkt',
        verwerkt_op: new Date().toISOString()
      })
      .eq('id', eventId);

    // ── 9. Succes-respons ────────────────────────────────
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        event_id: eventId,
        log_id: logRij.id,
        resend_id: resendId,
        ontvanger: TEST_ONTVANGER_EMAIL,
        bericht: 'Mail verzonden'
      })
    };

  } catch (err) {
    console.error('verstuur-aankoop-mail error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
