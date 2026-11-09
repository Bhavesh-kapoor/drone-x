/*
 * DroneX — enquiry form integration point.
 *
 * FORM_ENDPOINT: URL that accepts a POST of JSON and returns 2xx on success.
 *   Leave empty until DroneX approves a destination (their own API, a CRM
 *   webhook, or a form service authorised under the NDA).
 *   While empty, the form validates fully but tells the visitor plainly that
 *   nothing was sent. It never shows a success message without a 2xx reply.
 *
 * Do NOT put API keys or secrets here — this file is public. Anything that
 * needs a secret must sit behind a server-side endpoint.
 */
window.DRONEX_CONFIG = {
  FORM_ENDPOINT: "",
  FORM_TIMEOUT_MS: 15000
};
