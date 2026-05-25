<?php
// Copy data from Laravel SQLite database to MySQL 'shuttle'.
// Usage: php sqlite_to_mysql.php

$sqlitePath = __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'Laravel' . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'database.sqlite';
if (!file_exists($sqlitePath)) {
    echo "SQLite DB not found: $sqlitePath\n";
    exit(1);
}

$mysqlDsn = 'mysql:host=127.0.0.1;dbname=shuttle;port=3306;charset=utf8mb4';
$mysqlUser = 'root';
$mysqlPass = '';

try {
    $src = new PDO('sqlite:' . $sqlitePath);
    $src->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dst = new PDO($mysqlDsn, $mysqlUser, $mysqlPass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    // disable FK checks during import to allow inserting dependent rows
    try { $dst->exec('SET FOREIGN_KEY_CHECKS=0'); } catch (Exception $e) {}
} catch (Exception $e) {
    echo "DB connection failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Get list of user tables from SQLite (exclude sqlite_ meta tables)
$tables = [];
$stmt = $src->query("SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name NOT LIKE 'sqlite_%' ORDER BY name");
foreach ($stmt->fetchAll(PDO::FETCH_COLUMN) as $t) {
    $tables[] = $t;
}

// Exclude migrations/table we don't want to copy (optional)
$exclude = ['migrations'];
$tables = array_values(array_diff($tables, $exclude));

echo "Tables to copy: " . implode(', ', $tables) . "\n";

foreach ($tables as $table) {
    echo "Copying table: $table\n";
    // fetch rows from sqlite
    $rows = $src->query("SELECT * FROM \"$table\"")->fetchAll(PDO::FETCH_ASSOC);
    if (!$rows) { echo "  (no rows)\n"; continue; }

    // build insert columns
    $cols = array_keys($rows[0]);
    $colList = implode(',', array_map(function($c){ return "`$c`"; }, $cols));
    $placeholders = implode(',', array_map(function($c){ return ':' . $c; }, $cols));

    // Use REPLACE INTO to overwrite by primary key if exists
    $sql = "REPLACE INTO `$table` ($colList) VALUES ($placeholders)";
    $dst->beginTransaction();
    $ins = $dst->prepare($sql);
    $count = 0;
    foreach ($rows as $r) {
        // normalize nulls
        foreach ($r as $k => $v) if ($v === null) $r[$k] = null;
        try {
            $ins->execute($r);
            $count++;
        } catch (Exception $e) {
            echo "  Skipped row due to error: " . $e->getMessage() . "\n";
        }
    }
    $dst->commit();
    echo "  Inserted/Replaced: $count rows\n";
}

echo "Done.\n";
try { $dst->exec('SET FOREIGN_KEY_CHECKS=1'); } catch (Exception $e) {}
