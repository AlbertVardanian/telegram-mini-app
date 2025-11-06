// Конфигурация категорий
const CATEGORY_KEYWORDS = {
    "📱 ЭЛЕКТРОНИКА": [
        "iphone", "samsung", "xiaomi", "телефон", "смартфон", "android", "ios",
        "ноутбук", "macbook", "asus", "lenovo", "планшет", "ipad", "airpods",
        "наушники", "колонка", "часы", "apple watch", "монитор", "клавиатура", "мышь"
    ],
    "🏠 БЫТОВАЯ ТЕХНИКА": [
        "холодильник", "стиральная", "машина", "посудомоечная", "плита", "духовка",
        "микроволновка", "кофемашина", "чайник", "блендер", "миксер", "соковыжималка"
    ],
    "👕 ОДЕЖДА И ОБУВЬ": [
        "футболка", "рубашка", "кофта", "худи", "свитер", "куртка", "пальто", "джинсы",
        "брюки", "шорты", "платье", "юбка", "блузка", "пиджак", "жилет", "костюм"
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
    }

    setupEventListeners() {
        // Форма добавления товара
        document.getElementById('addProductForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });

        // Автоопределение категории
        document.getElementById('productName').addEventListener('input', (e) => {
            this.updateCategoryPreview(e.target.value);
        });

        document.getElementById('productCategory').addEventListener('change', (e) => {
            this.updateCategoryPreview(document.getElementById('productName').value);
        });
    }

    // Автоматическое определение категории
    detectCategory(productName) {
        const name = productName.toLowerCase();
        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(keyword => name.includes(keyword.toLowerCase()))) {
                return category;
            }
        }
        return '🎁 ДРУГОЕ';
    }

    updateCategoryPreview(productName) {
        const preview = document.getElementById('autoDetectionPreview');
        const detectedCategorySpan = document.getElementById('detectedCategory');
        const categorySelect = document.getElementById('productCategory');
        
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

        // Автоопределение категории
        if (category === 'auto') {
            category = this.detectCategory(name);
        }

        const product = {
            id: Date.now(),
            name,
            price,
            category,
            date: new Date().toISOString()
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
        document.getElementById('autoDetectionPreview').classList.add('hidden');
        
        // Обновляем интерфейс
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
            console.error('Ошибка загрузки:', error);
            return [];
        }
    }

    saveProducts() {
        try {
            localStorage.setItem('products', JSON.stringify(this.products));
        } catch (error) {
            console.error('Ошибка сохранения:', error);
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
                <div class="product-name">${this.escapeHtml(product.name)}</div>
                <div class="product-meta">
                    <span>${new Date(product.date).toLocaleDateString('ru-RU')}</span>
                    <span class="product-price">${product.price.toLocaleString()}₽</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px;">
                    <div class="category-tag">
                        <i class="fas fa-tag"></i>
                        ${this.escapeHtml(product.category)}
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
        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, p) => sum + p.price, 0);
        const avgPrice = totalProducts > 0 ? Math.round(totalValue / totalProducts) : 0;
        
        // Находим популярную категорию
        const categoryCount = {};
        this.products.forEach(p => {
            categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
        });
        const topCategory = Object.keys(categoryCount).length > 0 
            ? Object.keys(categoryCount).reduce((a, b) => categoryCount[a] > categoryCount[b] ? a : b)
            : '-';

        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalValue').textContent = `${totalValue.toLocaleString()}₽`;
        document.getElementById('avgPrice').textContent = `${avgPrice.toLocaleString()}₽`;
        document.getElementById('topCategory').textContent = topCategory;
    }

    renderCharts() {
        this.renderCategoryChart();
        this.renderTimelineChart();
        this.renderCategoryBarChart();
        this.renderPriceByCategoryChart();
        this.renderPriceDistributionChart();
    }

    renderCategoryChart() {
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        const categoryData = {};
        this.products.forEach(p => {
            categoryData[p.category] = (categoryData[p.category] || 0) + 1;
        });

        // Удаляем старый график
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
                    backgroundColor: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    renderTimelineChart() {
        const ctx = document.getElementById('timelineChart').getContext('2d');
        
        const timelineData = {};
        this.products.forEach(p => {
            const date = new Date(p.date).toLocaleDateString('ru-RU');
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
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    renderCategoryBarChart() {
        const ctx = document.getElementById('categoryBarChart').getContext('2d');
        
        const categoryStats = {};
        this.products.forEach(p => {
            if (!categoryStats[p.category]) {
                categoryStats[p.category] = 0;
            }
            categoryStats[p.category]++;
        });

        if (this.charts.categoryBarChart) {
            this.charts.categoryBarChart.destroy();
        }

        if (Object.keys(categoryStats).length === 0) {
            this.showNoDataMessage('categoryBarChart');
            return;
        }

        this.charts.categoryBarChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(categoryStats),
                datasets: [{
                    label: 'Количество товаров',
                    data: Object.values(categoryStats),
                    backgroundColor: '#6366F1'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    renderPriceByCategoryChart() {
        const ctx = document.getElementById('priceByCategoryChart').getContext('2d');
        
        const categoryStats = {};
        this.products.forEach(p => {
            if (!categoryStats[p.category]) {
                categoryStats[p.category] = { count: 0, total: 0 };
            }
            categoryStats[p.category].count++;
            categoryStats[p.category].total += p.price;
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
                    backgroundColor: '#F59E0B'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    renderPriceDistributionChart() {
        const ctx = document.getElementById('priceDistributionChart').getContext('2d');
        
        const priceRanges = {
            '0-1,000₽': 0,
            '1,001-5,000₽': 0,
            '5,001-10,000₽': 0,
            '10,001-50,000₽': 0,
            '50,001+₽': 0
        };

        this.products.forEach(p => {
            if (p.price <= 1000) priceRanges['0-1,000₽']++;
            else if (p.price <= 5000) priceRanges['1,001-5,000₽']++;
            else if (p.price <= 10000) priceRanges['5,001-10,000₽']++;
            else if (p.price <= 50000) priceRanges['10,001-50,000₽']++;
            else priceRanges['50,001+₽']++;
        });

        if (this.charts.priceDistributionChart) {
            this.charts.priceDistributionChart.destroy();
        }

        if (this.products.length === 0) {
            this.showNoDataMessage('priceDistributionChart');
            return;
        }

        this.charts.priceDistributionChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(priceRanges),
                datasets: [{
                    data: Object.values(priceRanges),
                    backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    showNoDataMessage(canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '14px Arial';
        ctx.fillStyle = '#64748B';
        ctx.textAlign = 'center';
        ctx.fillText('Нет данных', canvas.width / 2, canvas.height / 2);
    }

    updateTables() {
        this.updateTopProductsTable();
        this.updateCategoriesTable();
        this.updatePriceRangesTable();
        this.updateAllProductsTable();
    }

    updateTopProductsTable() {
        const tbody = document.querySelector('#topProductsTable tbody');
        const topProducts = [...this.products]
            .sort((a, b) => b.price - a.price)
            .slice(0, 5);

        tbody.innerHTML = topProducts.length === 0 ? 
            '<tr><td colspan="4" style="text-align: center; color: #64748B;">Нет данных</td></tr>' :
            topProducts.map(p => `
                <tr>
                    <td>${this.escapeHtml(p.name)}</td>
                    <td class="number">${p.price.toLocaleString()}₽</td>
                    <td>${this.escapeHtml(p.category)}</td>
                    <td>
                        <button class="delete-btn" onclick="productManager.deleteProduct(${p.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    updateCategoriesTable() {
        const tbody = document.querySelector('#categoriesTable tbody');
        const categoryStats = {};
        
        this.products.forEach(p => {
            if (!categoryStats[p.category]) {
                categoryStats[p.category] = { count: 0, total: 0 };
            }
            categoryStats[p.category].count++;
            categoryStats[p.category].total += p.price;
        });

        const categories = Object.keys(categoryStats);

        tbody.innerHTML = categories.length === 0 ? 
            '<tr><td colspan="4" style="text-align: center; color: #64748B;">Нет данных</td></tr>' :
            categories.map(cat => {
                const stats = categoryStats[cat];
                const avgPrice = Math.round(stats.total / stats.count);
                return `
                    <tr>
                        <td>${this.escapeHtml(cat)}</td>
                        <td class="number">${stats.count}</td>
                        <td class="number">${stats.total.toLocaleString()}₽</td>
                        <td class="number">${avgPrice.toLocaleString()}₽</td>
                    </tr>
                `;
            }).join('');
    }

    updatePriceRangesTable() {
        const tbody = document.querySelector('#priceRangesTable tbody');
        const totalValue = this.products.reduce((sum, p) => sum + p.price, 0);
        
        const priceRanges = {
            '0-1,000₽': { min: 0, max: 1000, count: 0, total: 0 },
            '1,001-5,000₽': { min: 1001, max: 5000, count: 0, total: 0 },
            '5,001-10,000₽': { min: 5001, max: 10000, count: 0, total: 0 },
            '10,001-50,000₽': { min: 10001, max: 50000, count: 0, total: 0 },
            '50,001+₽': { min: 50001, max: Infinity, count: 0, total: 0 }
        };

        this.products.forEach(p => {
            for (const [range, data] of Object.entries(priceRanges)) {
                if (p.price >= data.min && p.price <= data.max) {
                    data.count++;
                    data.total += p.price;
                    break;
                }
            }
        });

        tbody.innerHTML = this.products.length === 0 ? 
            '<tr><td colspan="3" style="text-align: center; color: #64748B;">Нет данных</td></tr>' :
            Object.entries(priceRanges).map(([range, data]) => {
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
        const tbody = document.querySelector('#allProductsTable tbody');
        const sortedProducts = [...this.products].sort((a, b) => new Date(b.date) - new Date(a.date));

        tbody.innerHTML = sortedProducts.length === 0 ? 
            '<tr><td colspan="5" style="text-align: center; color: #64748B;">Нет данных</td></tr>' :
            sortedProducts.map(p => `
                <tr>
                    <td>${this.escapeHtml(p.name)}</td>
                    <td class="number">${p.price.toLocaleString()}₽</td>
                    <td>${this.escapeHtml(p.category)}</td>
                    <td>${new Date(p.date).toLocaleDateString('ru-RU')}</td>
                    <td>
                        <button class="delete-btn" onclick="productManager.deleteProduct(${p.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    exportToCSV() {
        if (this.products.length === 0) {
            alert('Нет данных для экспорта');
            return;
        }

        const headers = ['Название', 'Цена', 'Категория', 'Дата'];
        const csvData = [
            headers.join(','),
            ...this.products.map(p => [
                `"${p.name.replace(/"/g, '""')}"`,
                p.price,
                `"${p.category}"`,
                `"${new Date(p.date).toLocaleDateString('ru-RU')}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
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

// Глобальные функции навигации
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
}

function showAnalyticsScreen() {
    document.getElementById('mainScreen').classList.add('hidden');
    document.getElementById('addProductScreen').classList.add('hidden');
    document.getElementById('analyticsScreen').classList.remove('hidden');
    productManager.updateAnalytics();
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
    
    productManager.updateAnalytics();
}

function exportToCSV() {
    productManager.exportToCSV();
}

function clearAllData() {
    productManager.clearAllData();
}

// Инициализация при загрузке страницы
const productManager = new ProductManager();
