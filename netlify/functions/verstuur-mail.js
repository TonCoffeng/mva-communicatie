// netlify/functions/verstuur-mail.js
//
// MvA Communicatie — Generieke mail-verzender (v2)
//
// Werking:
//   1. POST { event_id: <bigint>, forceer?: true }
//   2. Event ophalen uit communicatie_events
//   3. Idempotentie-slot: status 'verwerkt' wordt niet nogmaals verzonden
//      (tenzij forceer: true wordt meegegeven — alleen voor testen)
//   4. Op basis van event_type: kies template uit templates.js
//   5. Ontvanger bepalen op basis van ontvanger_rol + payload
//   6. Bouw mail, verstuur via Resend
//   7. Log resultaat in communicatie_log, update event-status
//
// TESTMODUS:
//   Netlify env var COMM_TESTMODUS bepaalt de routing:
//     - 'aan' (of variabele ontbreekt)  → alle mail naar TEST_ONTVANGER (veilig standaard)
//     - 'uit'                           → mail naar de echte ontvanger uit de payload
//   De respons en de log vermelden altijd of testmodus actief was.
//
// ONTVANGER-ROUTING (per ontvanger_rol uit de template):
//   'klant'    → payload.klant_email    + payload.klant_naam
//   'makelaar' → payload.makelaar_email + payload.makelaar_naam
//   Ontbreekt het mailadres → event op 'gefaald' met duidelijke melding.
//
// Om een nieuw event-type toe te voegen: alleen templates.js uitbreiden.

