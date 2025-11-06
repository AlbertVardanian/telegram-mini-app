// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Категории и подкатегории (только для классификации)
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
        "Автоаксесссуары",
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
    ],
    
    "🎁 ДРУГОЕ": []
};

// Ключевые слова для автоматического определения категорий
const CATEGORY_KEYWORDS = {
    "📱 ЭЛЕКТРОНИКА": [
        "iphone", "samsung", "xiaomi", "телефон", "смартфон", "android", "ios",
        "ноутбук", "macbook", "asus", "lenovo", "планшет", "ipad", "airpods",
        "наушники", "колонка", "часы", "apple watch", "монитор", "клавиатура", "мышь",
        "компьютер", "процессор", "видеокарта", "оперативная", "память", "ssd", "hdd",
        "телевизор", "аудио", "колонки", "фотоаппарат", "камера", "объектив",
        "playstation", "xbox", "nintendo", "приставка", "контроллер", "джойстик",
        "умный дом", "робот", "пылесос", "лампа", "розетка", "датчик",
        "гироскутер", "самокат", "электросамокат", "моноколесо"
    ],
    
    "🏠 БЫТОВАЯ ТЕХНИКА": [
        "холодильник", "стиральная", "машина", "посудомоечная", "плита", "духовка",
        "микроволновка", "кофемашина", "чайник", "блендер", "миксер", "соковыжималка",
        "тостер", "мультиварка", "сковорода", "гриль", "мясорубка", "кухонный", "комбайн",
        "кондиционер", "обогреватель", "вентилятор", "увлажнитель", "очиститель",
        "пылесос", "пароочиститель", "утюг", "отпариватель", "швейная", "машинка",
        "фен", "щипцы", "выпрямитель", "массажер", "эпилятор", "бритва", "триммер"
    ],
    
    "👕 ОДЕЖДА И ОБУВЬ": [
        "футболка", "рубашка", "кофта", "худи", "свитер", "куртка", "пальто", "джинсы",
        "брюки", "шорты", "платье", "юбка", "блузка", "пиджак", "жилет", "костюм",
        "кроссовки", "туфли", "ботинки", "кеды", "сапоги", "сандали", "тапочки",
        "кепка", "шапка", "шарф", "перчатки", "ремень", "галстук", "платок",
        "спортивный", "костюм", "леггинсы", "белье", "трусы", "бюстгальтер"
    ],
    
    "💄 КРАСОТА И ЗДОРОВЬЕ": [
        "крем", "шампунь", "гель", "духи", "тушь", "помада", "тени", "пудра",
        "лосьон", "дезодорант", "бритва", "зеркало", "расческа", "лак", "гель",
        "мыло", "косметика", "макияж", "парфюм", "сыворотка", "тоник", "скраб",
        "маска", "бритье", "уход", "кожа", "волосы", "витамины", "бад", "медицинский",
        "тонометр", "глюкометр", "бинт", "пластырь", "термометр"
    ],
    
    "🎮 ИГРУШКИ И ХОББИ": [
        "игрушка", "кукла", "машинка", "конструктор", "лего", "пазл", "настольная",
        "игра", "монополия", "шахматы", "шашки", "творчество", "рукоделие", "вышивание",
        "вязание", "рисование", "краски", "кисти", "коллекция", "модель", "радиоуправляемый",
        "гитара", "фортепиано", "синтезатор", "скрипка", "барабан", "музыкальный"
    ],
    
    "🛋 ДОМ И САД": [
        "стол", "стул", "кровать", "диван", "шкаф", "полка", "комод", "тумба",
        "кресло", "мебель", "текстиль", "шторы", "ковер", "покрывало", "подушка",
        "одеяло", "постельное", "белье", "декор", "ваза", "картина", "зеркало",
        "лампа", "светильник", "люстра", "посуда", "тарелка", "чашка", "стакан",
        "кастрюля", "сковорода", "нож", "вилка", "ложка", "садовый", "инструмент",
        "лопата", "грабли", "секатор", "газонокосилка", "горшок", "растение", "цветок"
    ],
    
    "👶 ДЕТСКИЕ ТОВАРЫ": [
        "подгузник", "памперс", "соска", "пустышка", "бутылочка", "питание", "молочная",
        "смесь", "пюре", "каша", "кроватка", "коляска", "манеж", "шезлонг", "ходунки",
        "прыгунки", "рюкзак", "пенал", "тетрадь", "учебник", "ранец", "школьный",
        "велосипед", "самокат", "ролики", "коньки", "кормление", "столик", "стульчик",
        "гигиена", "шампунь", "крем", "присыпка", "безопасность", "защита", "ворота"
    ],
    
    "🏃 СПОРТ И ОТДЫХ": [
        "тренажер", "беговая", "дорожка", "велотренажер", "гантели", "штанга", "гиря",
        "эспандер", "фитнес", "йога", "коврик", "мяч", "футбольный", "баскетбольный",
        "волейбольный", "теннис", "ракетка", "клюшка", "коньки", "лыжи", "сноуборд",
        "велосипед", "шлем", "защита", "палатка", "спальник", "рюкзак", "термос",
        "туризм", "кемпинг", "рыбалка", "удочка", "катушка", "леска", "крючок",
        "спортивный", "костюм", "форма", "обувь", "кроссовки", "кеды"
    ],
    
    "🚗 АВТОТОВАРЫ": [
        "авто", "машина", "запчасть", "двигатель", "аккумулятор", "шины", "диски",
        "колесо", "масло", "фильтр", "тормоз", "колодки", "амортизатор", "свеча",
        "магнитола", "колонки", "навигатор", "регистратор", "антирадар", "чехол",
        "коврик", "ароматизатор", "подлокотник", "зеркало", "щетки", "омыватель",
        "воск", "полироль", "шампунь", "инструмент", "домкрат", "ключ", "компрессор"
    ],
    
    "📚 КНИГИ И КАНЦТОВАРЫ": [
        "книга", "учебник", "роман", "детектив", "фантастика", "журнал", "комикс",
        "словарь", "энциклопедия", "пособие", "художественная", "блокнот", "тетрадь",
        "альбом", "дневник", "ручка", "карандаш", "маркер", "фломастер", "ластик",
        "точилка", "линейка", "циркуль", "пенал", "папка", "файл", "скотч", "клей",
        "степлер", "дырокол", "календарь", "ежедневник", "бумага", "картон", "краски"
    ],
    
    "🐾 ЗООТОВАРЫ": [
        "корм", "сухой", "влажный", "консервы", "лакомство", "витамины", "добавки",
        "ошейник", "поводок", "шлейка", "игрушка", "мяч", "косточка", "когтеточка",
        "лежанка", "домик", "перноска", "клетка", "аквариум", "террариум", "фильтр",
        "наполнитель", "лоток", "туалет", "шампунь", "расческа", "щетка", "когтерез",
        "миска", "поилка", "автопоилка", "одежда", "комбинезон", "попона"
    ],
    
    "🍎 ПРОДУКТЫ ПИТАНИЯ": [
        "бакалея", "крупа", "гречка", "рис", "макароны", "мука", "сахар", "соль",
        "масло", "подсолнечное", "оливковое", "молоко", "кефир", "сметана", "творог",
        "сыр", "йогурт", "мясо", "говядина", "свинина", "курица", "индейка", "колбаса",
        "сосиски", "рыба", "лосось", "селедка", "икра", "морепродукты", "креветки",
        "овощи", "фрукты", "яблоки", "апельсины", "бананы", "помидоры", "огурцы",
        "сок", "вода", "газировка", "лимонад", "чай", "кофе", "какао", "печенье",
        "конфеты", "шоколад", "торт", "пирожное", "мороженое", "замороженные", "полуфабрикаты"
    ]
};

