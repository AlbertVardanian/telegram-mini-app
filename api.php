<?php
// Упрощенная версия API для InfinityFree
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers: *');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$filename = 'user_choices.json';

// Простой лог для отладки
file_put_contents('debug.log', date('Y-m-d H:i:s') . ' - ' . $_SERVER['REQUEST_METHOD'] . PHP_EOL, FILE_APPEND);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!file_exists($filename)) {
        echo json_encode([]);
    } else {
        $data = file_get_contents($filename);
        echo $data ?: '[]';
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $current_data = [];
    if (file_exists($filename)) {
        $current_data = json_decode(file_get_contents($filename), true) ?: [];
    }
    
    // Добавляем данные
    $input['timestamp'] = date('Y-m-d H:i:s');
    $current_data[] = $input;
    
    if (file_put_contents($filename, json_encode($current_data, JSON_PRETTY_PRINT))) {
        echo json_encode(['success' => true, 'message' => 'Saved']);
    } else {
        echo json_encode(['error' => 'Save failed']);
    }
    exit;
}

echo json_encode(['error' => 'Method not allowed']);
?>
