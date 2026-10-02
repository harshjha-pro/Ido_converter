<?php
// Contact form handler: the ONLY server-side code on the static site (AGENTS.md rule 2).
// It emails the message and stores nothing: no database, no files, no logs of the message.
// It never receives tool input: tools run in the browser and have no form that posts here.

declare(strict_types=1);

const RECIPIENT = 'myselfhkjha@gmail.com';
const MIN_SECONDS_ON_PAGE = 3;      // bots submit instantly
const MAX_FORM_AGE = 86400;         // a day-old form is stale
const MAX_NAME = 100;
const MAX_MESSAGE = 5000;

function back(string $status): never {
    header('Location: /contact/?status=' . rawurlencode($status), true, 303);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST', true, 405);
    exit('Method not allowed');
}

// Honeypot: humans never see or fill this field.
if (trim((string)($_POST['website'] ?? '')) !== '') {
    back('sent'); // pretend success so bots learn nothing
}

$started = (int)($_POST['started'] ?? 0);
$age = time() - intdiv($started, 1000);
if ($started <= 0 || $age < MIN_SECONDS_ON_PAGE || $age > MAX_FORM_AGE) {
    back('error');
}

// Strip CR/LF from anything that goes near a mail header, so it cannot inject extra headers.
$oneLine = static fn(string $v): string => trim(preg_replace('/[\r\n]+/', ' ', $v) ?? '');

$name = $oneLine((string)($_POST['name'] ?? ''));
$email = $oneLine((string)($_POST['email'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));

if ($name === '' || mb_strlen($name) > MAX_NAME) back('invalid');
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) back('invalid');
if ($message === '' || mb_strlen($message) > MAX_MESSAGE) back('invalid');

// Drop any :port before cleaning, so the From domain is the bare site domain (hosts reject other domains).
$hostHeader = explode(':', (string)($_SERVER['HTTP_HOST'] ?? 'localhost'))[0];
$host = preg_replace('/[^a-z0-9.-]/i', '', $hostHeader) ?: 'localhost';
$subject = 'idoconverter contact: ' . mb_substr($name, 0, 60);
$body = "Name: {$name}\nEmail: {$email}\n\n{$message}\n";
$headers = implode("\r\n", [
    "From: idoconverter <no-reply@{$host}>",
    "Reply-To: {$email}",
    'Content-Type: text/plain; charset=UTF-8',
    'X-Mailer: idoconverter-contact',
]);

$sent = mail(RECIPIENT, '=?UTF-8?B?' . base64_encode($subject) . '?=', $body, $headers);
back($sent ? 'sent' : 'error');
