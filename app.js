class ProductAnalytics {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.charts = {};
        this.currentTab = 'overview';
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
            },
            {
                id: this.generateId(),
                marketplace: 'aliexpress',
                category: 'electronics',
                name: 'Наушники беспроводные',
                price: 3499,
                date: new Date('2024-02-10').toISOString(),
                purchaseDate: '2024-02-08',
                notes: 'Доставка 2 недели'
            },
            {
                id: this.generateId(),
                marketplace: 'wildberries',
                category: 'home',
                name: 'Набор кухонных ножей',
                price: 4590,
                date: new Date('2024-02-15').toISOString(),
                purchaseDate: '2024-02-12',
                notes: 'Отличное качество'
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
        
        // Табы аналитики
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
        
        console.log('Event listeners setup complete');
    }

    switchTab(tabName) {
        // Убираем активный класс у всех кнопок и контента
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Добавляем активный класс выбранной кнопке и контенту
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
        
        this.currentTab = tabName;
        
        // Обновляем графики для выбранной вкладки
        this.updateTabCharts(tabName);
    }

    updateTabCharts(tabName) {
        this.destroyCharts();
        
        switch(tabName) {
            case 'overview':
                this.createOverviewCharts();
                break;
            case 'marketplaces':
                this.createMarketplaceCharts();
                break;
            case 'categories':
                this.createCategoryCharts();
                break;
            case 'prices':
                this.createPriceCharts();
                break;
            case 'timeline':
                this.createTimelineCharts();
                break;
            case 'comparison':
                this.createComparisonCharts();
                break;
        }
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
        this.updateTabCharts(this.currentTab);
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

    // ГРАФИКИ ДЛЯ ОБЗОРА
    createOverviewCharts() {
        if (this.products.length === 0) return;

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
                    legend: { position: 'bottom' },
                    title: { display: true, text: 'Распределение по маркетплейсам' }
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
                    backgroundColor: '#4ECDC4'
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
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
            .slice(0, 8);
        
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
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
                }]
            }
        });
    }

    // ГРАФИКИ ДЛЯ МАРКЕТПЛЕЙСОВ
    createMarketplaceCharts() {
        if (this.products.length === 0) return;

        this.createMarketplaceShareChart();
        this.createMarketplaceValueChart();
        this.createMarketplaceTrendChart();
        this.createMarketplaceEfficiencyChart();
    }

    createMarketplaceShareChart() {
        const data = this.getCountByField('marketplace');
        const total = Object.values(data).reduce((a, b) => a + b, 0);
        const percentages = Object.values(data).map(value => (value / total * 100).toFixed(1));
        
        const ctx = document.getElementById('marketplaceShareChart').getContext('2d');
        
        this.charts.marketplaceShare = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(data).map(key => this.formatMarketplaceName(key)),
                datasets: [{
                    label: 'Доля (%)',
                    data: percentages,
                    backgroundColor: '#6366f1'
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true, max: 100 } }
            }
        });
    }

    createMarketplaceValueChart() {
        const data = this.getTotalValueByMarketplace();
        const ctx = document.getElementById('marketplaceValueChart').getContext('2d');
        
        this.charts.marketplaceValue = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(data).map(key => this.formatMarketplaceName(key)),
                datasets: [{
                    label: 'Общая стоимость (₽)',
                    data: Object.values(data),
                    backgroundColor: '#10b981'
                }]
            }
        });
    }

    createMarketplaceTrendChart() {
        const monthlyData = this.getMonthlyDataByMarketplace();
        const marketplaces = Object.keys(monthlyData);
        const months = Object.keys(monthlyData[marketplaces[0]] || {});
        
        const ctx = document.getElementById('marketplaceTrendChart').getContext('2d');
        
        this.charts.marketplaceTrend = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: marketplaces.map((mp, index) => ({
                    label: this.formatMarketplaceName(mp),
                    data: months.map(month => monthlyData[mp][month] || 0),
                    borderColor: this.getColor(index),
                    tension: 0.4,
                    fill: false
                }))
            }
        });
    }

    createMarketplaceEfficiencyChart() {
        const efficiencyData = this.getMarketplaceEfficiency();
        const ctx = document.getElementById('marketplaceEfficiencyChart').getContext('2d');
        
        this.charts.marketplaceEfficiency = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Количество', 'Стоимость', 'Средняя цена', 'Частота'],
                datasets: [{
                    label: 'Эффективность маркетплейсов',
                    data: Object.values(efficiencyData),
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: '#6366f1'
                }]
            }
        });
    }

    // ГРАФИКИ ДЛЯ КАТЕГОРИЙ
    createCategoryCharts() {
        if (this.products.length === 0) return;

        this.createCategoryShareChart();
        this.createCategorySpendingChart();
        this.createCategoryTrendChart();
        this.createCategoryPriceDistributionChart();
    }

    createCategoryShareChart() {
        const data = this.getCountByField('category');
        const ctx = document.getElementById('categoryShareChart').getContext('2d');
        
        this.charts.categoryShare = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data).map(key => this.formatCategoryName(key)),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
                }]
            }
        });
    }

    createCategorySpendingChart() {
        const data = this.getTotalValueByCategory();
        const ctx = document.getElementById('categorySpendingChart').getContext('2d');
        
        this.charts.categorySpending = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(data).map(key => this.formatCategoryName(key)),
                datasets: [{
                    label: 'Потрачено (₽)',
                    data: Object.values(data),
                    backgroundColor: '#f59e0b'
                }]
            }
        });
    }

    // ГРАФИКИ ДЛЯ ЦЕН
    createPriceCharts() {
        if (this.products.length === 0) return;

        this.createPriceDistributionChart();
        this.createPriceSegmentsChart();
        this.createPriceTrendChart();
        this.createPriceComparisonChart();
    }

    createPriceDistributionChart() {
        const prices = this.products.map(p => p.price);
        const ctx = document.getElementById('priceDistributionChart').getContext('2d');
        
        this.charts.priceDistribution = new Chart(ctx, {
            type: 'histogram',
            data: {
                datasets: [{
                    label: 'Распределение цен',
                    data: prices,
                    backgroundColor: 'rgba(99, 102, 241, 0.5)'
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        title: { display: true, text: 'Цена (₽)' }
                    },
                    y: {
                        title: { display: true, text: 'Количество' }
                    }
                }
            }
        });
    }

    createPriceSegmentsChart() {
        const segments = {
            'До 1000₽': this.products.filter(p => p.price < 1000).length,
            '1000-5000₽': this.products.filter(p => p.price >= 1000 && p.price < 5000).length,
            '5000-10000₽': this.products.filter(p => p.price >= 5000 && p.price < 10000).length,
            '10000-50000₽': this.products.filter(p => p.price >= 10000 && p.price < 50000).length,
            'Свыше 50000₽': this.products.filter(p => p.price >= 50000).length
        };
        
        const ctx = document.getElementById('priceSegmentsChart').getContext('2d');
        
        this.charts.priceSegments = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(segments),
                datasets: [{
                    data: Object.values(segments),
                    backgroundColor: ['#4ECDC4', '#45B7D1', '#FF6B6B', '#FFEAA7', '#96CEB4']
                }]
            }
        });
    }

    // ГРАФИКИ ДЛЯ ВРЕМЕНИ
    createTimelineCharts() {
        if (this.products.length === 0) return;

        this.createDailyChart();
        this.createWeeklyChart();
        this.createPurchaseTrendChart();
        this.createSpendingTimelineChart();
    }

    createDailyChart() {
        const dailyData = this.getDailyData();
        const ctx = document.getElementById('dailyChart').getContext('2d');
        
        this.charts.daily = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(dailyData).slice(-30), // Последние 30 дней
                datasets: [{
                    label: 'Покупки по дням',
                    data: Object.values(dailyData).slice(-30),
                    borderColor: '#8b5cf6',
                    tension: 0.4
                }]
            }
        });
    }

    // ГРАФИКИ ДЛЯ СРАВНЕНИЯ
    createComparisonCharts() {
        if (this.products.length === 0) return;

        this.createMarketplaceComparisonChart();
        this.createCategoryComparisonChart();
        this.createRadarChart();
        this.createBubbleChart();
    }

    createMarketplaceComparisonChart() {
        const countData = this.getCountByField('marketplace');
        const valueData = this.getTotalValueByMarketplace();
        
        const ctx = document.getElementById('marketplaceComparisonChart').getContext('2d');
        
        this.charts.marketplaceComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(countData).map(key => this.formatMarketplaceName(key)),
                datasets: [
                    {
                        label: 'Количество товаров',
                        data: Object.values(countData),
                        backgroundColor: '#4ECDC4',
                        yAxisID: 'y'
                    },
                    {
                        label: 'Общая стоимость (тыс. ₽)',
                        data: Object.values(valueData).map(v => v / 1000),
                        backgroundColor: '#FF6B6B',
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        type: 'linear',
                        position: 'left',
                    },
                    y1: {
                        type: 'linear',
                        position: 'right',
                        grid: { drawOnChartArea: false }
                    }
                }
            }
        });
    }

    createRadarChart() {
        const marketplaceData = this.getMarketplaceStats();
        const ctx = document.getElementById('radarChart').getContext('2d');
        
        this.charts.radar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: Object.keys(marketplaceData).map(key => this.formatMarketplaceName(key)),
                datasets: [{
                    label: 'Количество товаров',
                    data: Object.values(marketplaceData).map(stats => stats.count),
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: '#6366f1'
                }]
            }
        });
    }

    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ АНАЛИТИКИ
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

    getTotalValueByMarketplace() {
        return this.products.reduce((acc, product) => {
            acc[product.marketplace] = (acc[product.marketplace] || 0) + product.price;
            return acc;
        }, {});
    }

    getTotalValueByCategory() {
        return this.products.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + product.price;
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

    getMonthlyDataByMarketplace() {
        const result = {};
        this.products.forEach(product => {
            const month = new Date(product.date).toLocaleDateString('ru-RU', { 
                year: 'numeric', 
                month: 'short' 
            });
            if (!result[product.marketplace]) {
                result[product.marketplace] = {};
            }
            result[product.marketplace][month] = (result[product.marketplace][month] || 0) + 1;
        });
        return result;
    }

    getDailyData() {
        return this.products.reduce((acc, product) => {
            const date = new Date(product.date).toLocaleDateString('ru-RU');
            acc[date] = (acc[date] || 0) + 1;
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

    getMarketplaceEfficiency() {
        // Упрощенный расчет эффективности
        const stats = this.getMarketplaceStats();
        const totalProducts = this.products.length;
        const totalValue = this.products.reduce((sum, p) => sum + p.price, 0);
        
        return Object.keys(stats).reduce((acc, mp) => {
            const mpStats = stats[mp];
            acc[mp] = (mpStats.count / totalProducts * 100 + mpStats.total / totalValue * 100) / 2;
            return acc;
        }, {});
    }

    getColor(index) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
        return colors[index % colors.length];
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

    // Остальные методы (updateTables, export и т.д.) остаются без изменений
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
