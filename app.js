// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// Система категорий с ключевыми словами
const CATEGORIES = {
    '📱 Электроника': [
        'iphone', 'samsung', 'xiaomi', 'телефон', 'смартфон', 'android', 'ios',
        'ноутбук', 'macbook', 'asus', 'lenovo', 'планшет', 'ipad', 'airpods',
        'наушники', 'колонка', 'часы', 'apple watch', 'монитор', 'клавиатура', 'мышь'
    ],
    '👕 Одежда': [
        'футболка', 'кофта', 'худи', 'свитер', 'куртка', 'пальто', 'джинсы',
        'брюки', 'шорты', 'платье', 'юбка', 'рубашка', 'блузка', 'кроссовки',
        'туфли', 'ботинки', 'кеды', 'кепка', 'шапка', 'перчатки'
    ],
    '🏠 Дом и сад': [
        'стол', 'стул', 'кровать', 'диван', 'шкаф', 'полка', 'лампа',
        'ковер', 'шторы', 'посуда', 'кастрюля', 'сковорода', 'чайник',
        'микроволновка', 'холодильник', 'пылесос', 'утюг', 'фен'
    ],
    '🎮 Развлечения': [
        'игра', 'приставка', 'playstation', 'xbox', 'nintendo', 'контроллер',
        'диск', 'книга', 'фильм', 'музыка', 'гитара', 'фортепиано', 'скейт',
        'велосипед', 'мяч', 'конструктор', 'пазл'
    ],
    '💄 Красота': [
        'крем', 'шампунь', 'гель', 'духи', 'тушь', 'помада', 'тени',
        'пудра', 'лосьон', 'дезодорант', 'бритва', 'зеркало', 'расческа'
    ],
    '🍎 Продукты': [
        'кофе', 'чай', 'сок', 'вода', 'шоколад', 'печенье', 'хлеб',
        'молоко', 'сыр', 'колбаса', 'мясо', 'рыба', 'фрукты', 'овощи'
    ],
    '📚 Книги': [
        'книга', 'учебник', 'роман', 'детектив', 'фантастика', 'журнал',
        'комикс', 'словарь', 'энциклопедия'
    ],
    '🎁 Другое': []
};

class ProductManager {
    constructor() {
        this.products = this.loadProducts();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showMainScreen();
        this.updateRecentProducts();
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
            if (keywords.some(keyword => name.includes(keyword))) {
                return category;
            }
        }
        
        return '🎁 Другое';
    }

    addProduct() {
        const name = document.getElementById('productName').value.trim();
        const price = parseInt(document.getElementById('productPrice').value);
        
        if (!name || !price) {
            alert('Пожалуйста, заполните все поля');
            return;
        }

        const category = this.detectCategory(name);
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
        successMessage.textContent = `Товар "${name}" добавлен в категорию ${category}`;
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
        const stored = localStorage.getItem('products');
        return stored ? JSON.parse(stored) : [];
    }

    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
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
        document.getElementById('totalValue').textContent = `${totalValue}₽`;

        // Строим график категорий
        this.renderCategoryChart();
        
        // Строим график цен
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

        this.categoryChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryData),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
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

// Инициализация приложения
const productManager = new ProductManager();
