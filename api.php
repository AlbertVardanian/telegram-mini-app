<?php
// Разрешаем CORS для всех доменов
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

// Обрабатываем preflight OPTIONS запрос
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$filename = 'user_choices.json';

// Функция для логирования (отладка)
function logMessage($message) {
    file_put_contents('debug.log', date('Y-m-d H:i:s') . ' - ' . $message . PHP_EOL, FILE_APPEND);
}

// GET - получение всех данных
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        if (!file_exists($filename)) {
            echo json_encode([]);
        } else {
            $data = file_get_contents($filename);
            echo $data ?: '[]';
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    }
    exit;
}

// POST - добавление данных
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        logMessage('POST request: ' . json_encode($input));
        
        if (!$input) {
            throw new Exception('Invalid JSON');
        }
        
        // Читаем текущие данные
        $current_data = [];
        if (file_exists($filename)) {
            $current_data = json_decode(file_get_contents($filename), true) ?: [];
        }
        
        // Добавляем timestamp
        $input['timestamp'] = date('c');
        
        // Сохраняем
        $current_data[] = $input;
        
        if (file_put_contents($filename, json_encode($current_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE))) {
            echo json_encode(['success' => true, 'message' => 'Data saved successfully']);
        } else {
            throw new Exception('Failed to save file');
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Save failed: ' . $e->getMessage()]);
    }
    exit;
}

// DELETE - удаление данных  
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!file_exists($filename)) {
            echo json_encode(['success' => true, 'message' => 'No data to delete']);
            exit;
        }
        
        $current_data = json_decode(file_get_contents($filename), true) ?: [];
        $new_data = array_filter($current_data, function($item) use ($input) {
            return !($item['timestamp'] === $input['timestamp'] && $item['product_query'] === $input['product_query']);
        });
        
        if (file_put_contents($filename, json_encode(array_values($new_data), JSON_PRETTY_PRINT))) {
            echo json_encode(['success' => true, 'message' => 'Data deleted']);
        } else {
            throw new Exception('Failed to save after delete');
        }
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Delete failed: ' . $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>