const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const { TEMPLATES_PER_EVENT } = require('./templates.js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Testmodus: standaard AAN — pas uit als env var expliciet op 'uit' staat.
const TESTMODUS = (process.env.COMM_TESTMODUS || 'aan').toLowerCase() !== 'uit';

const TEST_ONTVANGER_EMAIL = 'toncoffeng@makelaarsvan.nl';
const TEST_ONTVANGER_NAAM = 'Ton Coffeng';

// Productie-afzender (Resend domein makelaarsvan.nl is verified per 20 mei 2026)
const RESEND_VAN = 'Makelaars van Amsterdam <noreply@makelaarsvan.nl>';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

const resend = new Resend(RESEND_API_KEY);

// ── Ontvanger bepalen op basis van rol + payload ────────────
function bepaalOntvanger(ontvangerRol, payload) {
  if (ontvangerRol === 'klant') {
    return {
      email: payload?.klant_email || null,
      naam: payload?.klant_naam || 'Klant',
      ontbreektVeld: 'klant_email'
    };
  }
  // standaard: makelaar
  return {
    email: payload?.makelaar_email || null,
    naam: payload?.makelaar_naam || 'Makelaar',
    ontbreektVeld: 'makelaar_email'
  };
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
    const forceer = body.forceer === true;

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

    // ── 2. Idempotentie-slot ──────────────────────────────
    // Een verwerkt event wordt niet nogmaals verzonden.
    // Override alleen expliciet met { "forceer": true } (testen).
    if (evt.status === 'verwerkt' && !forceer) {
      return {
        statusCode: 409,
        headers,
        body: JSON.stringify({
          error: `Event ${eventId} is al verwerkt en wordt niet nogmaals verzonden.`,
          hint: 'Gebruik {"event_id": ' + eventId + ', "forceer": true} om bewust opnieuw te verzenden (alleen voor testen).'
        })
      };
    }

    // ── 3. Template zoeken voor dit event_type ────────────
    const templateConfig = TEMPLATES_PER_EVENT[evt.event_type];
    if (!templateConfig) {
      return {
        statusCode: 422,
        headers,
        body: JSON.stringify({
          error: `Event-type '${evt.event_type}' heeft geen geregistreerde template. Beschikbaar: ${Object.keys(TEMPLATES_PER_EVENT).join(', ')}`
        })
      };
    }

    // ── 4. Markeer event als in_behandeling ──────────────
    await supabase
      .from('communicatie_events')
      .update({ status: 'in_behandeling' })
      .eq('id', eventId);

    // ── 5. Bouw mail-inhoud via template ─────────────────
    const { onderwerp, htmlBody, textBody, ontvanger_rol } = templateConfig.bouw(evt.payload);

    // ── 6. Ontvanger bepalen ──────────────────────────────
    const echteOntvanger = bepaalOntvanger(ontvanger_rol, evt.payload);

    if (!TESTMODUS && !echteOntvanger.email) {
      const melding = `Geen mailadres in payload: veld '${echteOntvanger.ontbreektVeld}' ontbreekt (ontvanger_rol: ${ontvanger_rol}).`;
      await supabase
        .from('communicatie_events')
        .update({ status: 'gefaald', error_bericht: melding })
        .eq('id', eventId);

      return {
        statusCode: 422,
        headers,
        body: JSON.stringify({ error: melding })
      };
    }

    const verzendEmail = TESTMODUS ? TEST_ONTVANGER_EMAIL : echteOntvanger.email;
    const verzendNaam = TESTMODUS ? TEST_ONTVANGER_NAAM : echteOntvanger.naam;

    // ── 7. Log-regel aanmaken (status: queued) ───────────
    const { data: logRij, error: logErr } = await supabase
      .from('communicatie_log')
      .insert({
        event_id: eventId,
        template_naam: templateConfig.naam,
        onderwerp: onderwerp,
        ontvanger_email: verzendEmail,
        ontvanger_naam: verzendNaam,
        ontvanger_rol: ontvanger_rol,
        status: 'queued',
        body_snapshot: textBody
      })
      .select()
      .single();

    if (logErr) throw new Error('Log aanmaken: ' + logErr.message);

    // ── 8. Verstuur via Resend ────────────────────────────
    let resendResult;
    try {
      resendResult = await resend.emails.send({
        from: RESEND_VAN,
        to: [verzendEmail],
        subject: onderwerp,
        html: htmlBody,
        text: textBody,
      });
    } catch (sendErr) {
      await supabase
        .from('communicatie_log')
        .update({ status: 'gefaald', fout_bericht: sendErr.message })
        .eq('id', logRij.id);

      await supabase
        .from('communicatie_events')
        .update({ status: 'gefaald', error_bericht: 'Resend faalde: ' + sendErr.message })
        .eq('id', eventId);

      throw new Error('Resend verzending: ' + sendErr.message);
    }

    // Resend kan ook in respons een error-object teruggeven
    if (resendResult?.error) {
      const foutmelding = resendResult.error.message || JSON.stringify(resendResult.error);

      await supabase
        .from('communicatie_log')
        .update({ status: 'gefaald', fout_bericht: foutmelding })
        .eq('id', logRij.id);

      await supabase
        .from('communicatie_events')
        .update({ status: 'gefaald', error_bericht: 'Resend respons-fout: ' + foutmelding })
        .eq('id', eventId);

      return {
        statusCode: 502,
        headers,
        body: JSON.stringify({ error: 'Resend gaf fout terug', detail: foutmelding })
      };
    }

    const resendId = resendResult?.data?.id || null;

    // ── 9. Update log: verzonden ─────────────────────────
    await supabase
      .from('communicatie_log')
      .update({
        status: 'verzonden',
        verzonden_op: new Date().toISOString(),
        resend_id: resendId
      })
      .eq('id', logRij.id);

    // ── 10. Update event: verwerkt ───────────────────────
    await supabase
      .from('communicatie_events')
      .update({
        status: 'verwerkt',
        verwerkt_op: new Date().toISOString()
      })
      .eq('id', eventId);

    // ── 11. Succes-respons ───────────────────────────────
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        event_id: eventId,
        event_type: evt.event_type,
        template_naam: templateConfig.naam,
        log_id: logRij.id,
        resend_id: resendId,
        testmodus: TESTMODUS,
        ontvanger: verzendEmail,
        echte_ontvanger: echteOntvanger.email || '(geen adres in payload)',
        bericht: TESTMODUS
          ? 'Mail verzonden (TESTMODUS: naar testadres, echte ontvanger staat in echte_ontvanger)'
          : 'Mail verzonden'
      })
    };

  } catch (err) {
    console.error('verstuur-mail error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
