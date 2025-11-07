class ProductAnalytics {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuth();
        if (this.currentUser) {
            this.updateQuickStats();
            this.updateRecentProducts();
        }
        
        // Создаем демо-аккаунт если нет пользователей
        if (this.users.length === 0) {
            this.createDemoAccount();
        }
    }

    createDemoAccount() {
        const demoUser = {
            id: this.generateId(),
            username: 'demo',
            email: 'demo@example.com',
            password: 'demo123',
            createdAt: new Date().toISOString(),
            products: [
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
            ]
        };
        
        this.users.push(demoUser);
        this.saveUsers();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    setupEventListeners() {
        // Навигация между страницами аутентификации
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('registerPage');
        });
        
        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('loginPage');
        });

        // Формы аутентификации
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        
        // Демо-вход
        document.getElementById('demoLoginBtn').addEventListener('click', () => this.demoLogin());
        
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
            this.updateRecentProducts();
        });
        document.getElementById('backFromAnalyticsBtn').addEventListener('click', () => {
            this.showPage('mainPage');
            this.updateQuickStats();
            this.updateRecentProducts();
        });
        
        // Форма товара
        document.getElementById('productForm').addEventListener('submit', (e) => this.addProduct(e));
        
        // Экспорт
        document.getElementById('exportAllBtn').addEventListener('click', () => this.exportAllData());
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.exportTable(e.target.closest('.export-btn').dataset.table));
        });

        // Устанавливаем сегодняшнюю дату как значение по умолчанию для даты покупки
        const purchaseDateInput = document.getElementById('purchaseDate');
        if (purchaseDateInput) {
            purchaseDateInput.valueAsDate = new Date();
        }
    }

    checkAuth() {
        if (this.currentUser) {
            this.showPage('mainPage');
            this.updateUserWelcome();
        } else {
            this.showPage('loginPage');
        }
    }

    handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;

        // Валидация
        if (password !== confirmPassword) {
            this.showNotification('Пароли не совпадают!', 'error');
            return;
        }

        if (this.users.find(u => u.username === username)) {
            this.showNotification('Пользователь с таким именем уже существует!', 'error');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showNotification('Пользователь с таким email уже существует!', 'error');
            return;
        }

        // Создание нового пользователя
        const newUser = {
            id: this.generateId(),
            username,
            email,
            password, // В реальном приложении пароль должен быть хеширован!
            createdAt: new Date().toISOString(),
            products: []
        };

        this.users.push(newUser);
        this.saveUsers();
        
        this.showNotification('Аккаунт успешно создан! Теперь вы можете войти.', 'success');
        this.showPage('loginPage');
        document.getElementById('registerForm').reset();
    }

    handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.showPage('mainPage');
            this.updateQuickStats();
            this.updateRecentProducts();
            this.updateUserWelcome();
            this.showNotification(`Добро пожаловать, ${username}!`, 'success');
        } else {
            this.showNotification('Неверное имя пользователя или пароль!', 'error');
        }
    }

    demoLogin() {
        document.getElementById('loginUsername').value = 'demo';
        document.getElementById('loginPassword').value = 'demo123';
        this.handleLogin(new Event('submit'));
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showPage('loginPage');
        document.getElementById('loginForm').reset();
        this.showNotification('Вы вышли из системы', 'info');
    }

    updateUserWelcome() {
        const welcomeElement = document.getElementById('userWelcome');
        if (welcomeElement && this.currentUser) {
            welcomeElement.textContent = `Добро пожаловать, ${this.currentUser.username}!`;
        }
    }

    getCurrentUserProducts() {
        if (!this.currentUser) return [];
        
        // Находим актуального пользователя в базе
        const user = this.users.find(u => u.id === this.currentUser.id);
        return user ? (user.products || []) : [];
    }

    saveUserProducts(products) {
        if (!this.currentUser) return;
        
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex].products = products;
            this.currentUser.products = products; // Обновляем текущего пользователя
            this.saveUsers();
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }

    addProduct(e) {
        e.preventDefault();
        
        if (!this.currentUser) {
            this.showNotification('Ошибка: пользователь не авторизован', 'error');
            return;
        }
        
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

        const userProducts = this.getCurrentUserProducts();
        userProducts.push(product);
        this.saveUserProducts(userProducts);
        
        document.getElementById('productForm').reset();
        // Сбрасываем дату покупки на сегодня
        document.getElementById('purchaseDate').valueAsDate = new Date();
        
        this.showPage('mainPage');
        this.updateQuickStats();
        this.updateRecentProducts();
        this.showNotification('Товар успешно добавлен!', 'success');
    }

    updateQuickStats() {
        if (!this.currentUser) return;
        
        const products = this.getCurrentUserProducts();
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, product) => sum + product.price, 0);
        const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
        const userSince = this.currentUser.createdAt ? new Date(this.currentUser.createdAt).toLocaleDateString('ru-RU') : '-';

        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalValue').textContent = `${totalValue.toFixed(2)}₽`;
        document.getElementById('avgPrice').textContent = `${avgPrice.toFixed(2)}₽`;
        document.getElementById('userSince').textContent = userSince;
    }

    updateRecentProducts() {
        if (!this.currentUser) return;
        
        const products = this.getCurrentUserProducts();
        const recentProducts = products
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        const recentProductsList = document.getElementById('recentProductsList');
        
        if (recentProducts.length === 0) {
            recentProductsList.innerHTML = '<p style="text-align: center; color: var(--text-light);">Нет добавленных товаров</p>';
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
        if (!this.currentUser) return;
        
        this.updateAnalyticsStats();
        this.destroyCharts();
        this.updateCharts();
        this.updateTables();
    }

    updateAnalyticsStats() {
        const products = this.getCurrentUserProducts();
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, product) => sum + product.price, 0);
        const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
        const uniqueMarketplaces = new Set(products.map(p => p.marketplace)).size;

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
        const products = this.getCurrentUserProducts();
        if (products.length === 0) {
            this.showNotification('Нет данных для анализа. Добавьте товары!', 'info');
            return;
        }

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
        const products = this.getCurrentUserProducts();
        const data = this.getCountByField(products, 'marketplace');
        const ctx = document.getElementById('marketplaceChart').getContext('2d');
        
        this.charts.marketplace = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(data).map(key => this.formatMarketplaceName(key)),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: [
                        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
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
        const products = this.getCurrentUserProducts();
        const data = this.getCountByField(products, 'category');
        const ctx = document.getElementById('categoryChart').getContext('2d');
        
        this.charts.category = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(data).map(key => this.formatCategoryName(key)),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: [
                        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
                        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
                        '#A29BFE', '#FD79A8', '#E17055', '#00CEC9'
                    ]
                }]
            }
        });
    }

    createAvgPriceChart() {
        const products = this.getCurrentUserProducts();
        const data = this.getAvgPriceByMarketplace(products);
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
        const products = this.getCurrentUserProducts();
        const data = this.getMonthlyData(products);
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
        const products = this.getCurrentUserProducts();
        const topProducts = products
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
        const products = this.getCurrentUserProducts();
        const data = this.getTotalValueByCategory(products);
        const ctx = document.getElementById('categoryValueChart').getContext('2d');
        
        this.charts.categoryValue = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: Object.keys(data).map(key => this.formatCategoryName(key)),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: [
                        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
                        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
                        '#A29BFE', '#FD79A8', '#E17055', '#00CEC9'
                    ]
                }]
            }
        });
    }

    createTrendChart() {
        const products = this.getCurrentUserProducts();
        const trendData = this.getTrendData(products);
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
        const products = this.getCurrentUserProducts();
        const comparisonData = this.getComparisonData(products);
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
        const products = this.getCurrentUserProducts();
        const tableBody = document.querySelector('#marketplaceTable tbody');
        const stats = this.getMarketplaceStats(products);
        
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
        const products = this.getCurrentUserProducts();
        const tableBody = document.querySelector('#categoryTable tbody');
        const stats = this.getCategoryStats(products);
        
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
        const products = this.getCurrentUserProducts();
        const tableBody = document.querySelector('#productsTable tbody');
        
        tableBody.innerHTML = products
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
    getCountByField(products, field) {
        return products.reduce((acc, product) => {
            acc[product[field]] = (acc[product[field]] || 0) + 1;
            return acc;
        }, {});
    }

    getAvgPriceByMarketplace(products) {
        const groups = products.reduce((acc, product) => {
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

    getMonthlyData(products) {
        return products.reduce((acc, product) => {
            const month = new Date(product.date).toLocaleDateString('ru-RU', { 
                year: 'numeric', 
                month: 'short' 
            });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});
    }

    getTotalValueByCategory(products) {
        return products.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + product.price;
            return acc;
        }, {});
    }

    getTrendData(products) {
        const dailyData = products.reduce((acc, product) => {
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

    getComparisonData(products) {
        const data = products.reduce((acc, product) => {
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

    getMarketplaceStats(products) {
        const stats = products.reduce((acc, product) => {
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

    getCategoryStats(products) {
        const stats = products.reduce((acc, product) => {
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
            'sbermegamarket': 'СберМегаМаркет',
            'citilink': 'Citilink',
            'dns': 'DNS'
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
            'health': 'Здоровье',
            'other': 'Другое'
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
        XLSX.writeFile(wb, `${tableId}_${this.currentUser.username}_${new Date().toISOString().split('T')[0]}.xlsx`);
        this.showNotification('Таблица экспортирована в Excel', 'success');
    }

    exportAllData() {
        if (!this.currentUser) return;
        
        const products = this.getCurrentUserProducts();
        const wb = XLSX.utils.book_new();
        
        // Экспорт таблиц
        const tables = ['marketplaceTable', 'categoryTable', 'productsTable'];
        tables.forEach(tableId => {
            const table = document.getElementById(tableId);
            const ws = XLSX.utils.table_to_sheet(table);
            XLSX.utils.book_append_sheet(wb, ws, tableId.replace('Table', ''));
        });

        // Экспорт сырых данных
        const rawData = products.map(product => ({
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
        
        XLSX.writeFile(wb, `product_analytics_${this.currentUser.username}_${new Date().toISOString().split('T')[0]}.xlsx`);
        this.showNotification('Все данные экспортированы в Excel', 'success');
    }

    showNotification(message, type = 'info') {
        // Удаляем существующие уведомления
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
        }, 4000);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new ProductAnalytics();
});
