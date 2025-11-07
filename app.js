class ProductAnalytics {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
        this.updateQuickStats();
    }

    setupEventListeners() {
        // Навигация
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Карточки действий
        document.getElementById('addProductBtn').addEventListener('click', () => this.showPage('addProductPage'));
        document.getElementById('analyticsBtn').addEventListener('click', () => {
            this.showPage('analyticsPage');
            this.updateAnalytics();
        });
        
        // Кнопки назад
        document.getElementById('backFromAddBtn').addEventListener('click', () => {
            this.showPage('mainPage');
            this.updateQuickStats();
        });
        document.getElementById('backFromAnalyticsBtn').addEventListener('click', () => {
            this.showPage('mainPage');
            this.updateQuickStats();
        });
        
        // Форма товара
        document.getElementById('productForm').addEventListener('submit', (e) => this.addProduct(e));
        
        // Экспорт
        document.getElementById('exportAllBtn').addEventListener('click', () => this.exportAllData());
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.exportTable(e.target.closest('.export-btn').dataset.table));
        });
    }

    checkAuth() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        if (isLoggedIn) {
            this.showPage('mainPage');
        } else {
            this.showPage('loginPage');
        }
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Простая аутентификация
        if (username && password) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('username', username);
            this.showPage('mainPage');
            this.updateQuickStats();
        }
    }

    logout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('username');
        this.showPage('loginPage');
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }

    addProduct(e) {
        e.preventDefault();
        
        const product = {
            id: Date.now(),
            marketplace: document.getElementById('marketplace').value,
            category: document.getElementById('category').value,
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('price').value),
            date: new Date().toISOString()
        };

        this.products.push(product);
        this.saveProducts();
        document.getElementById('productForm').reset();
        
        this.showPage('mainPage');
        this.updateQuickStats();
        
        this.showNotification('Товар успешно добавлен!', 'success');
    }

    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    updateQuickStats() {
        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, product) => sum + product.price, 0);
        const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;

        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalValue').textContent = `${totalValue.toFixed(2)}₽`;
        document.getElementById('avgPrice').textContent = `${avgPrice.toFixed(2)}₽`;
    }

    updateAnalytics() {
        this.destroyCharts();
        this.updateCharts();
        this.updateTables();
    }

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }

    updateCharts() {
        this.createMarketplaceChart();
        this.createCategoryChart();
        this.createAvgPriceChart();
        this.createMonthlyChart();
        this.createTopProductsChart();
        this.createCategoryValueChart();
        this.createTrendChart();
        this.createComparisonChart();
    }

    createMarketplaceChart() {
        const data = this.getCountByField('marketplace');
        const ctx = document.getElementById('marketplaceChart').getContext('2d');
        
        this.charts.marketplace = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data).map(key => this.formatMarketplaceName(key)),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: [
                        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createCategoryChart() {
        const data = this.getCountByField('category');
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        this.charts.category = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(data).map(key => this.formatCategoryName(key)),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: [
                        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
                        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
                    ]
                }]
            }
        });
    }

    createAvgPriceChart() {
        const data = this.getAvgPriceByMarketplace();
        const ctx = document.getElementById('avgPriceChart').getContext('2d');
        
        this.charts.avgPrice = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(data).map(key => this.formatMarketplaceName(key)),
                datasets: [{
                    label: 'Средняя цена (₽)',
                    data: Object.values(data),
                    backgroundColor: '#4ECDC4',
                    borderColor: '#45B7D1',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createMonthlyChart() {
        const data = this.getMonthlyData();
        const ctx = document.getElementById('monthlyChart').getContext('2d');
        
        this.charts.monthly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: 'Количество покупок',
                    data: Object.values(data),
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            }
        });
    }

    createTopProductsChart() {
        const topProducts = this.products
            .sort((a, b) => b.price - a.price)
            .slice(0, 5);
        
        const ctx = document.getElementById('topProductsChart').getContext('2d');
        
        this.charts.topProducts = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: topProducts.map(p => this.truncateText(p.name, 15)),
                datasets: [{
                    label: 'Цена (₽)',
                    data: topProducts.map(p => p.price),
                    backgroundColor: '#45B7D1'
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true
            }
        });
    }

    createCategoryValueChart() {
        const data = this.getTotalValueByCategory();
        const ctx = document.getElementById('categoryValueChart').getContext('2d');
        
        this.charts.categoryValue = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: Object.keys(data).map(key => this.formatCategoryName(key)),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: [
                        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
                        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
                    ]
                }]
            }
        });
    }

    createTrendChart() {
        const trendData = this.getTrendData();
        const ctx = document.getElementById('trendChart').getContext('2d');
        
        this.charts.trend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: trendData.dates,
                datasets: [{
                    label: 'Сумма покупок (₽)',
                    data: trendData.amounts,
                    borderColor: '#96CEB4',
                    backgroundColor: 'rgba(150, 206, 180, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            }
        });
    }

    createComparisonChart() {
        const comparisonData = this.getComparisonData();
        const ctx = document.getElementById('comparisonChart').getContext('2d');
        
        this.charts.comparison = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: Object.keys(comparisonData.count).map(key => this.formatMarketplaceName(key)),
                datasets: [
                    {
                        label: 'Количество товаров',
                        data: Object.values(comparisonData.count),
                        backgroundColor: 'rgba(255, 107, 107, 0.2)',
                        borderColor: '#FF6B6B'
                    },
                    {
                        label: 'Общая стоимость (тыс. ₽)',
                        data: Object.values(comparisonData.value).map(v => v / 1000),
                        backgroundColor: 'rgba(78, 205, 196, 0.2)',
                        borderColor: '#4ECDC4'
                    }
                ]
            }
        });
    }

    updateTables() {
        this.updateMarketplaceTable();
        this.updateCategoryTable();
        this.updateProductsTable();
    }

    updateMarketplaceTable() {
        const tableBody = document.querySelector('#marketplaceTable tbody');
        const stats = this.getMarketplaceStats();
        
        tableBody.innerHTML = Object.entries(stats).map(([marketplace, data]) => `
            <tr>
                <td>${this.formatMarketplaceName(marketplace)}</td>
                <td>${data.count}</td>
                <td>${data.total.toFixed(2)}₽</td>
                <td>${data.average.toFixed(2)}₽</td>
            </tr>
        `).join('');
    }

    updateCategoryTable() {
        const tableBody = document.querySelector('#categoryTable tbody');
        const stats = this.getCategoryStats();
        
        tableBody.innerHTML = Object.entries(stats).map(([category, data]) => `
            <tr>
                <td>${this.formatCategoryName(category)}</td>
                <td>${data.count}</td>
                <td>${data.total.toFixed(2)}₽</td>
                <td>${data.average.toFixed(2)}₽</td>
            </tr>
        `).join('');
    }

    updateProductsTable() {
        const tableBody = document.querySelector('#productsTable tbody');
        
        tableBody.innerHTML = this.products
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(product => `
            <tr>
                <td>${new Date(product.date).toLocaleDateString('ru-RU')}</td>
                <td>${this.formatMarketplaceName(product.marketplace)}</td>
                <td>${this.formatCategoryName(product.category)}</td>
                <td>${product.name}</td>
                <td>${product.price.toFixed(2)}₽</td>
            </tr>
        `).join('');
    }

    // Вспомогательные методы для анализа данных
    getCountByField(field) {
        return this.products.reduce((acc, product) => {
            acc[product[field]] = (acc[product[field]] || 0) + 1;
            return acc;
        }, {});
    }

    getAvgPriceByMarketplace() {
        const groups = this.products.reduce((acc, product) => {
            if (!acc[product.marketplace]) {
                acc[product.marketplace] = { total: 0, count: 0 };
            }
            acc[product.marketplace].total += product.price;
            acc[product.marketplace].count += 1;
            return acc;
        }, {});

        return Object.entries(groups).reduce((acc, [marketplace, data]) => {
            acc[marketplace] = data.total / data.count;
            return acc;
        }, {});
    }

    getMonthlyData() {
        return this.products.reduce((acc, product) => {
            const month = new Date(product.date).toLocaleDateString('ru-RU', { 
                year: 'numeric', 
                month: 'short' 
            });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});
    }

    getTotalValueByCategory() {
        return this.products.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + product.price;
            return acc;
        }, {});
    }

    getTrendData() {
        const dailyData = this.products.reduce((acc, product) => {
            const date = new Date(product.date).toLocaleDateString('ru-RU');
            if (!acc[date]) {
                acc[date] = 0;
            }
            acc[date] += product.price;
            return acc;
        }, {});

        const sortedDates = Object.keys(dailyData).sort();
        return {
            dates: sortedDates,
            amounts: sortedDates.map(date => dailyData[date])
        };
    }

    getComparisonData() {
        const data = this.products.reduce((acc, product) => {
            if (!acc[product.marketplace]) {
                acc[product.marketplace] = { count: 0, value: 0 };
            }
            acc[product.marketplace].count += 1;
            acc[product.marketplace].value += product.price;
            return acc;
        }, {});

        return {
            count: Object.entries(data).reduce((acc, [mp, d]) => {
                acc[mp] = d.count;
                return acc;
            }, {}),
            value: Object.entries(data).reduce((acc, [mp, d]) => {
                acc[mp] = d.value;
                return acc;
            }, {})
        };
    }

    getMarketplaceStats() {
        const stats = this.products.reduce((acc, product) => {
            if (!acc[product.marketplace]) {
                acc[product.marketplace] = { count: 0, total: 0 };
            }
            acc[product.marketplace].count += 1;
            acc[product.marketplace].total += product.price;
            return acc;
        }, {});

        Object.keys(stats).forEach(mp => {
            stats[mp].average = stats[mp].total / stats[mp].count;
        });

        return stats;
    }

    getCategoryStats() {
        const stats = this.products.reduce((acc, product) => {
            if (!acc[product.category]) {
                acc[product.category] = { count: 0, total: 0 };
            }
            acc[product.category].count += 1;
            acc[product.category].total += product.price;
            return acc;
        }, {});

        Object.keys(stats).forEach(category => {
            stats[category].average = stats[category].total / stats[category].count;
        });

        return stats;
    }

    formatMarketplaceName(marketplace) {
        const names = {
            'wildberries': 'Wildberries',
            'ozon': 'Ozon',
            'yandex': 'Яндекс Маркет',
            'aliexpress': 'AliExpress',
            'amazon': 'Amazon'
        };
        return names[marketplace] || marketplace;
    }

    formatCategoryName(category) {
        const names = {
            'electronics': 'Электроника',
            'clothing': 'Одежда',
            'books': 'Книги',
            'home': 'Дом и сад',
            'sports': 'Спорт',
            'beauty': 'Красота',
            'toys': 'Игрушки',
            'food': 'Продукты питания'
        };
        return names[category] || category;
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // Методы экспорта
    exportTable(tableId) {
        const table = document.getElementById(tableId);
        const ws = XLSX.utils.table_to_sheet(table);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Таблица');
        XLSX.writeFile(wb, `${tableId}_${new Date().toISOString().split('T')[0]}.xlsx`);
        this.showNotification('Таблица экспортирована в Excel', 'success');
    }

    exportAllData() {
        const wb = XLSX.utils.book_new();
        
        // Экспорт таблиц
        const tables = ['marketplaceTable', 'categoryTable', 'productsTable'];
        tables.forEach(tableId => {
            const table = document.getElementById(tableId);
            const ws = XLSX.utils.table_to_sheet(table);
            XLSX.utils.book_append_sheet(wb, ws, tableId.replace('Table', ''));
        });

        // Экспорт сырых данных
        const rawData = this.products.map(product => ({
            Дата: new Date(product.date).toLocaleDateString('ru-RU'),
            Маркетплейс: this.formatMarketplaceName(product.marketplace),
            Категория: this.formatCategoryName(product.category),
            Товар: product.name,
            Цена: product.price,
            'Дата добавления': new Date(product.date).toISOString()
        }));
        
        const rawWs = XLSX.utils.json_to_sheet(rawData);
        XLSX.utils.book_append_sheet(wb, rawWs, 'Все данные');
        
        XLSX.writeFile(wb, `product_analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
        this.showNotification('Все данные экспортированы в Excel', 'success');
    }

    showNotification(message, type = 'info') {
        // Создаем простое уведомление
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#10b981' : '#6366f1'};
            color: white;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Добавляем стили для анимаций уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new ProductAnalytics();
});
