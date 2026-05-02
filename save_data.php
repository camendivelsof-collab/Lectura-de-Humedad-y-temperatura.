<?php
/**
 * Script para RECIBIR datos de EMQX y GUARDARLOS
 * Ubicación: /www/save_data.php
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No JSON"]);
    exit;
}

$topic = $data['topic'] ?? 'desconocido';
$valor = $data['val'] ?? 0;
$unidad = (strpos($topic, 'temperatura') !== false) ? '°C' : '%';

$host = 'mariadb_host'; 
$db   = 'mqtt';
$user = 'sensor';
$pass = 'sensor123';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // SQL de INSERCIÓN (Para guardar)
    $sql = "INSERT INTO datos_estacion (sensor, valor, unidad) VALUES (:sensor, :valor, :unidad)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':sensor' => $topic, ':valor' => $valor, ':unidad' => $unidad]);

    echo json_encode(["status" => "success", "message" => "Guardado"]);
} catch (PDOException $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
