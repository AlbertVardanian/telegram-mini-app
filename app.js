// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Получаем ID пользователя Telegram
const userTelegramId = tg.initDataUnsafe.user?.id || 'unknown_' + Date.now();

// ПАРОЛЬ ДЛЯ ДОСТУПА К АДМИНКЕ (ИЗМЕНИТЕ НА СВОЙ!)
const ADMIN_PASSWORD = "ASTINAL1009.";

// Запуск приложения
document.addEventListener('DOMContentLoaded', function() {
    showWelcomeScreen();
});

// ==================== ГЛАВНЫЙ ЭКРАН ====================

function showWelcomeScreen() {
    document.getElementById('app').innerHTML = `
        <div class="welcome-screen">
            <h1>🛍️ Анализ покупательских предпочтений</h1>
            <p>Исследуем популярные товары на маркетплейсах</p>
            
            <div class="welcome-buttons">
                <button class="btn-main" onclick="showUserSurvey()">
                    📝 Пройти опрос
                </button>
                <button class="btn-main admin-login-btn" onclick="showAdminLogin()">
                    🔐 Я админ
                </button>
            </div>
        </div>
    `;
}

// ==================== ЭКРАН ВВОДА ПАРОЛЯ ====================

function showAdminLogin() {
    document.getElementById('app').innerHTML = `
        <div class="password-screen">
            <h2>🔐 Вход в панель админа</h2>
            <p>Введите пароль для доступа к аналитике</p>
            
            <input type="password" id="adminPassword" placeholder="Введите пароль" class="password-input">
            <button id="submitPassword" class="submit-btn">Войти</button>
            
            <button onclick="showWelcomeScreen()" class="submit-btn" style="margin-top: 10px; background: #666;">
                ← Назад
            </button>
            
            <div id="passwordMessage"></div>
        </div>
    `;

    document.getElementById('submitPassword').addEventListener('click', checkAdminPassword);
    document.getElementById('adminPassword').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAdminPassword();
        }
    });
}

