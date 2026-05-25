<?php
// Simple SQLite DB browser (read-only).
// Usage: http://127.0.0.1:8081/db_browser.php

$dbPath = __DIR__ . DIRECTORY_SEPARATOR . 'Laravel' . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'database.sqlite';
if (!file_exists($dbPath)) {
    echo "<h2>SQLite database not found at: " . htmlspecialchars($dbPath) . "</h2>";
    exit;
}

try {
    $pdo = new PDO('sqlite:' . $dbPath);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    echo "<h2>Failed to open SQLite DB:</h2>";
    echo '<pre>' . htmlspecialchars($e->getMessage()) . '</pre>';
    exit;
}

function h($s) { return htmlspecialchars($s); }

echo '<!doctype html><html><head><meta charset="utf-8"><title>Shuttle SQLite Browser</title>';
echo '<style>body{font-family:Arial,Helvetica,sans-serif;margin:16px} table{border-collapse:collapse;width:100%;margin-bottom:16px} th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#f4f4f4}</style>';
echo '</head><body>';
echo '<h1>Shuttle SQLite Browser</h1>';
echo '<p>Read-only viewer. Database: <code>' . h($dbPath) . '</code></p>';

// list tables
$stmt = $pdo->query("SELECT name, type FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name");
$tables = $stmt->fetchAll(PDO::FETCH_ASSOC);
if (!$tables) {
    echo '<p>No tables found.</p>';
    echo '</body></html>';
    exit;
}

echo '<h2>Tables</h2><ul>';
foreach ($tables as $t) {
    $name = $t['name'];
    echo '<li><a href="?table=' . urlencode($name) . '">' . h($name) . '</a> (' . h($t['type']) . ')</li>';
}
echo '</ul>';

if (!empty($_GET['table'])) {
    $table = preg_replace('/[^A-Za-z0-9_]/','', $_GET['table']);
    echo '<h2>Contents of ' . h($table) . '</h2>';
    try {
        $q = $pdo->query("SELECT * FROM " . $table . " LIMIT 200");
        $rows = $q->fetchAll(PDO::FETCH_ASSOC);
        if (!$rows) {
            echo '<p><em>No rows.</em></p>';
        } else {
            echo '<table><thead><tr>';
            foreach (array_keys($rows[0]) as $col) echo '<th>' . h($col) . '</th>';
            echo '</tr></thead><tbody>';
            foreach ($rows as $r) {
                echo '<tr>';
                foreach ($r as $v) echo '<td>' . h((string)$v) . '</td>';
                echo '</tr>';
            }
            echo '</tbody></table>';
        }
    } catch (Exception $e) {
        echo '<p style="color:red">Query failed: ' . h($e->getMessage()) . '</p>';
    }
}

echo '<p><a href="db_browser.php">Back to tables</a></p>';
echo '</body></html>';