class ProductManager {
    constructor() {
        this.products = this.loadProducts();
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showMainScreen();
        this.updateRecentProducts();
        
        // Автоопределение категории при вводе названия
        document.getElementById('productName').addEventListener('input', (e) => {
            this.updateCategoryPreview(e.target.value);
        });

        // Обновление предпросмотра при изменении категории
        document.getElementById('productCategory').addEventListener('change', (e) => {
            this.updateCategoryPreview(document.getElementById('productName').value);
        });
    }

    setupEventListeners() {
        document.getElementById('addProductForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });
    }

    // Автоматическое определение категории по названию
    detectCategory(productName) {
        const name = productName.toLowerCase();
        
        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(keyword => name.includes(keyword.toLowerCase()))) {
                return category;
            }
        }
        
        return '🎁 ДРУГОЕ';
    }

    // Обновление предпросмотра категории
    updateCategoryPreview(productName) {
        const categorySelect = document.getElementById('productCategory');
        const preview = document.getElementById('autoDetectionPreview');
        const detectedCategorySpan = document.getElementById('detectedCategory');
        
        if (productName.trim() === '') {
            preview.classList.add('hidden');
            return;
        }
        
        const detectedCategory = this.detectCategory(productName);
        detectedCategorySpan.textContent = detectedCategory;
        
        if (categorySelect.value === 'auto') {
            preview.classList.remove('hidden');
        } else {
            preview.classList.add('hidden');
        }
    }

    addProduct() {
        const name = document.getElementById('productName').value.trim();
        const price = parseInt(document.getElementById('productPrice').value);
        const categorySelect = document.getElementById('productCategory');
        let category = categorySelect.value;
        
        if (!name || !price || price <= 0) {
            alert('Пожалуйста, заполните все поля корректно');
            return;
        }

        // Если выбран авторежим, используем автоопределенную категорию
        if (category === 'auto') {
            category = this.detectCategory(name);
        }

        const product = {
            id: Date.now(),
            name,
            price,
            category,
            date: new Date().toISOString(),
            marketplace: 'auto'
        };

        this.products.push(product);
        this.saveProducts();
        
        // Показываем сообщение об успехе
        const successMessage = document.getElementById('successMessage');
        const successText = document.getElementById('successText');
        successText.textContent = `Товар "${name}" добавлен в категорию ${category}`;
        successMessage.classList.remove('hidden');
        
        // Очищаем форму
        document.getElementById('addProductForm').reset();
        
        // Обновляем список товаров
        this.updateRecentProducts();
        
        // Скрываем сообщение через 3 секунды
        setTimeout(() => {
            successMessage.classList.add('hidden');
        }, 3000);
    }

    deleteProduct(productId) {
        if (confirm('Удалить этот товар?')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts();
            this.updateRecentProducts();
            this.updateAnalytics();
        }
    }

    deleteProductFromTable(productId) {
        if (confirm('Удалить этот товар?')) {
            this.products = this.products.filter(p => p.id !== productId);
            this.saveProducts();
            this.updateRecentProducts();
            this.updateAnalytics();
        }
    }

    loadProducts() {
        try {
            const stored = localStorage.getItem('products');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            return [];
        }
    }

    saveProducts() {
        try {
            localStorage.setItem('products', JSON.stringify(this.products));
            console.log('Данные сохранены:', this.products);
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
        }
    }

    updateRecentProducts() {
        const container = document.getElementById('recentProducts');
        const recentProducts = this.products.slice(-5).reverse();
        
        if (recentProducts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>Товаров пока нет</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recentProducts.map(product => `
            <div class="product-item">
                <div class="product-name">${product.name}</div>
                <div class="product-meta">
                    <span>${new Date(product.date).toLocaleDateString('ru-RU')}</span>
                    <span class="product-price">${product.price.toLocaleString()}₽</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                    <div class="category-tag">
                        <i class="fas fa-tag"></i>
                        ${product.category}
                    </div>
                    <button class="action-btn delete" onclick="productManager.deleteProduct(${product.id})">
                        <i class="fas fa-trash"></i>
                        Удалить
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateAnalytics() {
        this.updateStats();
        this.renderCharts();
        this.updateTables();
    }

    updateStats() {
        // Обновляем статистику
        const totalProducts = this.products.length;
        document.getElementById('totalProducts').textContent = totalProducts;
        
        const totalValue = this.products.reduce((sum, product) => sum + product.price, 0);
        document.getElementById('totalValue').textContent = `${totalValue.toLocaleString()}₽`;

        const avgPrice = totalProducts > 0 ? Math.round(totalValue / totalProducts) : 0;
        document.getElementById('avgPrice').textContent = `${avgPrice.toLocaleString()}₽`;

        // Находим популярную категорию
        const categoryCount = {};
        this.products.forEach(product => {
            categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
        });
        
        const topCategory = Object.keys(categoryCount).length > 0 
            ? Object.keys(categoryCount).reduce((a, b) => 
                categoryCount[a] > categoryCount[b] ? a : b)
            : 'Нет данных';
        document.getElementById('topCategory').textContent = topCategory;
    }

    renderCharts() {
        this.renderCategoryChart();
        this.renderTimelineChart();
        this.renderCategoryBarChart();
        this.renderPriceByCategoryChart();
        this.renderPriceDistributionChart();
        this.renderMonthlyTrendChart();
    }

    renderCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        // Группируем по категориям
        const categoryData = {};
        this.products.forEach(product => {
            categoryData[product.category] = (categoryData[product.category] || 0) + 1;
        });

        // Удаляем старый график если существует
        if (this.charts.categoryChart) {
            this.charts.categoryChart.destroy();
        }

        if (Object.keys(categoryData).length === 0) {
            this.showNoDataMessage('categoryChart');
            return;
        }

        this.charts.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#6366F1', '#8B5CF6', '#EC4899', '#F59E0B',
                        '#10B981', '#EF4444', '#3B82F6', '#F97316',
                        '#06B6D4', '#84CC16', '#F43F5E', '#8B5CF6'
                    ],
                    borderWidth: 2,
                    borderColor: '#FFFFFF'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 11,
                                family: 'Segoe UI'
                            },
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    renderTimelineChart() {
        const ctx = document.getElementById('timelineChart').getContext('2d');
        
        // Группируем по датам
        const timelineData = {};
        this.products.forEach(product => {
            const date = new Date(product.date).toLocaleDateString('ru-RU');
            timelineData[date] = (timelineData[date] || 0) + 1;
        });

        const dates = Object.keys(timelineData).sort();
        const counts = dates.map(date => timelineData[date]);

        if (this.charts.timelineChart) {
            this.charts.timelineChart.destroy();
        }

        if (dates.length === 0) {
            this.showNoDataMessage('timelineChart');
            return;
        }

        this.charts.timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: 'Количество товаров',
                    data: counts,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    renderCategoryBarChart() {
        const ctx = document.getElementById('categoryBarChart').getContext('2d');
        
        const categoryStats = {};
        this.products.forEach(product => {
            if (!categoryStats[product.category]) {
                categoryStats[product.category] = { count: 0, total: 0 };
            }
            categoryStats[product.category].count++;
            categoryStats[product.category].total += product.price;
        });

        const categories = Object.keys(categoryStats);
        const counts = categories.map(cat => categoryStats[cat].count);

        if (this.charts.categoryBarChart) {
            this.charts.categoryBarChart.destroy();
        }

        if (categories.length === 0) {
            this.showNoDataMessage('categoryBarChart');
            return;
        }

        this.charts.categoryBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Количество товаров',
                    data: counts,
                    backgroundColor: '#6366F1',
                    borderColor: '#4F46E5',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderPriceByCategoryChart() {
        const ctx = document.getElementById('priceByCategoryChart').getContext('2d');
        
        const categoryStats = {};
        this.products.forEach(product => {
            if (!categoryStats[product.category]) {
                categoryStats[product.category] = { count: 0, total: 0 };
            }
            categoryStats[product.category].count++;
            categoryStats[product.category].total += product.price;
        });

        const categories = Object.keys(categoryStats);
        const avgPrices = categories.map(cat => 
            Math.round(categoryStats[cat].total / categoryStats[cat].count)
        );

        if (this.charts.priceByCategoryChart) {
            this.charts.priceByCategoryChart.destroy();
        }

        if (categories.length === 0) {
            this.showNoDataMessage('priceByCategoryChart');
            return;
        }

        this.charts.priceByCategoryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories,
                datasets: [{
                    label: 'Средняя цена',
                    data: avgPrices,
                    backgroundColor: '#F59E0B',
                    borderColor: '#D97706',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    renderPriceDistributionChart() {
        const ctx = document.getElementById('priceDistributionChart').getContext('2d');
        
        const prices = this.products.map(p => p.price).sort((a, b) => a - b);
        const priceRanges = {
            '0-1000': 0,
            '1001-5000': 0,
            '5001-10000': 0,
            '10001-50000': 0,
            '50001+': 0
        };

        prices.forEach(price => {
            if (price <= 1000) priceRanges['0-1000']++;
            else if (price <= 5000) priceRanges['1001-5000']++;
            else if (price <= 10000) priceRanges['5001-10000']++;
            else if (price <= 50000) priceRanges['10001-50000']++;
            else priceRanges['50001+']++;
        });

        if (this.charts.priceDistributionChart) {
            this.charts.priceDistributionChart.destroy();
        }

        if (prices.length === 0) {
            this.showNoDataMessage('priceDistributionChart');
            return;
        }

        this.charts.priceDistributionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(priceRanges),
                datasets: [{
                    data: Object.values(priceRanges),
                    backgroundColor: [
                        '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    renderMonthlyTrendChart() {
        const ctx = document.getElementById('monthlyTrendChart').getContext('2d');
        
        const monthlyData = {};
        this.products.forEach(product => {
            const date = new Date(product.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { count: 0, total: 0 };
            }
            monthlyData[monthKey].count++;
            monthlyData[monthKey].total += product.price;
        });

        const months = Object.keys(monthlyData).sort();
        const avgPrices = months.map(month => 
            Math.round(monthlyData[month].total / monthlyData[month].count)
        );

        if (this.charts.monthlyTrendChart) {
            this.charts.monthlyTrendChart.destroy();
        }

        if (months.length === 0) {
            this.showNoDataMessage('monthlyTrendChart');
            return;
        }

        this.charts.monthlyTrendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Средняя цена по месяцам',
                    data: avgPrices,
                    borderColor: '#EC4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    showNoDataMessage(canvasId) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        ctx.font = '16px Segoe UI';
        ctx.fillStyle = '#64748B';
        ctx.textAlign = 'center';
        ctx.fillText('Нет данных для отображения', 210, 110);
    }

    updateTables() {
        this.updateTopProductsTable();
        this.updateCategoriesTable();
        this.updatePriceRangesTable();
        this.updateAllProductsTable();
    }

    updateTopProductsTable() {
        const table = document.getElementById('topProductsTable').querySelector('tbody');
        const topProducts = [...this.products]
            .sort((a, b) => b.price - a.price)
            .slice(0, 5);

        if (topProducts.length === 0) {
            table.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748B;">Нет данных</td></tr>';
            return;
        }

        table.innerHTML = topProducts.map(product => `
            <tr>
                <td>${product.name}</td>
                <td class="number">${product.price.toLocaleString()}₽</td>
                <td>${product.category}</td>
                <td>
                    <button class="delete-btn" onclick="productManager.deleteProductFromTable(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    updateCategoriesTable() {
        const table = document.getElementById('categoriesTable').querySelector('tbody');
        const categoryStats = {};
        
        this.products.forEach(product => {
            if (!categoryStats[product.category]) {
                categoryStats[product.category] = { count: 0, total: 0 };
            }
            categoryStats[product.category].count++;
            categoryStats[product.category].total += product.price;
        });

        const categories = Object.keys(categoryStats);

        if (categories.length === 0) {
            table.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #64748B;">Нет данных</td></tr>';
            return;
        }

        table.innerHTML = categories.map(category => {
            const stats = categoryStats[category];
            const avgPrice = Math.round(stats.total / stats.count);
            return `
                <tr>
                    <td>${category}</td>
                    <td class="number">${stats.count}</td>
                    <td class="number">${stats.total.toLocaleString()}₽</td>
                    <td class="number">${avgPrice.toLocaleString()}₽</td>
                </tr>
            `;
        }).join('');
    }

    updatePriceRangesTable() {
        const table = document.getElementById('priceRangesTable').querySelector('tbody');
        const totalValue = this.products.reduce((sum, p) => sum + p.price, 0);
        
        const priceRanges = {
            '0-1,000₽': { min: 0, max: 1000, count: 0, total: 0 },
            '1,001-5,000₽': { min: 1001, max: 5000, count: 0, total: 0 },
            '5,001-10,000₽': { min: 5001, max: 10000, count: 0, total: 0 },
            '10,001-50,000₽': { min: 10001, max: 50000, count: 0, total: 0 },
            '50,001+₽': { min: 50001, max: Infinity, count: 0, total: 0 }
        };

        this.products.forEach(product => {
            for (const [range, data] of Object.entries(priceRanges)) {
                if (product.price >= data.min && product.price <= data.max) {
                    data.count++;
                    data.total += product.price;
                    break;
                }
            }
        });

        if (this.products.length === 0) {
            table.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #64748B;">Нет данных</td></tr>';
            return;
        }

        table.innerHTML = Object.entries(priceRanges).map(([range, data]) => {
            const percentage = totalValue > 0 ? ((data.total / totalValue) * 100).toFixed(1) : 0;
            return `
                <tr>
                    <td>${range}</td>
                    <td class="number">${data.count}</td>
                    <td class="number">${percentage}%</td>
                </tr>
            `;
        }).join('');
    }

    updateAllProductsTable() {
        const table = document.getElementById('allProductsTable').querySelector('tbody');
        const sortedProducts = [...this.products].sort((a, b) => new Date(b.date) - new Date(a.date));

        if (sortedProducts.length === 0) {
            table.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748B;">Нет данных</td></tr>';
            return;
        }

        table.innerHTML = sortedProducts.map(product => `
            <tr>
                <td>${product.name}</td>
                <td class="number">${product.price.toLocaleString()}₽</td>
                <td>${product.category}</td>
                <td>${new Date(product.date).toLocaleDateString('ru-RU')}</td>
                <td>
                    <button class="delete-btn" onclick="productManager.deleteProductFromTable(${product.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    exportToCSV() {
        if (this.products.length === 0) {
            alert('Нет данных для экспорта');
            return;
        }

        const headers = ['Название', 'Цена', 'Категория', 'Дата', 'Маркетплейс'];
        const csvData = [
            headers.join(','),
            ...this.products.map(product => [
                `"${product.name}"`,
                product.price,
                `"${product.category}"`,
                `"${new Date(product.date).toLocaleDateString('ru-RU')}"`,
                `"${product.marketplace}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    clearAllData() {
        if (confirm('Вы уверены что хотите удалить ВСЕ данные? Это действие нельзя отменить.')) {
            localStorage.removeItem('products');
            this.products = [];
            this.updateRecentProducts();
            this.updateAnalytics();
            alert('Все данные удалены');
        }
    }
}

// Функции навигации
function showMainScreen() {
    document.getElementById('mainScreen').classList.remove('hidden');
    document.getElementById('addProductScreen').classList.add('hidden');
    document.getElementById('analyticsScreen').classList.add('hidden');
    productManager.updateRecentProducts();
}

function showAddProductScreen() {
    document.getElementById('mainScreen').classList.add('hidden');
    document.getElementById('addProductScreen').classList.remove('hidden');
    document.getElementById('analyticsScreen').classList.add('hidden');
    
    // Скрываем сообщение об успехе при переходе
    document.getElementById('successMessage').classList.add('hidden');
    
    // Сбрасываем форму
    document.getElementById('addProductForm').reset();
    
    // Очищаем предпросмотр категории
    document.getElementById('autoDetectionPreview').classList.add('hidden');
}

function showAnalyticsScreen() {
    document.getElementById('mainScreen').classList.add('hidden');
    document.getElementById('addProductScreen').classList.add('hidden');
    document.getElementById('analyticsScreen').classList.remove('hidden');
    
    productManager.updateAnalytics();
}

function switchTab(tabName) {
    // Убираем активный класс со всех вкладок и контента
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Добавляем активный класс выбранной вкладке и контенту
    document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

function exportToCSV() {
    productManager.exportToCSV();
}

function clearAllData() {
    productManager.clearAllData();
}

// Инициализация приложения
const productManager = new ProductManager();