function checkAdminPassword() {
    const passwordInput = document.getElementById('adminPassword');
    const messageDiv = document.getElementById('passwordMessage');
    const password = passwordInput.value.trim();

    if (!password) {
        messageDiv.innerHTML = '<div class="error-message">Введите пароль</div>';
        return;
    }

    if (password === ADMIN_PASSWORD) {
        messageDiv.innerHTML = '<div class="success-message">✅ Доступ разрешен</div>';
        setTimeout(() => {
            showAdminMarketplaceSelect();
        }, 1000);
    } else {
        messageDiv.innerHTML = '<div class="error-message">❌ Неверный пароль</div>';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// ==================== ПОЛЬЗОВАТЕЛЬСКИЙ ОПРОС ====================

function showUserSurvey() {
    document.getElementById('app').innerHTML = `
        <div id="userSurvey">
            <div id="step1" class="step active">
                <h2>🏪 Выберите маркетплейс</h2>
                <p>Где вы обычно ищете товары?</p>
                <div class="buttons-grid">
                    <button class="btn-marketplace" data-value="Wildberries">Wildberries</button>
                    <button class="btn-marketplace" data-value="OZON">OZON</button>
                    <button class="btn-marketplace" data-value="Яндекс.Маркет">Яндекс.Маркет</button>
                </div>
            </div>

            <div id="step2" class="step">
                <h2>📁 Найдите категорию</h2>
                <input type="text" id="categorySearch" placeholder="Начните вводить категорию..." class="search-input">
                <div id="categoryResults" class="results-container"></div>
            </div>

            <div id="step3" class="step">
                <h2>📦 Какой товар искали?</h2>
                <p>Пожалуйста, введите конкретное название товара</p>
                <input type="text" id="productInput" placeholder="Например: Беговые кроссовки Nike Air Max" class="product-input">
                <button id="submitProduct" class="submit-btn">Отправить</button>
            </div>

            <div id="step4" class="step">
                <h2>🎉 Спасибо за участие!</h2>
                <p>Ваш выбор сохранен анонимно и поможет нам в аналитике</p>
                <button onclick="showWelcomeScreen()" class="submit-btn">Вернуться</button>
            </div>
        </div>
    `;

    initUserSurvey();
}

// Состояние приложения для пользователя
let userData = {
    user_id: userTelegramId,
    anon_id: generateAnonId(),
    marketplace: '',
    category: '',
    product_query: ''
};

// Категории
const CATEGORIES = {
    "📱 ЭЛЕКТРОНИКА": [
        "Смартфоны и гаджеты",
        "Компьютеры и ноутбуки", 
        "Телевизоры и аудио",
        "Фото и видео техника",
        "Игровые приставки",
        "Умный дом",
        "Электротранспорт"
    ],
    
    "🏠 БЫТОВАЯ ТЕХНИКА": [
        "Крупная бытовая техника",
        "Малая кухонная техника", 
        "Климатическая техника",
        "Уборка и уход за одеждой",
        "Приготовление пищи",
        "Уход за внешностью"
    ],
    
    "👕 ОДЕЖДА И ОБУВЬ": [
        "Мужская одежда",
        "Женская одежда", 
        "Детская одежда",
        "Обувь",
        "Аксессуары",
        "Спортивная одежда",
        "Нижнее белье"
    ],
    
    "💄 КРАСОТА И ЗДОРОВЬЕ": [
        "Косметика",
        "Парфюмерия", 
        "Уход за кожей",
        "Уход за волосами",
        "Декоративная косметика",
        "Витамины и БАДы",
        "Медицинские изделия"
    ],
    
    "🎮 ИГРУШКИ И ХОББИ": [
        "Детские игрушки",
        "Настольные игры",
        "Конструкторы",
        "Творчество и рукоделие",
        "Коллекционирование",
        "Спортивные хобби",
        "Музыкальные инструменты"
    ],
    
    "🛋 ДОМ И САД": [
        "Мебель",
        "Текстиль для дома",
        "Декор и освещение",
        "Посуда и кухонные принадлежности",
        "Товары для сада",
        "Инструменты",
        "Хранение вещей"
    ],
    
    "👶 ДЕТСКИЕ ТОВАРЫ": [
        "Товары для малышей",
        "Детское питание",
        "Школьные принадлежности",
        "Детский транспорт",
        "Товары для кормления",
        "Гигиена и уход",
        "Безопасность"
    ],
    
    "🏃 СПОРТ И ОТДЫХ": [
        "Тренажеры и фитнес",
        "Спортивный инвентарь",
        "Туризм и кемпинг",
        "Велоспорт",
        "Зимние виды спорта",
        "Водные виды спорта",
        "Охота и рыбалка",
        "Спортивная обувь",
        "Спортивная одежда"
    ],
    
    "🚗 АВТОТОВАРЫ": [
        "Автозапчасти",
        "Шины и диски",
        "Автоэлектроника",
        "Уход за автомобилем",
        "Автоаксессуары",
        "Автомасла и химия",
        "Инструменты для авто"
    ],
    
    "📚 КНИГИ И КАНЦТОВАРЫ": [
        "Книги",
        "Канцелярские товары",
        "Офисные принадлежности",
        "Бумажная продукция",
        "Учебная литература",
        "Творческие наборы",
        "Электронные книги"
    ],
    
    "🐾 ЗООТОВАРЫ": [
        "Корм для животных",
        "Аксессуары для животных",
        "Игрушки для питомцев",
        "Ветеринарные товары",
        "Уход и гигиена",
        "Переноски и лежаки",
        "Одежда для животных"
    ],
    
    "🍎 ПРОДУКТЫ ПИТАНИЯ": [
        "Бакалея",
        "Молочные продукты",
        "Мясо и птица",
        "Рыба и морепродукты",
        "Овощи и фрукты",
        "Напитки",
        "Замороженные продукты"
    ]
};

// Запрещенные слова для категорий
const FORBIDDEN_WORDS = {
    "📱 ЭЛЕКТРОНИКА": [
        "книга", "ручка", "карандаш", "тетрадь", "еда", "продукты", "молоко", "хлеб",
        "abc", "test", "123", "qwerty", "asdf", "zxcv", "йцукен", "фыва",
        "123456", "000000", "111111", "aaa", "bbb", "ccc", "..." , "???", "!!!"
    ],
    "🏠 БЫТОВАЯ ТЕХНИКА": [
        "ручка", "карандаш", "тетрадь", "книга", "еда", "продукты",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "👕 ОДЕЖДА И ОБУВЬ": [
        "холодильник", "телевизор", "ноутбук", "телефон", "компьютер", "еда", "продукты",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "💄 КРАСОТА И ЗДОРОВЬЕ": [
        "машина", "шины", "компьютер", "телефон", "холодильник",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "🎮 ИГРУШКИ И ХОББИ": [
        "продукты", "молоко", "хлеб", "еда", "телефон", "компьютер",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "🛋 ДОМ И САД": [
        "телефон", "смартфон", "компьютер", "еда", "продукты",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "👶 ДЕТСКИЕ ТОВАРЫ": [
        "телефон", "ноутбук", "компьютер", "машина", "шины",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "🏃 СПОРТ И ОТДЫХ": [
        "телефон", "книга", "ручка", "еда", "продукты",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "🚗 АВТОТОВАРЫ": [
        "телефон", "книга", "ручка", "еда", "продукты",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "📚 КНИГИ И КАНЦТОВАРЫ": [
        "телефон", "холодильник", "телевизор", "еда", "продукты",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "🐾 ЗООТОВАРЫ": [
        "телефон", "книга", "ручка", "еда", "продукты",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ],
    "🍎 ПРОДУКТЫ ПИТАНИЯ": [
        "телефон", "книга", "ручка", "компьютер", "одежда",
        "abc", "test", "123", "qwerty", "..." , "???", "!!!"
    ]
};

function generateAnonId() {
    return 'anon_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
}

function showStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => {
        step.classList.remove('active');
    });
    document.getElementById(`step${stepNumber}`).classList.add('active');
}

function initUserSurvey() {
    document.querySelectorAll('.btn-marketplace').forEach(btn => {
        btn.addEventListener('click', (e) => {
            userData.marketplace = e.target.dataset.value;
            showStep(2);
            initCategorySearch();
        });
    });

    document.getElementById('submitProduct').addEventListener('click', submitProduct);
}

function initCategorySearch() {
    const searchInput = document.getElementById('categorySearch');
    const resultsContainer = document.getElementById('categoryResults');

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        displayCategories(searchCategories(query));
    });

    function searchCategories(query) {
        const results = {};
        
        for (const [section, categories] of Object.entries(CATEGORIES)) {
            const filtered = categories.filter(category => 
                category.toLowerCase().includes(query) || 
                section.toLowerCase().includes(query)
            );
            
            if (filtered.length > 0) {
                results[section] = filtered;
            }
        }
        
        return results;
    }

    function displayCategories(categoriesBySection) {
        let html = '';
        
        for (const [section, categories] of Object.entries(categoriesBySection)) {
            html += `<div class="category-section">${section}</div>`;
            
            categories.forEach(category => {
                html += `
                    <div class="category-item" data-category="${category}">
                        ${category}
                    </div>
                `;
            });
        }
        
        resultsContainer.innerHTML = html;

        document.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                userData.category = e.target.dataset.category;
                showStep(3);
            });
        });
    }

    displayCategories(CATEGORIES);
}

function validateProduct(product, category) {
    if (product.length < 3) {
        return "❌ Название товара должно содержать минимум 3 символа";
    }

    if (product.length > 100) {
        return "❌ Название товара слишком длинное";
    }

    const randomPatterns = [
        /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i,
        /(123|234|345|456|567|678|789|098|987|876|765|654|543|432|321)/,
        /(qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm)/i,
        /(йцу|цук|уке|кен|енг|нгш|гшщ|шщз|щзх|зхъ|фыв|ыва|вап|апр|про|рол|олд|лдж|джэ|жэё)/i
    ];
    
    if (randomPatterns.some(pattern => pattern.test(product))) {
        return "❌ Название товара содержит недопустимые последовательности";
    }

    const forbiddenWords = FORBIDDEN_WORDS[Object.keys(CATEGORIES).find(section => 
        CATEGORIES[section].includes(category)
    )] || [];

    if (forbiddenWords.some(word => product.toLowerCase().includes(word))) {
        return "❌ Этот товар не соответствует выбранной категории";
    }

    return null;
}

async function submitProduct() {
    const productInput = document.getElementById('productInput');
    const product = productInput.value.trim();

    if (!product) {
        alert('Пожалуйста, введите название товара');
        return;
    }

    const validationError = validateProduct(product, userData.category);
    if (validationError) {
        alert(validationError);
        return;
    }

    userData.product_query = product;

    try {
        const existingData = JSON.parse(localStorage.getItem('user_choices') || '[]');
        
        const userChoices = existingData.filter(choice => choice.user_id === userTelegramId);
        if (userChoices.length >= 5) {
            alert('❌ Вы уже добавили максимальное количество товаров (5)');
            showStep(4);
            return;
        }

        const duplicate = userChoices.find(choice => 
            choice.product_query.toLowerCase() === product.toLowerCase()
        );
        
        if (duplicate) {
            alert('❌ Вы уже добавляли этот товар');
            return;
        }

        existingData.push({
            ...userData,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('user_choices', JSON.stringify(existingData));
        showStep(4);

    } catch (error) {
        console.error('Error:', error);
        alert('Ошибка при сохранении данных');
    }
}

// ==================== АДМИНСКАЯ ПАНЕЛЬ ====================

let selectedMarketplace = 'all';
let currentCharts = [];

function showAdminMarketplaceSelect() {
    document.getElementById('app').innerHTML = `
        <div class="admin-panel">
            <h2>📊 Выберите маркетплейс для аналитики</h2>
            <p>Для просмотра статистики выберите маркетплейс</p>
            
            <div class="buttons-grid">
                <button class="btn-admin" onclick="showAdminAnalytics('all')">
                    📈 Все маркетплейсы
                </button>
                <button class="btn-admin" onclick="showAdminAnalytics('Wildberries')">
                    🟣 Wildberries
                </button>
                <button class="btn-admin" onclick="showAdminAnalytics('OZON')">
                    🔵 OZON
                </button>
                <button class="btn-admin" onclick="showAdminAnalytics('Яндекс.Маркет')">
                    🟡 Яндекс.Маркет
                </button>
            </div>
            
            <button onclick="showWelcomeScreen()" class="submit-btn" style="margin-top: 20px;">
                ← Назад в меню
            </button>
        </div>
    `;
}

function showAdminAnalytics(marketplace) {
    selectedMarketplace = marketplace;
    
    document.getElementById('app').innerHTML = `
        <div class="admin-panel">
            <h2>📊 Аналитика ${marketplace === 'all' ? 'всех маркетплейсов' : marketplace}</h2>
            
            <div class="filter-buttons">
                <button class="btn-admin ${marketplace === 'all' ? 'active' : ''}" onclick="showAdminAnalytics('all')">Все</button>
                <button class="btn-admin ${marketplace === 'Wildberries' ? 'active' : ''}" onclick="showAdminAnalytics('Wildberries')">Wildberries</button>
                <button class="btn-admin ${marketplace === 'OZON' ? 'active' : ''}" onclick="showAdminAnalytics('OZON')">OZON</button>
                <button class="btn-admin ${marketplace === 'Яндекс.Маркет' ? 'active' : ''}" onclick="showAdminAnalytics('Яндекс.Маркет')">Яндекс.Маркет</button>
            </div>

            <div class="tabs">
                <div class="tab active" onclick="switchTab('stats')">📊 Статистика</div>
                <div class="tab" onclick="switchTab('charts')">📈 Графики</div>
                <div class="tab" onclick="switchTab('table')">📋 Таблица</div>
            </div>

            <div id="adminStats" class="tab-content active">
                <div class="loading">Загрузка...</div>
            </div>

            <div id="adminCharts" class="tab-content">
                <div class="loading">Загрузка...</div>
            </div>

            <div id="adminTable" class="tab-content">
                <div class="loading">Загрузка...</div>
            </div>
            
            <button onclick="showAdminMarketplaceSelect()" class="submit-btn" style="margin-top: 20px;">
                ← Выбрать другой маркетплейс
            </button>
        </div>
    `;

    loadAdminStats();
    setTimeout(() => {
        loadAdminCharts();
        loadAdminTable();
    }, 100);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.getElementById('admin' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');
    event.target.classList.add('active');
}

function loadAdminStats() {
    try {
        const allData = JSON.parse(localStorage.getItem('user_choices') || '[]');
        const filteredData = selectedMarketplace === 'all' 
            ? allData 
            : allData.filter(item => item.marketplace === selectedMarketplace);

        displayAdminStats(filteredData, allData);
    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById('adminStats').innerHTML = '<p class="error-message">Ошибка загрузки данных</p>';
    }
}

function displayAdminStats(data, allData) {
    const totalUsers = new Set(allData.map(item => item.user_id)).size;
    const filteredUsers = new Set(data.map(item => item.user_id)).size;
    const todayChoices = getTodayChoices(data);
    const avgPerUser = filteredUsers > 0 ? (data.length / filteredUsers).toFixed(1) : 0;

    const statsHTML = `
        <div class="analytics-section">
            <div class="section-title">📈 Ключевые метрики</div>
            <div class="stats-row">
                <div class="stat-card">
                    <div class="stat-number">${data.length}</div>
                    <div class="stat-label">Всего выборов</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${filteredUsers}</div>
                    <div class="stat-label">Уникальных пользователей</div>
                </div>
            </div>
            <div class="stats-row">
                <div class="stat-card">
                    <div class="stat-number">${avgPerUser}</div>
                    <div class="stat-label">Среднее на пользователя</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${todayChoices}</div>
                    <div class="stat-label">Выборов сегодня</div>
                </div>
            </div>
        </div>

        <div class="analytics-section">
            <div class="section-title">🏪 Распределение по маркетплейсам</div>
            <div class="stat-card">
                ${getMarketplaceStats(data)}
            </div>
        </div>

        <div class="analytics-section">
            <div class="section-title">📁 Топ категорий</div>
            <div class="stat-card">
                ${getCategoryStats(data, 8)}
            </div>
        </div>

        <div class="analytics-section">
            <div class="section-title">📦 Популярные товары</div>
            <div class="stat-card">
                ${getProductStats(data, 10)}
            </div>
        </div>
    `;

    document.getElementById('adminStats').innerHTML = statsHTML;
}

function loadAdminCharts() {
    try {
        const allData = JSON.parse(localStorage.getItem('user_choices') || '[]');
        const filteredData = selectedMarketplace === 'all' 
            ? allData 
            : allData.filter(item => item.marketplace === selectedMarketplace);

        currentCharts.forEach(chart => chart.destroy());
        currentCharts = [];

        displayAdminCharts(filteredData);
    } catch (error) {
        console.error('Error loading charts:', error);
        document.getElementById('adminCharts').innerHTML = '<p class="error-message">Ошибка загрузки графиков</p>';
    }
}

function displayAdminCharts(data) {
    const marketplaceStats = getChartData(data, 'marketplace');
    const categoryStats = getChartData(data, 'category').slice(0, 8);
    const hourlyStats = getHourlyStats(data);

    const chartsHTML = `
        <div class="analytics-section">
            <div class="section-title">📊 Распределение по маркетплейсам</div>
            <div class="chart-wrapper">
                <div class="chart-container">
                    <canvas id="marketplaceChart"></canvas>
                </div>
            </div>
        </div>

        <div class="analytics-section">
            <div class="section-title">📁 Топ категорий</div>
            <div class="chart-wrapper">
                <div class="chart-container">
                    <canvas id="categoryChart"></canvas>
                </div>
            </div>
        </div>

        <div class="analytics-section">
            <div class="section-title">🕒 Активность по часам</div>
            <div class="chart-wrapper">
                <div class="chart-container">
                    <canvas id="hourlyChart"></canvas>
                </div>
            </div>
        </div>
    `;

    document.getElementById('adminCharts').innerHTML = chartsHTML;

    setTimeout(() => {
        createPieChart('marketplaceChart', marketplaceStats, 'Маркетплейсы');
        createBarChart('categoryChart', categoryStats, 'Категории');
        createLineChart('hourlyChart', hourlyStats, 'Активность по часам');
    }, 100);
}

function loadAdminTable() {
    try {
        const allData = JSON.parse(localStorage.getItem('user_choices') || '[]');
        const filteredData = selectedMarketplace === 'all' 
            ? allData 
            : allData.filter(item => item.marketplace === selectedMarketplace);

        displayAdminTable(filteredData);
    } catch (error) {
        console.error('Error loading table:', error);
        document.getElementById('adminTable').innerHTML = '<p class="error-message">Ошибка загрузки таблицы</p>';
    }
}

function displayAdminTable(data) {
    const tableHTML = `
        <div class="analytics-section">
            <div class="section-title">📋 Все выборы пользователей</div>
            <p>Всего записей: ${data.length}</p>
            
            <div class="export-section">
                <div class="section-title">📤 Экспорт в Excel</div>
                <p>Скачайте все данные в формате Excel таблицы</p>
                <button class="excel-btn" onclick="exportToExcel()">
                    📊 Скачать Excel файл
                </button>
            </div>
            
            <input type="text" id="tableSearch" placeholder="Поиск по товарам..." class="table-search">
            
            <div style="max-height: 400px; overflow-y: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Маркетплейс</th>
                            <th>Категория</th>
                            <th>Товар</th>
                            <th>Время</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody id="tableBody">
                        ${data.map((item, index) => `
                            <tr>
                                <td>${item.marketplace}</td>
                                <td>${item.category}</td>
                                <td title="${item.product_query}">${item.product_query.length > 20 ? item.product_query.substring(0, 20) + '...' : item.product_query}</td>
                                <td>${new Date(item.timestamp).toLocaleString('ru-RU')}</td>
                                <td>
                                    <button class="delete-btn" onclick="deleteProduct(${index})" title="Удалить">
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('adminTable').innerHTML = tableHTML;

    document.getElementById('tableSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#tableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}

// Функция удаления товара
function deleteProduct(index) {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
        try {
            const allData = JSON.parse(localStorage.getItem('user_choices') || '[]');
            const filteredData = selectedMarketplace === 'all' 
                ? allData 
                : allData.filter(item => item.marketplace === selectedMarketplace);
            
            const itemToDelete = filteredData[index];
            const fullIndex = allData.findIndex(item => 
                item.timestamp === itemToDelete.timestamp && 
                item.product_query === itemToDelete.product_query
            );
            
            if (fullIndex !== -1) {
                allData.splice(fullIndex, 1);
                localStorage.setItem('user_choices', JSON.stringify(allData));
                
                loadAdminStats();
                loadAdminCharts();
                loadAdminTable();
                
                alert('✅ Товар удален');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('❌ Ошибка при удалении товара');
        }
    }
}

// Функция экспорта в Excel (РАБОЧАЯ ВЕРСИЯ)
function exportToExcel() {
    try {
        const allData = JSON.parse(localStorage.getItem('user_choices') || '[]');
        const filteredData = selectedMarketplace === 'all' 
            ? allData 
            : allData.filter(item => item.marketplace === selectedMarketplace);

        // Создаем данные для Excel
        const excelData = [
            // Заголовки
            ['Маркетплейс', 'Категория', 'Товар', 'Дата и время', 'User ID'],
            // Данные
            ...filteredData.map(item => [
                item.marketplace,
                item.category,
                item.product_query,
                new Date(item.timestamp).toLocaleString('ru-RU'),
                item.user_id
            ])
        ];

        // Создаем рабочую книгу
        const wb = XLSX.utils.book_new();
        
        // Создаем рабочий лист из данных
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        
        // Настраиваем ширину колонок
        ws['!cols'] = [
            { wch: 15 }, // Маркетплейс
            { wch: 25 }, // Категория
            { wch: 40 }, // Товар
            { wch: 20 }, // Дата и время
            { wch: 15 }  // User ID
        ];

        // Добавляем рабочий лист в книгу
        XLSX.utils.book_append_sheet(wb, ws, 'Данные');

        // Генерируем имя файла
        const fileName = `analytics_${selectedMarketplace}_${new Date().toISOString().split('T')[0]}.xlsx`;

        // Сохраняем файл
        XLSX.writeFile(wb, fileName);

    } catch (error) {
        console.error('Error exporting to Excel:', error);
        alert('❌ Ошибка при экспорте в Excel: ' + error.message);
    }
}

// Вспомогательные функции для графиков
function getChartData(data, field) {
    const stats = {};
    data.forEach(item => {
        stats[item[field]] = (stats[item[field]] || 0) + 1;
    });
    
    return Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));
}

function getHourlyStats(data) {
    const hours = Array.from({length: 24}, (_, i) => i);
    const stats = hours.reduce((acc, hour) => {
        acc[hour] = 0;
        return acc;
    }, {});
    
    data.forEach(item => {
        const hour = new Date(item.timestamp).getHours();
        stats[hour]++;
    });
    
    return hours.map(hour => ({
        name: `${hour}:00`,
        count: stats[hour]
    }));
}

function createPieChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                data: data.map(item => item.count),
                backgroundColor: [
                    '#667eea', '#764ba2', '#f093fb', '#f5576c',
                    '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
                    '#fa709a', '#fee140', '#a8edea', '#fed6e3'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    currentCharts.push(chart);
}

function createBarChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                label: 'Количество',
                data: data.map(item => item.count),
                backgroundColor: '#667eea',
                borderColor: '#764ba2',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    currentCharts.push(chart);
}

function createLineChart(canvasId, data, title) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(item => item.name),
            datasets: [{
                label: 'Активность',
                data: data.map(item => item.count),
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    currentCharts.push(chart);
}

function getMarketplaceStats(data) {
    const stats = {};
    data.forEach(item => {
        stats[item.marketplace] = (stats[item.marketplace] || 0) + 1;
    });
    
    return Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => `
            <div class="stat-item">
                <span>${name}</span>
                <span class="count">${count}</span>
            </div>
        `).join('');
}

function getCategoryStats(data, limit = 5) {
    const stats = {};
    data.forEach(item => {
        stats[item.category] = (stats[item.category] || 0) + 1;
    });
    
    return Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, count]) => `
            <div class="stat-item">
                <span>${name}</span>
                <span class="count">${count}</span>
            </div>
        `).join('');
}

function getProductStats(data, limit = 8) {
    const stats = {};
    data.forEach(item => {
        stats[item.product_query] = (stats[item.product_query] || 0) + 1;
    });
    
    return Object.entries(stats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, count]) => `
            <div class="stat-item">
                <span title="${name}">${name.length > 25 ? name.substring(0, 25) + '...' : name}</span>
                <span class="count">${count}</span>
            </div>
        `).join('');
}

function getTodayChoices(data) {
    const today = new Date().toDateString();
    return data.filter(item => new Date(item.timestamp).toDateString() === today).length;
}

