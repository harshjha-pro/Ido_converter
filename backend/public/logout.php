<?php
require __DIR__ . '/../src/bootstrap.php';
// POST + CSRF so another site cannot log people out with a link or image.
require_post_with_csrf();
logout();
start_session();
flash('You are logged out.');
redirect('/login.php');
