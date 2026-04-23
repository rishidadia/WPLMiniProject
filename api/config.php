<?php
// Database Configuration
$host = 'localhost';
$port = '5432';
$dbname = 'wpl'; // Replace with your actual database name
$user = 'postgres'; // Replace with your PostgreSQL username
$password = 'postgres'; // Replace with your PostgreSQL password

try {
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;";
    $pdo = new PDO($dsn, $user, $password, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (PDOException $e) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "Database Connection Failed: " . $e->getMessage()]);
    exit;
}
?>
