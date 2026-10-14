<?php
/**
 * The contact forms' mail handler.
 *
 * The site is a static export: HTML, CSS, images and nothing else. A browser
 * cannot send email on its own, so something on the server has to receive the
 * submission and post it on. On GoDaddy's Linux hosting that can simply be
 * this file — no third-party form service, no account, no monthly cap, and the
 * enquiry never leaves the company's own hosting.
 *
 * It lives in public/, which Next copies verbatim into the export, so it lands
 * in public_html beside index.html with no extra step.
 *
 * It is NOT used on GitHub Pages — that host serves files and never executes
 * them. components/ContactForms.tsx only posts here when
 * NEXT_PUBLIC_CONTACT_ENDPOINT is set at build time; left unset, the forms keep
 * their mailto: behaviour and this file is simply never called.
 *
 * Expects: POST, JSON body, from the same origin.
 * Returns: JSON {ok:true} or {ok:false,error:"..."} with a fitting status.
 */

declare(strict_types=1);

/* ── settings ─────────────────────────────────────────────────────────────── */

/** Where enquiries go. Both forms land in the same inbox. */
const TO = 'info@aladrak.com';

/**
 * The envelope sender. It MUST be an address on this domain: mail sent with a
 * From: of, say, the visitor's gmail.com is forged as far as every receiving
 * server is concerned, and SPF will send it to spam or reject it outright.
 * The visitor's own address goes in Reply-To instead, so hitting Reply in the
 * mail client still answers them directly.
 */
const FROM = 'info@aladrak.com';
const FROM_NAME = 'Al Adrak website';

/** Submissions larger than this are not legitimate enquiries. */
const MAX_BYTES = 64 * 1024;

/* ── plumbing ─────────────────────────────────────────────────────────────── */

header('Content-Type: application/json; charset=utf-8');
/* the form is served from this same domain, so no cross-origin access is
   wanted and none is granted */
header('X-Content-Type-Options: nosniff');

/* Typed void, not never: `never` is PHP 8.1, and a GoDaddy plan may still be
   running 7.4 or 8.0, where it is a fatal parse error rather than a warning.
   Nothing in this file needs 8.1. */
function fail(int $status, string $message): void {
    http_response_code($status);
    echo json_encode(['ok' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'Use POST.');
}

$raw = file_get_contents('php://input');
if ($raw === false || $raw === '') {
    fail(400, 'Empty request.');
}
if (strlen($raw) > MAX_BYTES) {
    fail(413, 'That message is too long to send from here — please email us directly.');
}

$data = json_decode($raw, true);
if (!is_array($data)) {
    fail(400, 'Could not read the submission.');
}

/**
 * Spam trap. The form renders a field no human can see or tab into; a bot
 * fills in everything it finds. Anything that arrives with it filled is
 * answered with a cheerful 200 and quietly dropped — telling a bot it failed
 * only teaches it to try again differently.
 */
if (trim((string)($data['website'] ?? '')) !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

/* ── the message ──────────────────────────────────────────────────────────── */

/** Strip CR/LF out of anything bound for a header: they split headers. */
function headerSafe(string $s): string {
    return trim(preg_replace('/[\r\n]+/', ' ', $s) ?? '');
}

$formName = headerSafe((string)($data['form'] ?? 'Website enquiry'));
if ($formName === '') {
    $formName = 'Website enquiry';
}

/* every field except the plumbing, in the order the form sent them */
$skip = ['form', 'website'];
$lines = [];
foreach ($data as $key => $value) {
    if (in_array($key, $skip, true) || !is_scalar($value)) {
        continue;
    }
    $value = trim((string)$value);
    if ($value === '') {
        continue;
    }
    $label = ucfirst(trim(preg_replace('/(?<!^)[A-Z]/', ' $0', (string)$key) ?? (string)$key));
    $lines[] = $label . ': ' . $value;
}

if (!$lines) {
    fail(422, 'Nothing was filled in.');
}

/* who to answer, if they gave a usable address */
$replyTo = '';
foreach (['email', 'coEmail', 'contactEmail'] as $k) {
    $candidate = trim((string)($data[$k] ?? ''));
    if ($candidate !== '' && filter_var($candidate, FILTER_VALIDATE_EMAIL)) {
        $replyTo = $candidate;
        break;
    }
}

$who = '';
foreach (['coName', 'company', 'name'] as $k) {
    $candidate = headerSafe((string)($data[$k] ?? ''));
    if ($candidate !== '') {
        $who = $candidate;
        break;
    }
}

$subject = $formName . ($who !== '' ? ' — ' . $who : '');

$body = implode("\n", $lines)
    . "\n\n--\n"
    . "Sent from the enquiry form on " . ($_SERVER['HTTP_HOST'] ?? 'the website') . "\n"
    . date('D, j M Y H:i') . "\n";

$headers = [
    'From: ' . FROM_NAME . ' <' . FROM . '>',
    'Content-Type: text/plain; charset=UTF-8',
    'MIME-Version: 1.0',
];
if ($replyTo !== '') {
    $headers[] = 'Reply-To: ' . headerSafe($replyTo);
}

/* -f sets the envelope sender, which is what SPF is actually checked against */
$sent = mail(
    TO,
    '=?UTF-8?B?' . base64_encode($subject) . '?=',
    $body,
    implode("\r\n", $headers),
    '-f' . FROM
);

if (!$sent) {
    fail(500, 'The message could not be sent. Please email ' . TO . ' directly.');
}

echo json_encode(['ok' => true]);
