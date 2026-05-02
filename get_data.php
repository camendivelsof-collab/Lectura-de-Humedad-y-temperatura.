<?php
/**
 * Script para CONSULTAR historial de Temperatura y Humedad
 * Este archivo alimenta las dos gráficas del Dashboard v3.0
 */

header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

// Configuración de la base de datos
$host = 'mariadb_host'; 
$db   = 'mqtt';
$user = 'sensor';
$pass = 'sensor123';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Obtener los últimos 15 registros de temperatura
    $sqlT = "SELECT valor, fecha FROM datos_estacion 
             WHERE sensor = 'esp32/temperatura' 
             ORDER BY fecha DESC LIMIT 15";
    $stmtT = $pdo->query($sqlT);
    // Invertimos el orden para que la gráfica se vea de izquierda a derecha (pasado a presente)
    $resT = array_reverse($stmtT->fetchAll(PDO::FETCH_ASSOC));

    // 2. Obtener los últimos 15 registros de humedad
    $sqlH = "SELECT valor, fecha FROM datos_estacion 
             WHERE sensor = 'esp32/humedad' 
             ORDER BY fecha DESC LIMIT 15";
    $stmtH = $pdo->query($sqlH);
    $resH = array_reverse($stmtH->fetchAll(PDO::FETCH_ASSOC));

    // Devolvemos ambos arreglos en un solo objeto JSON
    echo json_encode([
        "status" => "success",
        "temp_history" => $resT,
        "hum_history" => $resH
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "status" => "error", 
        "message" => "Error de conexión: " . $e->getMessage()
    ]);
}
?>
