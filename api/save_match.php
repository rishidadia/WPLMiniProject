<?php
header('Content-Type: application/json');
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['sport']) || !isset($data['outcome'])) {
    echo json_encode(["status" => "error", "message" => "Invalid data"]);
    exit;
}

$sport = $data['sport'];
$outcome = $data['outcome'];
$notes = $data['notes'] ?? '';

try {
    $stmt = $pdo->prepare("INSERT INTO matches (sport, outcome, notes) VALUES (:sport, :outcome, :notes) RETURNING id");
    $stmt->execute(['sport' => $sport, 'outcome' => $outcome, 'notes' => $notes]);
    $id = $stmt->fetchColumn();

    $stmt2 = $pdo->prepare("SELECT id, sport, outcome, notes, TO_CHAR(date, 'MM/DD/YYYY') as date FROM matches WHERE id = :id");
    $stmt2->execute(['id' => $id]);
    $match = $stmt2->fetch(PDO::FETCH_ASSOC);

    echo json_encode(["status" => "success", "match" => $match]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
