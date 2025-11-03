<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$filename = 'user_choices.json';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['user_id']) || !isset($input['marketplace']) || 
        !isset($input['category']) || !isset($input['product_query'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Недостаточно данных']);
        exit;
    }
    
    $current_data = [];
    
    if (file_exists($filename)) {
        $current_data = json_decode(file_get_contents($filename), true) ?? [];
    }
    
    $userChoices = array_filter($current_data, function($choice) use ($input) {
        return $choice['user_id'] == $input['user_id'];
    });
    
    if (count($userChoices) >= 5) {
        http_response_code(429);
        echo json_encode(['error' => 'Превышен лимит товаров']);
        exit;
    }
    
    $duplicate = array_filter($userChoices, function($choice) use ($input) {
        return strtolower($choice['product_query']) == strtolower($input['product_query']);
    });
    
    if (count($duplicate) > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Такой товар уже добавлен']);
        exit;
    }
    
    $data = [
        'user_id' => $input['user_id'],
        'anon_id' => $input['anon_id'],
        'marketplace' => $input['marketplace'],
        'category' => $input['category'],
        'product_query' => $input['product_query'],
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    $current_data[] = $data;
    
    if (file_put_contents($filename, json_encode($current_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
        $remaining = 5 - count($userChoices) - 1;
        echo json_encode([
            'success' => true, 
            'remaining' => $remaining,
            'message' =>
