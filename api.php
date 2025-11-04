<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$filename = 'user_choices.json';

// Функция для чтения данных
function readData() {
    global $filename;
    if (!file_exists($filename)) {
        return [];
    }
    $data = file_get_contents($filename);
    return json_decode($data, true) ?: [];
}

// Функция для сохранения данных
function saveData($data) {
    global $filename;
    return file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

// Обработка GET запроса - получение всех данных
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $data = readData();
    echo json_encode($data);
    exit;
}

// Обработка POST запроса - добавление новых данных
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['user_id']) || !isset($input['marketplace']) || 
        !isset($input['category']) || !isset($input['product_query'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Недостаточно данных']);
        exit;
    }
    
    $current_data = readData();
    
    // Проверяем лимит для пользователя (максимум 5 товаров)
    $userChoices = array_filter($current_data, function($choice) use ($input) {
        return $choice['user_id'] == $input['user_id'];
    });
    
    if (count($userChoices) >= 5) {
        http_response_code(429);
        echo json_encode(['error' => 'Превышен лимит товаров (максимум 5)']);
        exit;
    }
    
    // Проверяем дубликаты
    $duplicate = array_filter($userChoices, function($choice) use ($input) {
        return strtolower($choice['product_query']) == strtolower($input['product_query']);
    });
    
    if (count($duplicate) > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Такой товар уже добавлен']);
        exit;
    }
    
    // Добавляем новые данные
    $data = [
        'user_id' => $input['user_id'],
        'anon_id' => $input['anon_id'] ?? 'unknown',
        'marketplace' => $input['marketplace'],
        'category' => $input['category'],
        'product_query' => $input['product_query'],
        'timestamp' => $input['timestamp'] ?? date('Y-m-d H:i:s')
    ];
    
    $current_data[] = $data;
    
    if (saveData($current_data)) {
        $remaining = 5 - count($userChoices) - 1;
        echo json_encode([
            'success' => true, 
            'remaining' => $remaining,
            'message' => 'Данные успешно сохранены'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка сохранения на сервере']);
    }
    exit;
}

// Обработка DELETE запроса - удаление данных
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['timestamp']) || !isset($input['product_query'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Недостаточно данных для удаления']);
        exit;
    }
    
    $current_data = readData();
    $initial_count = count($current_data);
    
    // Фильтруем данные, удаляя нужную запись
    $current_data = array_filter($current_data, function($item) use ($input) {
        return !($item['timestamp'] == $input['timestamp'] && $item['product_query'] == $input['product_query']);
    });
    
    // Переиндексируем массив
    $current_data = array_values($current_data);
    
    if (count($current_data) < $initial_count && saveData($current_data)) {
        echo json_encode(['success' => true, 'message' => 'Данные удалены']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка удаления или данные не найдены']);
    }
    exit;
}

// Если метод не поддерживается
http_response_code(405);
echo json_encode(['error' => 'Метод не поддерживается']);
?>
