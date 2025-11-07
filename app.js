class ProductAnalytics {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStats();
        this.updateRecentProducts();
        
        // Устанавливаем сегодняшнюю дату по умолчанию
        const dateInput = document.getElementById('purchaseDate');
        if (dateInput) {
            dateInput.valueAsDate = new Date();
        }
        
        // Добавляем демо-данные если пусто
        if (this.products.length === 0) {
            this.addDemoData();
        }
    }

    addDemoData() {
        const demoProducts = [
            {
                id: this.generateId(),
                marketplace: 'wildberries',
                category: 'electronics',
                name: 'Смартфон Samsung Galaxy S23',
                price: 74990,
                date: new Date('2024-01-15').toISOString(),
                purchaseDate: '2024-01-15',
                notes: 'Покупка по акции'
            },
            {
                id: this.generateId(),
                marketplace: 'ozon',
                category: 'books',
                name: 'Книга "JavaScript для начинающих"',
                price: 1560,
                date: new Date('2024-01-20').toISOString(),
                purchaseDate: '2024-01-18',
                notes: 'Для изучения программирования'
            },
            {
                id: this.generateId(),
                marketplace: 'yandex',
                category: 'clothing',
                name: 'Футболка хлопковая черная',
                price: 1299,
                date: new Date('2024-02-01').toISOString(),
                purchaseDate: '2024-01-28',
                notes: 'Размер M'
            }
        ];
        
        this.products = demoProducts;
        this.saveProducts();
        this.updateStats();
        this.updateRecentProducts();
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Основные кнопки навигации
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.showPage('addProductPage');
        });
        
        document.getElementById('analyticsBtn').addEventListener('click', () => {
            this.showPage('analyticsPage');
            this.updateAnalytics();
        });
        
        // Кнопки назад
        document.getElementById('backFromAddBtn').addEventListener('click', () => {
            this.showPage('mainPage');
            this.updateStats();
            this.updateRecentProducts();
        });
        
        document.getElementById('backFromAnalyticsBtn').addEventListener('click', () => {
            this.showPage('mainPage');
            this.updateStats();
            this.updateRecentProducts();
        });
        
        // Форма товара
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });
        
        // Экспорт
        document.getElementById('exportAllBtn').addEventListener('click', () => {
            this.exportAllData();
        });
        
        // Экспорт отдельных таблиц
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tableId = e.target.getAttribute('data-table');
                this.exportTable(tableId);
            });
        });
        
        console.log('Event listeners setup complete');
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    addProduct() {
        const product = {
            id: this.generateId(),
            marketplace: document.getElementById('marketplace').value,
            category: document.getElementById('category').value,
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('price').value),
            date: new Date().toISOString(),
            purchaseDate: document.getElementById('purchaseDate').value || new Date().toISOString().split('T')[0],
            notes: document.getElementById('notes').value
        };

        this.products.push(product);
        this.saveProducts();
        
        // Сбрасываем форму
        document.getElementById('productForm').reset();
        document.getElementById('purchaseDate').valueAsDate = new Date();
        
        this.showPage('mainPage');
        this.updateStats();
        this.updateRecentProducts();
        this.showNotification('Товар успешно добавлен!', 'success');
    }

    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    updateStats() {
        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, product) => sum + product.price, 0);
        const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
        const uniqueCategories = new Set(this.products.map(p => p.category)).size;

        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalValue').textContent = `${totalValue.toFixed(2)}₽`;
        document.getElementById('avgPrice').textContent = `${avgPrice.toFixed(2)}₽`;
        document.getElementById('totalCategories').textContent = uniqueCategories;
    }

    updateRecentProducts() {
        const recentProducts = this.products
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        const recentProductsList = document.getElementById('recentProductsList');
        
        if (recentProducts.length === 0) {
            recentProductsList.innerHTML = '<p class="no-products">Нет добавленных товаров</p>';
            return;
        }
        
        recentProductsList.innerHTML = recentProducts.map(product => `
            <div class="product-item">
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-details">
                        ${this.formatMarketplaceName(product.marketplace)} • ${this.formatCategoryName(product.category)}
                        ${product.purchaseDate ? ` • ${new Date(product.purchaseDate).toLocaleDateString('ru-RU')}` : ''}
                    </div>
                </div>
                <div class="product-price">${product.price.toFixed(2)}₽</div>
            </div>
        `).join('');
    }

    updateAnalytics() {
        this.updateAnalyticsStats();
        this.destroyCharts();
        this.updateCharts();
        this.updateTables();
    }

    updateAnalyticsStats() {
        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, product) => sum + product.price, 0);
        const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
        const uniqueMarketplaces = new Set(this.products.map(p => p.marketplace)).size;

        document.getElementById('analyticsTotalProducts').textContent = totalProducts;
        document.getElementById('analyticsTotalValue').textContent = `${totalValue.toFixed(2)}₽`;
        document.getElementById('analyticsAvgPrice').textContent = `${avgPrice.toFixed(2)}₽`;
        document.getElementById('analyticsMarketplaces').textContent = uniqueMarketplaces;
    }

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }

    updateCharts() {
        if (this.products.length === 0) {
            this.showNotification('Нет данных для анализа. Добавьте товары!', 'info');
            return;
        }

        this.createMarketplaceChart();
        this.createCategoryChart();
        this.createAvgPriceChart();
        this.createMonthlyChart();
        this.createTopProductsChart();
        this.createCategoryValueChart();
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
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
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
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
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
                labels: topProducts.map(p => this.truncateText(p.name, 20)),
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
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F']
                }]
            }
        });
    }

    updateTables() {
        this.updateMarketplaceTable();
        this.updateCategoryTable();
        this.updateProductsTable();
    }

    updateMarketplaceTable() {
        const stats = this.getMarketplaceStats();
        const tableBody = document.querySelector('#marketplaceTable tbody');
        
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
        const stats = this.getCategoryStats();
        const tableBody = document.querySelector('#categoryTable tbody');
        
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
                <td>${product.notes || '-'}</td>
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
            acc[marketplace] = data.count > 0 ? data.total / data.count : 0;
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
            stats[mp].average = stats[mp].count > 0 ? stats[mp].total / stats[mp].count : 0;
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
            stats[category].average = stats[category].count > 0 ? stats[category].total / stats[category].count : 0;
        });

        return stats;
    }

    formatMarketplaceName(marketplace) {
        const names = {
            'wildberries': 'Wildberries',
            'ozon': 'Ozon',
            'yandex': 'Яндекс Маркет',
            'aliexpress': 'AliExpress',
            'amazon': 'Amazon',
            'sbermegamarket': 'СберМегаМаркет'
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
            'food': 'Продукты питания',
            'auto': 'Автотовары',
            'health': 'Здоровье'
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
            'Дата добавления': new Date(product.date).toLocaleDateString('ru-RU'),
            'Дата покупки': product.purchaseDate ? new Date(product.purchaseDate).toLocaleDateString('ru-RU') : '-',
            'Маркетплейс': this.formatMarketplaceName(product.marketplace),
            'Категория': this.formatCategoryName(product.category),
            'Товар': product.name,
            'Цена': product.price,
            'Примечания': product.notes || ''
        }));
        
        const rawWs = XLSX.utils.json_to_sheet(rawData);
        XLSX.utils.book_append_sheet(wb, rawWs, 'Все данные');
        
        XLSX.writeFile(wb, `product_analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
        this.showNotification('Все данные экспортированы в Excel', 'success');
    }

    showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Product Analytics App Starting...');
    window.app = new ProductAnalytics();
});
