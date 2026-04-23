<?php
header('Content-Type: application/json');
require 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$name = $data['name'] ?? '';
$age = isset($data['age']) && $data['age'] !== '' ? (int)$data['age'] : null;
$college = $data['college'] ?? '';
$location = $data['location'] ?? '';
$stats = $data['stats'] ?? '';
$sports = json_encode($data['sports'] ?? []);
// If image is large base64, ensure Postgres text field can handle it (it can)
$image = $data['image'] ?? '';

try {
    $stmt = $pdo->prepare("UPDATE profiles SET name = :name, age = :age, college = :college, location = :location, stats = :stats, sports = :sports, image = :image WHERE id = 1");
    $stmt->execute([
        'name' => $name,
        'age' => $age,
        'college' => $college,
        'location' => $location,
        'stats' => $stats,
        'sports' => $sports,
        'image' => $image
    ]);
    
    if ($stmt->rowCount() === 0) {
        $stmt_insert = $pdo->prepare("INSERT INTO profiles (id, name, age, college, location, stats, sports, image) VALUES (1, :name, :age, :college, :location, :stats, :sports, :image) ON CONFLICT (id) DO NOTHING");
        $stmt_insert->execute([
            'name' => $name,
            'age' => $age,
            'college' => $college,
            'location' => $location,
            'stats' => $stats,
            'sports' => $sports,
            'image' => $image
        ]);
        
        // If ON CONFLICT isn't supported (e.g. old postgres), it might throw exception, but since rowCount=0 above meant it didn't exist, insert should work.
    }
    
    echo json_encode(["status" => "success", "message" => "Profile saved"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
