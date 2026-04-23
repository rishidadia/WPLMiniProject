<?php
header('Content-Type: application/json');
require 'config.php';

try {
    $stmt = $pdo->query("SELECT * FROM profiles WHERE id = 1");
    $profile = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($profile) {
        $profile['sports'] = json_decode($profile['sports'], true) ?: [];
        echo json_encode(["status" => "success", "profile" => $profile]);
    } else {
        echo json_encode(["status" => "success", "profile" => null]);
    }
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
