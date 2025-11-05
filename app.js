// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Правильные категории с подкатегориями
const CATEGORIES = {
    "📱 ЭЛЕКТРОНИКА": [
        "iphone", "samsung", "xiaomi", "телефон", "смартфон", "android", "ios",
        "ноутбук", "macbook", "asus", "lenovo", "планшет", "ipad", "airpods",
        "наушники", "колонка", "часы", "apple watch", "монитор", "клавиатура", "мышь",
        "компьютер", "процессор", "видеокарта", "оперативная", "память", "ssd", "hdd",
        "телевизор", "аудио", "колонки", "наушники", "фотоаппарат", "камера", "объектив",
        "playstation", "xbox", "nintendo", "приставка", "контроллер", "джойстик",
        "умный дом", "робот", "пылесос", "лампа", "розетка", "датчик",
        "гироскутер", "самокат", "электросамокат", "моноколесо", "электротранспорт"
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
        "спортивный", "костюм", "леггинсы", "футболка", "белье", "трусы", "бюстгальтер"
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
        "лежанка", "домик", "переноска", "клетка", "аквариум", "террариум", "фильтр",
        "наполнитель", "лоток", "туалет", "шампунь", "расческа", "щетка", "когтерез",
        "переноска", "миска", "поилка", "автопоилка", "одежда", "комбинезон", "попона"
    ],
    
    "🍎 ПРОДУКТЫ ПИТАНИЯ": [
        "бакалея", "крупа", "гречка", "рис", "макароны", "мука", "сахар", "соль",
        "масло", "подсолнечное", "оливковое", "молоко", "кефир", "сметана", "творог",
        "сыр", "йогурт", "мясо", "говядина", "свинина", "курица", "индейка", "колбаса",
        "сосиски", "рыба", "лосось", "селедка", "икра", "морепродукты", "креветки",
        "овощи", "фрукты", "яблоки", "апельсины", "бананы", "помидоры", "огурцы",
        "сок", "вода", "газировка", "лимонад", "чай", "кофе", "какао", "печенье",
        "конфеты", "шоколад", "торт", "пирожное", "мороженое", "замороженные", "полуфабрикаты"
    ],
    
    "🎁 ДРУГОЕ": []
};

class ProductManager {
    constructor() {
        this.products = this.loadProducts();
        this.categoryChart = null;
        this.priceChart = null;
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
        
        for (const [category, keywords] of Object.entries(CATEGORIES)) {
            if (keywords.some(keyword => name.includes(keyword.toLowerCase()))) {
                return category;
            }
        }
        
        return '🎁 ДРУГОЕ';
    }

    // Обновление предпросмотра категории
    updateCategoryPreview(productName) {
        const categorySelect = document.getElementById('productCategory');
        const autoDetection = document.getElementById('autoDetectionPreview');
        
        if (productName.trim() === '') {
            if (autoDetection) autoDetection.remove();
            return;
        }
        
        const detectedCategory = this.detectCategory(productName);
        
        if (!autoDetection) {
            const preview = document.createElement('div');
            preview.id = 'autoDetectionPreview';
            preview.style.fontSize = '12px';
            preview.style.color = '#666';
            preview.style.marginTop = '4px';
            preview.style.padding = '4px 8px';
            preview.style.background = '#f0f8ff';
            preview.style.borderRadius = '4px';
            categorySelect.parentNode.appendChild(preview);
        }
        
        document.getElementById('autoDetectionPreview').textContent = 
            `Автоопределение: ${detectedCategory}`;
        
        // Если выбран авторежим, обновляем значение
        if (categorySelect.value === 'auto') {
            categorySelect.setAttribute('data-auto-category', detectedCategory);
        }
    }

    addProduct() {
        const name = document.getElementById('productName').value.trim();
        const price = parseInt(document.getElementById('productPrice').value);
        const categorySelect = document.getElementById('productCategory');
        let category = categorySelect.value;
        
        if (!name || !price) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        // Если выбран авторежим, используем автоопределенную категорию
        if (category === 'auto') {
            category = categorySelect.getAttribute('data-auto-category') || this.detectCategory(name);
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
        successMessage.textContent = `✅ Товар "${name}" добавлен в категорию ${category}`;
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
            container.innerHTML = '<p style="text-align: center; color: #666;">Товаров пока нет</p>';
            return;
        }

        container.innerHTML = recentProducts.map(product => `
            <div class="product-item">
                <div class="product-name">${product.name}</div>
                <div class="product-meta">
                    <span>${product.price}₽</span>
                    <span>${new Date(product.date).toLocaleDateString()}</span>
                </div>
                <div class="category-tag">${product.category}</div>
                <button onclick="productManager.deleteProduct(${product.id})" 
                        style="margin-top: 8px; background: #ff4757; color: white; border: none; padding: 4px 8px; border-radius: 6px; font-size: 12px; cursor: pointer;">
                    Удалить
                </button>
            </div>
        `).join('');
    }

    updateAnalytics() {
        // Обновляем статистику
        document.getElementById('totalProducts').textContent = this.products.length;
        
        const totalValue = this.products.reduce((sum, product) => sum + product.price, 0);
        document.getElementById('totalValue').textContent = `${totalValue.toLocaleString()}₽`;

        const avgPrice = this.products.length > 0 ? Math.round(totalValue / this.products.length) : 0;
        document.getElementById('avgPrice').textContent = `${avgPrice.toLocaleString()}₽`;

        // Находим популярную категорию
        const categoryCount = {};
        this.products.forEach(product => {
            categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
        });
        
        const topCategory = Object.keys(categoryCount).reduce((a, b) => 
            categoryCount[a] > categoryCount[b] ? a : b, 'Нет данных'
        );
        document.getElementById('topCategory').textContent = topCategory;

        // Строим графики
        this.renderCategoryChart();
        this.renderPriceChart();
    }

    renderCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        // Группируем по категориям
        const categoryData = {};
        this.products.forEach(product => {
            categoryData[product.category] = (categoryData[product.category] || 0) + 1;
        });

        // Удаляем старый график если существует
        if (this.categoryChart) {
            this.categoryChart.destroy();
        }

        if (Object.keys(categoryData).length === 0) {
            ctx.fillText('Нет данных для отображения', 100, 100);
            return;
        }

        this.categoryChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: {
                                size: 10
                            }
                        }
                    }
                }
            }
        });
    }

    renderPriceChart() {
        const ctx = document.getElementById('priceChart').getContext('2d');
        
        // Сортируем по дате и берем последние 10 товаров
        const sortedProducts = [...this.products]
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(-10);

        // Удаляем старый график если существует
        if (this.priceChart) {
            this.priceChart.destroy();
        }

        if (sortedProducts.length === 0) {
            ctx.fillText('Нет данных для отображения', 100, 100);
            return;
        }

        this.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedProducts.map(p => 
                    new Date(p.date).toLocaleDateString()
                ),
                datasets: [{
                    label: 'Цена товаров',
                    data: sortedProducts.map(p => p.price),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
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
                `"${new Date(product.date).toLocaleDateString()}"`,
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
    const autoDetection = document.getElementById('autoDetectionPreview');
    if (autoDetection) autoDetection.remove();
}

function showAnalyticsScreen() {
    document.getElementById('mainScreen').classList.add('hidden');
    document.getElementById('addProductScreen').classList.add('hidden');
    document.getElementById('analyticsScreen').classList.remove('hidden');
    
    productManager.updateAnalytics();
}

function exportToCSV() {
    productManager.exportToCSV();
}

function clearAllData() {
    productManager.clearAllData();
}

// Инициализация приложения
const productManager = new ProductManager();
