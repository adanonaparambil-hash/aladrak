<?php
/**
 * The visitor counter's store.
 *
 * The site is a static export, so there is no application server to keep a
 * running total. On GoDaddy's Linux hosting there does not need to be one:
 * this file is the whole backend, exactly as send-enquiry.php is the whole
 * mail handler. No third-party counter, no account, and the figure stays on
 * the company's own hosting.
 *
 * It lives in public/, which Next copies verbatim into the export, so it lands
 * in public_html beside index.html with no extra step.
 *
 * It is NOT used on GitHub Pages — that host serves files and never executes
 * them. components/VisitorCounter.tsx only calls here when
 * NEXT_PUBLIC_VISITS_ENDPOINT is set at build time; left unset, the counter
 * renders nothing at all rather than showing a number it cannot stand behind.
 *
 *   GET  → {"ok":true,"count":N}   read the total
 *   POST → {"ok":true,"count":N}   add one, then read it
 *
 * The browser only POSTs on a visitor's FIRST visit and GETs on every one
 * after, which is what makes this a count of people rather than of page loads.
 * That decision is the browser's because only the browser knows whether it has
 * been here before; this file counts what it is told to count.
 */

declare(strict_types=1);

/* ── settings ─────────────────────────────────────────────────────────────── */

/**
 * Where the number is kept.
 *
 * The name begins with ".ht" on purpose. Apache's stock configuration refuses
 * to serve any file matching ".ht*", so the store cannot be fetched directly
 * even though it sits in the web root — the same rule that protects .htaccess.
 * A dotfile alone would not have done it: Apache serves those quite happily.
 */
const STORE = __DIR__ . '/.htvisits';

/** A total this far from plausible means the file is damaged, not that popular. */
const SANE_MAX = 1000000000;

/* ── helpers ──────────────────────────────────────────────────────────────── */

function send(int $status, array $body): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    // the whole point is a live number; a cached one is a wrong one
    header('Cache-Control: no-store, no-cache, must-revalidate');
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Read the total, optionally adding one, under an exclusive lock.
 *
 * Two visitors arriving in the same instant would otherwise both read N and
 * both write N+1, and one of them would be forgotten. flock() makes the
 * read-modify-write a single step, so the count cannot drift downwards under
 * traffic — which is the one thing a counter must never do.
 */
function total(bool $increment): int
{
    $fh = @fopen(STORE, 'c+');
    if ($fh === false) {
        throw new RuntimeException('store not writable');
    }
    try {
        if (!flock($fh, LOCK_EX)) {
            throw new RuntimeException('store busy');
        }
        $raw = stream_get_contents($fh);
        $count = is_string($raw) ? (int) trim($raw) : 0;

        // a negative or absurd value means the file was damaged; start again
        if ($count < 0 || $count > SANE_MAX) {
            $count = 0;
        }

        if ($increment) {
            $count++;
            ftruncate($fh, 0);
            rewind($fh);
            fwrite($fh, (string) $count);
            fflush($fh);
        }
        return $count;
    } finally {
        // the lock is released by the close either way, including on throw
        @fclose($fh);
    }
}

/**
 * Crawlers that execute JavaScript still say who they are. They are not
 * visitors and counting them would quietly inflate the figure over time.
 */
function isBot(): bool
{
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    return $ua === ''
        || preg_match('/bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|pingdom|uptime/i', $ua) === 1;
}

/* ── request ──────────────────────────────────────────────────────────────── */

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method !== 'GET' && $method !== 'POST' && $method !== 'HEAD') {
    header('Allow: GET, POST');
    send(405, ['ok' => false, 'error' => 'Use GET to read the count or POST to add one.']);
}

try {
    // a bot's POST is demoted to a read: it still gets an honest answer, it
    // just does not become part of one
    send(200, ['ok' => true, 'count' => total($method === 'POST' && !isBot())]);
} catch (Throwable $e) {
    error_log('[visits] ' . $e->getMessage());
    // the counter hides itself on a failure rather than showing a stale or
    // invented figure, so there is nothing useful to say to the visitor here
    send(503, ['ok' => false, 'error' => 'Counter unavailable.']);
}
