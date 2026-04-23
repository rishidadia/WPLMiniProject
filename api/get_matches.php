<?php
header('Content-Type: application/json');
require 'config.php';

try {
    $stmt = $pdo->query("SELECT id, sport, outcome, notes, TO_CHAR(date, 'MM/DD/YYYY') as date FROM matches ORDER BY id ASC");
    $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(["status" => "success", "matches" => $matches]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
