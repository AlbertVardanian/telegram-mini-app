class ProductAnalytics {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.charts = {};
        this.productsToDelete = null;
        this.currentTab = 'overview';
        this.init();
    }

    init() {
        this.createDemoAccount();
        this.setupEventListeners();
        this.checkAuth();
    }

    createDemoAccount() {
        if (this.users.length === 0) {
            const demoUser = {
                id: this.generateId(),
                username: 'demo',
                email: 'demo@example.com',
                password: 'demo123',
                createdAt: new Date().toISOString(),
                products: this.generateDemoProducts()
            };
            
            this.users.push(demoUser);
            this.saveUsers();
        }
    }

    generateDemoProducts() {
        const products = [];
        const marketplaces = ['wildberries', 'ozon', 'yandex', 'aliexpress', 'amazon'];
        const categories = ['electronics', 'clothing', 'books', 'home', 'sports', 'beauty'];
        
        for (let i = 1; i <= 50; i++) {
            const marketplace = marketplaces[Math.floor(Math.random() * marketplaces.length)];
            const category = categories[Math.floor(Math.random() * categories.length)];
            const price = Math.floor(Math.random() * 100000) + 100;
            const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
            
            products.push({
                id: this.generateId(),
                marketplace,
                category,
                name: `Товар ${i} - ${this.formatCategoryName(category)}`,
                price,
                date: date.toISOString(),
                purchaseDate: date.toISOString().split('T')[0],
                notes: `Демо товар ${i}`,
                rating: Math.floor(Math.random() * 5) + 1
            });
        }
        
        return products;
    }

    setupEventListeners() {
        console.log('🔄 Setting up event listeners...');

        // Навигация аутентификации
        this.setupAuthListeners();
        
        // Основная навигация
        this.setupMainListeners();
        
        // Управление товарами
        this.setupManagementListeners();
        
        // Аналитика
        this.setupAnalyticsListeners();
        
        // Модальные окна
        this.setupModalListeners();

        console.log('✅ Event listeners setup complete');
    }

    setupAuthListeners() {
        // Переключение между логином и регистрацией
        this.addListener('showRegister', 'click', (e) => {
            e.preventDefault();
            this.showPage('registerPage');
        });
        
        this.addListener('showLogin', 'click', (e) => {
            e.preventDefault();
            this.showPage('loginPage');
        });

        // Формы аутентификации
        this.addListener('loginForm', 'submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        this.addListener('registerForm', 'submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Демо-вход
        this.addListener('demoLogin', 'click', () => {
            this.demoLogin();
        });

        // Выход
        this.addListener('logoutBtn', 'click', () => {
            this.logout();
        });
    }

    setupMainListeners() {
        // Основные кнопки навигации
        this.addListener('addProductBtn', 'click', () => {
            this.showPage('addProductPage');
        });
        
        this.addListener('analyticsBtn', 'click', () => {
            this.showPage('analyticsPage');
            setTimeout(() => this.updateAnalytics(), 100);
        });
        
        this.addListener('manageProductsBtn', 'click', () => {
            this.showPage('manageProductsPage');
            this.loadProductsManagement();
        });

        // Кнопки назад
        this.addListener('backFromAddBtn', 'click', () => {
            this.showPage('mainPage');
            this.updateStats();
            this.updateRecentProducts();
        });
        
        this.addListener('backFromAnalyticsBtn', 'click', () => {
            this.showPage('mainPage');
            this.updateStats();
            this.updateRecentProducts();
        });
        
        this.addListener('backFromManageBtn', 'click', () => {
            this.showPage('mainPage');
            this.updateStats();
            this.updateRecentProducts();
        });

        // Форма добавления товара
        this.addListener('productForm', 'submit', (e) => {
            e.preventDefault();
            this.addProduct();
        });

        // Установка сегодняшней даты по умолчанию
        const purchaseDateInput = document.getElementById('purchaseDate');
        if (purchaseDateInput) {
            purchaseDateInput.valueAsDate = new Date();
        }
    }

    setupManagementListeners() {
        // Поиск и сортировка
        this.addListener('searchProducts', 'input', (e) => {
            this.filterProducts(e.target.value);
        });
        
        this.addListener('sortProducts', 'change', (e) => {
            this.sortProducts(e.target.value);
        });

        // Экспорт товаров
        this.addListener('exportProductsBtn', 'click', () => {
            this.exportProductsData();
        });
    }

    setupAnalyticsListeners() {
        // Экспорт
        this.addListener('exportAllBtn', 'click', () => {
            this.exportAllData();
        });

        // Обновление таблиц
        this.addListener('refreshProducts', 'click', () => {
            this.updateTables();
        });

        // Табы аналитики
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            }
        });

        // Экспорт таблиц
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('export-btn')) {
                const tableId = e.target.getAttribute('data-table');
                this.exportTable(tableId);
            }
        });
    }

    setupModalListeners() {
        // Модальное окно удаления
        this.addListener('confirmDelete', 'click', () => {
            this.confirmDeleteProduct();
        });
        
        this.addListener('cancelDelete', 'click', () => {
            this.hideDeleteModal();
        });

        // Закрытие модального окна по клику вне его
        this.addListener('deleteModal', 'click', (e) => {
            if (e.target.id === 'deleteModal') {
                this.hideDeleteModal();
            }
        });
    }

    addListener(id, event, handler) {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener(event, handler);
        }
    }

    // АУТЕНТИФИКАЦИЯ
    checkAuth() {
        if (this.currentUser) {
            this.showPage('mainPage');
            this.updateStats();
            this.updateRecentProducts();
            this.updateUserWelcome();
        } else {
            this.showPage('loginPage');
        }
    }

    handleLogin() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        
        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.showPage('mainPage');
            this.updateStats();
            this.updateRecentProducts();
            this.updateUserWelcome();
            this.showNotification('🎉 Вход выполнен успешно!', 'success');
        } else {
            this.showNotification('❌ Неверные данные для входа!', 'error');
        }
    }

    demoLogin() {
        document.getElementById('loginUsername').value = 'demo';
        document.getElementById('loginPassword').value = 'demo123';
        this.handleLogin();
    }

    handleRegister() {
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        // Валидация
        if (password !== confirmPassword) {
            this.showNotification('❌ Пароли не совпадают!', 'error');
            return;
        }

        if (this.users.find(u => u.username === username)) {
            this.showNotification('❌ Пользователь с таким именем уже существует!', 'error');
            return;
        }

        if (this.users.find(u => u.email === email)) {
            this.showNotification('❌ Пользователь с таким email уже существует!', 'error');
            return;
        }

        // Создание пользователя
        const newUser = {
            id: this.generateId(),
            username,
            email,
            password,
            createdAt: new Date().toISOString(),
            products: []
        };

        this.users.push(newUser);
        this.saveUsers();
        
        this.showNotification('✅ Аккаунт создан! Теперь войдите.', 'success');
        this.showPage('loginPage');
        document.getElementById('registerForm').reset();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showPage('loginPage');
        document.getElementById('loginForm').reset();
        this.showNotification('👋 Вы вышли из системы', 'info');
    }

    updateUserWelcome() {
        const welcome = document.getElementById('userWelcome');
        if (welcome && this.currentUser) {
            welcome.textContent = `👋 Добро пожаловать, ${this.currentUser.username}!`;
        }
    }

    // ОСНОВНЫЕ ФУНКЦИИ
    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getCurrentUserProducts() {
        if (!this.currentUser) return [];
        const user = this.users.find(u => u.id === this.currentUser.id);
        return user ? (user.products || []) : [];
    }

    saveUserProducts(products) {
        if (!this.currentUser) return;
        
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex].products = products;
            this.currentUser.products = products;
            this.saveUsers();
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // УПРАВЛЕНИЕ ТОВАРАМИ
    addProduct() {
        if (!this.currentUser) {
            this.showNotification('❌ Ошибка: пользователь не авторизован', 'error');
            return;
        }
        
        const marketplace = document.getElementById('marketplace');
        const category = document.getElementById('category');
        const productName = document.getElementById('productName');
        const price = document.getElementById('price');
        
        if (!marketplace.value || !category.value || !productName.value || !price.value) {
            this.showNotification('❌ Заполните все обязательные поля!', 'error');
            return;
        }
        
        const product = {
            id: this.generateId(),
            marketplace: marketplace.value,
            category: category.value,
            name: productName.value,
            price: parseFloat(price.value),
            date: new Date().toISOString(),
            purchaseDate: document.getElementById('purchaseDate').value || new Date().toISOString().split('T')[0],
            notes: document.getElementById('notes').value,
            rating: document.getElementById('rating').value || null
        };

        const userProducts = this.getCurrentUserProducts();
        userProducts.push(product);
        this.saveUserProducts(userProducts);
        
        // Сброс формы
        document.getElementById('productForm').reset();
        document.getElementById('purchaseDate').valueAsDate = new Date();
        
        this.showPage('mainPage');
        this.updateStats();
        this.updateRecentProducts();
        this.showNotification('✅ Товар успешно добавлен!', 'success');
    }

    updateStats() {
        if (!this.currentUser) return;
        
        const products = this.getCurrentUserProducts();
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, product) => sum + product.price, 0);
        const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
        const uniqueCategories = new Set(products.map(p => p.category)).size;

        this.updateElementText('totalProducts', totalProducts);
        this.updateElementText('totalValue', `${totalValue.toLocaleString('ru-RU')}₽`);
        this.updateElementText('avgPrice', `${avgPrice.toLocaleString('ru-RU', {maximumFractionDigits: 2})}₽`);
        this.updateElementText('totalCategories', uniqueCategories);
    }

    updateElementText(id, text) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }

    updateRecentProducts() {
        if (!this.currentUser) return;
        
        const products = this.getCurrentUserProducts();
        const recentProducts = products
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
        
        const recentProductsList = document.getElementById('recentProductsList');
        if (!recentProductsList) return;
        
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
                        ${product.rating ? ` • ${'⭐'.repeat(product.rating)}` : ''}
                    </div>
                </div>
                <div class="product-price">${product.price.toLocaleString('ru-RU')}₽</div>
            </div>
        `).join('');
    }

    // УПРАВЛЕНИЕ ТОВАРАМИ
    loadProductsManagement() {
        const products = this.getCurrentUserProducts();
        const container = document.getElementById('productsManagementList');
        if (!container) return;

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📦</div>
                    <h3>Нет товаров</h3>
                    <p>Добавьте первый товар, чтобы начать работу</p>
                    <button class="btn btn-primary" onclick="app.showPage('addProductPage')">
                        ➕ Добавить товар
                    </button>
                </div>
            `;
            return;
        }

        this.renderFilteredProducts(products);
    }

    filterProducts(searchTerm) {
        const products = this.getCurrentUserProducts();
        const filtered = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            this.formatMarketplaceName(product.marketplace).toLowerCase().includes(searchTerm.toLowerCase()) ||
            this.formatCategoryName(product.category).toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderFilteredProducts(filtered);
    }

    sortProducts(sortType) {
        const products = this.getCurrentUserProducts();
        let sorted = [...products];
        
        switch(sortType) {
            case 'date-desc':
                sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'date-asc':
                sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'price-desc':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'price-asc':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'name-asc':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sorted.sort((a, b) => b.name.localeCompare(a.name));
                break;
        }
        
        this.renderFilteredProducts(sorted);
    }

    renderFilteredProducts(products) {
        const container = document.getElementById('productsManagementList');
        if (!container) return;

        container.innerHTML = products.map(product => `
            <div class="product-management-item" data-product-id="${product.id}">
                <div class="product-mgmt-info">
                    <div class="product-mgmt-name">${product.name}</div>
                    <div class="product-mgmt-details">
                        ${this.formatMarketplaceName(product.marketplace)} • ${this.formatCategoryName(product.category)}
                        • ${new Date(product.date).toLocaleDateString('ru-RU')}
                        ${product.rating ? ` • ${'⭐'.repeat(product.rating)}` : ''}
                    </div>
                </div>
                <div class="product-mgmt-price">${product.price.toLocaleString('ru-RU')}₽</div>
                <div class="product-mgmt-actions">
                    <button class="btn btn-danger btn-sm" onclick="app.showDeleteModal('${product.id}')">
                        🗑️ Удалить
                    </button>
                </div>
            </div>
        `).join('');
    }

    // УДАЛЕНИЕ ТОВАРОВ
    showDeleteModal(productId) {
        this.productsToDelete = productId;
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideDeleteModal() {
        this.productsToDelete = null;
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    confirmDeleteProduct() {
        if (!this.productsToDelete) return;
        
        const userProducts = this.getCurrentUserProducts();
        const updatedProducts = userProducts.filter(product => product.id !== this.productsToDelete);
        this.saveUserProducts(updatedProducts);
        
        this.hideDeleteModal();
        this.loadProductsManagement();
        this.updateStats();
        this.updateRecentProducts();
        this.updateTables();
        this.showNotification('✅ Товар успешно удален!', 'success');
    }

    // АНАЛИТИКА
    updateAnalytics() {
        if (!this.currentUser) return;
        
        this.updateAnalyticsStats();
        this.destroyCharts();
        this.updateTabCharts(this.currentTab);
        this.updateTables();
    }

    updateAnalyticsStats() {
        const products = this.getCurrentUserProducts();
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, product) => sum + product.price, 0);
        const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
        const uniqueMarketplaces = new Set(products.map(p => p.marketplace)).size;

        this.updateElementText('analyticsTotalProducts', totalProducts);
        this.updateElementText('analyticsTotalValue', `${totalValue.toLocaleString('ru-RU')}₽`);
        this.updateElementText('analyticsAvgPrice', `${avgPrice.toLocaleString('ru-RU', {maximumFractionDigits: 2})}₽`);
        this.updateElementText('analyticsMarketplaces', uniqueMarketplaces);
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
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        const tabContent = document.getElementById(`${tabName}Tab`);
        
        if (tabBtn) tabBtn.classList.add('active');
        if (tabContent) tabContent.classList.add('active');
        
        this.currentTab = tabName;
        
        // Обновляем графики для выбранной вкладки
        this.updateTabCharts(tabName);
    }

    updateTabCharts(tabName) {
        this.destroyCharts();
        
        const products = this.getCurrentUserProducts();
        if (products.length === 0) {
            this.showChartPlaceholders(tabName);
            return;
        }

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
            case 'advanced':
                this.createAdvancedCharts();
                break;
            case 'predictive':
                this.createPredictiveCharts();
                break;
            default:
                this.createOverviewCharts();
        }
    }

    showChartPlaceholders(tabName) {
        const tabContent = document.getElementById(`${tabName}Tab`);
        if (tabContent) {
            const charts = tabContent.querySelectorAll('.chart-card');
            charts.forEach(chart => {
                const canvas = chart.querySelector('canvas');
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#f8fafc';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = '#64748b';
                    ctx.font = '16px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('Нет данных для отображения', canvas.width / 2, canvas.height / 2);
                }
            });
        }
    }

    // ОСНОВНЫЕ ГРАФИКИ ДЛЯ ОБЗОРА
    createOverviewCharts() {
        this.createMarketplaceChart();
        this.createCategoryChart();
        this.createAvgPriceChart();
        this.createMonthlyChart();
        this.createTopProductsChart();
        this.createCategoryValueChart();
        this.createSpendingTrendChart();
        this.createPriceSegmentsOverviewChart();
        this.createPurchaseActivityChart();
        this.createPriceCategoryChart();
        this.createMarketplaceDynamicsChart();
        this.createPurchaseFunnelChart();
    }

    createMarketplaceChart() {
        const data = this.getCountByField('marketplace');
        this.createChart('marketplaceChart', {
            type: 'doughnut',
            data: {
                labels: Object.keys(data).map(key => this.formatMarketplaceName(key)),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
                }]
            }
        });
    }

    createCategoryChart() {
        const data = this.getCountByField('category');
        this.createChart('categoryChart', {
            type: 'pie',
            data: {
                labels: Object.keys(data).map(key => this.formatCategoryName(key)),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
                }]
            }
        });
    }

    createAvgPriceChart() {
        const data = this.getAvgPriceByMarketplace();
        this.createChart('avgPriceChart', {
            type: 'bar',
            data: {
                labels: Object.keys(data).map(key => this.formatMarketplaceName(key)),
                datasets: [{
                    label: 'Средняя цена (₽)',
                    data: Object.values(data),
                    backgroundColor: '#4ECDC4'
                }]
            }
        });
    }

    createMonthlyChart() {
        const data = this.getMonthlyData();
        this.createChart('monthlyChart', {
            type: 'line',
            data: {
                labels: Object.keys(data),
                datasets: [{
                    label: 'Покупки по месяцам',
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
        const topProducts = this.getCurrentUserProducts()
            .sort((a, b) => b.price - a.price)
            .slice(0, 8);
        
        this.createChart('topProductsChart', {
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
                indexAxis: 'y'
            }
        });
    }

    createCategoryValueChart() {
        const data = this.getTotalValueByCategory();
        this.createChart('categoryValueChart', {
            type: 'polarArea',
            data: {
                labels: Object.keys(data).map(key => this.formatCategoryName(key)),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
                }]
            }
        });
    }

    createSpendingTrendChart() {
        const monthlySpending = this.getMonthlySpending();
        this.createChart('spendingTrendChart', {
            type: 'line',
            data: {
                labels: Object.keys(monthlySpending),
                datasets: [{
                    label: 'Расходы по месяцам (₽)',
                    data: Object.values(monthlySpending),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            }
        });
    }

    createPriceSegmentsOverviewChart() {
        const segments = this.getPriceSegments();
        this.createChart('priceSegmentsOverviewChart', {
            type: 'doughnut',
            data: {
                labels: Object.keys(segments),
                datasets: [{
                    data: Object.values(segments),
                    backgroundColor: ['#4ECDC4', '#45B7D1', '#FF6B6B', '#FFEAA7', '#96CEB4']
                }]
            }
        });
    }

    // ДОПОЛНИТЕЛЬНЫЕ ГРАФИКИ
    createMarketplaceCharts() {
        this.createMarketplaceShareChart();
        this.createMarketplaceValueChart();
        this.createMarketplaceTrendChart();
        this.createMarketplaceEfficiencyChart();
        this.createMarketplaceAvgChart();
        this.createMarketplaceProductsChart();
    }

    createMarketplaceShareChart() {
        const data = this.getCountByField('marketplace');
        const total = Object.values(data).reduce((a, b) => a + b, 0);
        const percentages = Object.values(data).map(value => (value / total * 100).toFixed(1));
        
        this.createChart('marketplaceShareChart', {
            type: 'bar',
            data: {
                labels: Object.keys(data).map(key => this.formatMarketplaceName(key)),
                datasets: [{
                    label: 'Доля (%)',
                    data: percentages,
                    backgroundColor: '#6366f1'
                }]
            }
        });
    }

    createMarketplaceValueChart() {
        const data = this.getTotalValueByMarketplace();
        this.createChart('marketplaceValueChart', {
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

    createCategoryCharts() {
        this.createCategoryShareChart();
        this.createCategorySpendingChart();
        // Добавь остальные графики категорий по аналогии
    }

    createCategoryShareChart() {
        const data = this.getCountByField('category');
        this.createChart('categoryShareChart', {
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
        this.createChart('categorySpendingChart', {
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

    createPriceCharts() {
        this.createPriceDistributionChart();
        this.createPriceSegmentsChart();
        // Добавь остальные графики цен по аналогии
    }

    createPriceDistributionChart() {
        const prices = this.getCurrentUserProducts().map(p => p.price);
        this.createChart('priceDistributionChart', {
            type: 'bar',
            data: {
                labels: Array.from({length: 10}, (_, i) => `${i * 10000}-${(i + 1) * 10000}₽`),
                datasets: [{
                    label: 'Распределение цен',
                    data: this.calculatePriceDistribution(prices),
                    backgroundColor: '#8b5cf6'
                }]
            }
        });
    }

    createPriceSegmentsChart() {
        const segments = this.getPriceSegments();
        this.createChart('priceSegmentsChart', {
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

    createTimelineCharts() {
        this.createDailyChart();
        this.createWeeklyChart();
        // Добавь остальные графики времени по аналогии
    }

    createDailyChart() {
        const dailyData = this.getDailyData();
        const labels = Object.keys(dailyData).slice(-30);
        const data = Object.values(dailyData).slice(-30);
        
        this.createChart('dailyChart', {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Покупки по дням',
                    data: data,
                    borderColor: '#8b5cf6',
                    tension: 0.4
                }]
            }
        });
    }

    createWeeklyChart() {
        const weeklyData = this.getWeeklyData();
        this.createChart('weeklyChart', {
            type: 'bar',
            data: {
                labels: Object.keys(weeklyData),
                datasets: [{
                    label: 'Покупки по неделям',
                    data: Object.values(weeklyData),
                    backgroundColor: '#ec4899'
                }]
            }
        });
    }

    createComparisonCharts() {
        this.createMarketplaceComparisonChart();
        this.createCategoryComparisonChart();
        // Добавь остальные графики сравнения по аналогии
    }

    createMarketplaceComparisonChart() {
        const countData = this.getCountByField('marketplace');
        const valueData = this.getTotalValueByMarketplace();
        
        this.createChart('marketplaceComparisonChart', {
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
                scales: {
                    y: { type: 'linear', position: 'left' },
                    y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false } }
                }
            }
        });
    }

    createAdvancedCharts() {
        this.createRadarChart();
        // Добавь остальные продвинутые графики по аналогии
    }

    createRadarChart() {
        const marketplaceData = this.getMarketplaceStats();
        this.createChart('radarChart', {
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

    createPredictiveCharts() {
        this.createSpendingForecastChart();
        // Добавь остальные прогнозные графики по аналогии
    }

    createSpendingForecastChart() {
        const monthlySpending = this.getMonthlySpending();
        const labels = Object.keys(monthlySpending);
        const data = Object.values(monthlySpending);
        
        // Простой прогноз - последнее значение * 1.1
        const forecastData = [...data, data[data.length - 1] * 1.1];
        const forecastLabels = [...labels, 'Прогноз'];
        
        this.createChart('spendingForecastChart', {
            type: 'line',
            data: {
                labels: forecastLabels,
                datasets: [
                    {
                        label: 'Фактические расходы',
                        data: data,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Прогноз',
                        data: forecastData,
                        borderColor: '#f59e0b',
                        borderDash: [5, 5],
                        fill: false
                    }
                ]
            }
        });
    }

    // УНИВЕРСАЛЬНЫЙ МЕТОД СОЗДАНИЯ ГРАФИКОВ
    createChart(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        // Очищаем предыдущий график
        const existingChart = this.charts[canvasId];
        if (existingChart) {
            existingChart.destroy();
        }
        
        // Создаем новый график
        const ctx = canvas.getContext('2d');
        this.charts[canvasId] = new Chart(ctx, {
            type: config.type,
            data: config.data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                ...config.options
            }
        });
        
        return this.charts[canvasId];
    }

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ДЛЯ АНАЛИТИКИ
    getCountByField(field) {
        const products = this.getCurrentUserProducts();
        return products.reduce((acc, product) => {
            acc[product[field]] = (acc[product[field]] || 0) + 1;
            return acc;
        }, {});
    }

    getAvgPriceByMarketplace() {
        const products = this.getCurrentUserProducts();
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

    getTotalValueByMarketplace() {
        const products = this.getCurrentUserProducts();
        return products.reduce((acc, product) => {
            acc[product.marketplace] = (acc[product.marketplace] || 0) + product.price;
            return acc;
        }, {});
    }

    getTotalValueByCategory() {
        const products = this.getCurrentUserProducts();
        return products.reduce((acc, product) => {
            acc[product.category] = (acc[product.category] || 0) + product.price;
            return acc;
        }, {});
    }

    getMonthlyData() {
        const products = this.getCurrentUserProducts();
        return products.reduce((acc, product) => {
            const month = new Date(product.date).toLocaleDateString('ru-RU', { 
                year: 'numeric', 
                month: 'short' 
            });
            acc[month] = (acc[month] || 0) + 1;
            return acc;
        }, {});
    }

    getMonthlySpending() {
        const products = this.getCurrentUserProducts();
        return products.reduce((acc, product) => {
            const month = new Date(product.date).toLocaleDateString('ru-RU', { 
                year: 'numeric', 
                month: 'short' 
            });
            acc[month] = (acc[month] || 0) + product.price;
            return acc;
        }, {});
    }

    getPriceSegments() {
        const products = this.getCurrentUserProducts();
        return {
            'До 1,000₽': products.filter(p => p.price < 1000).length,
            '1,000-5,000₽': products.filter(p => p.price >= 1000 && p.price < 5000).length,
            '5,000-10,000₽': products.filter(p => p.price >= 5000 && p.price < 10000).length,
            '10,000-50,000₽': products.filter(p => p.price >= 10000 && p.price < 50000).length,
            'Свыше 50,000₽': products.filter(p => p.price >= 50000).length
        };
    }

    calculatePriceDistribution(prices) {
        const distribution = Array(10).fill(0);
        prices.forEach(price => {
            const index = Math.min(Math.floor(price / 10000), 9);
            distribution[index]++;
        });
        return distribution;
    }

    getDailyData() {
        const products = this.getCurrentUserProducts();
        return products.reduce((acc, product) => {
            const date = new Date(product.date).toLocaleDateString('ru-RU');
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
    }

    getWeeklyData() {
        const products = this.getCurrentUserProducts();
        const weeklyData = {};
        
        products.forEach(product => {
            const date = new Date(product.date);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekKey = weekStart.toLocaleDateString('ru-RU');
            
            weeklyData[weekKey] = (weeklyData[weekKey] || 0) + 1;
        });
        
        return weeklyData;
    }

    getMarketplaceStats() {
        const products = this.getCurrentUserProducts();
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

    getMarketplaceTrendChart() {
        // Заглушка для демонстрации
        this.createChart('marketplaceTrendChart', {
            type: 'line',
            data: {
                labels: ['Янв', 'Фев', 'Мар', 'Апр'],
                datasets: [{
                    label: 'Wildberries',
                    data: [5, 8, 12, 15],
                    borderColor: '#FF6B6B'
                }, {
                    label: 'Ozon',
                    data: [3, 6, 9, 11],
                    borderColor: '#4ECDC4'
                }]
            }
        });
    }

    createMarketplaceEfficiencyChart() {
        this.createChart('marketplaceEfficiencyChart', {
            type: 'radar',
            data: {
                labels: ['Кол-во', 'Стоимость', 'Средняя цена', 'Частота'],
                datasets: [{
                    label: 'Эффективность',
                    data: [65, 75, 60, 80],
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: '#6366f1'
                }]
            }
        });
    }

    createMarketplaceAvgChart() {
        const data = this.getAvgPriceByMarketplace();
        this.createChart('marketplaceAvgChart', {
            type: 'bar',
            data: {
                labels: Object.keys(data).map(key => this.formatMarketplaceName(key)),
                datasets: [{
                    label: 'Средний чек (₽)',
                    data: Object.values(data),
                    backgroundColor: '#f59e0b'
                }]
            }
        });
    }

    createMarketplaceProductsChart() {
        const data = this.getCountByField('marketplace');
        this.createChart('marketplaceProductsChart', {
            type: 'pie',
            data: {
                labels: Object.keys(data).map(key => this.formatMarketplaceName(key)),
                datasets: [{
                    data: Object.values(data),
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
                }]
            }
        });
    }

    createPurchaseActivityChart() {
        const dailyData = this.getDailyData();
        const labels = Object.keys(dailyData).slice(-15);
        const data = Object.values(dailyData).slice(-15);
        
        this.createChart('purchaseActivityChart', {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Активность покупок',
                    data: data,
                    borderColor: '#ec4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            }
        });
    }

    createPriceCategoryChart() {
        const products = this.getCurrentUserProducts();
        const categories = [...new Set(products.map(p => p.category))];
        const avgPrices = categories.map(category => {
            const categoryProducts = products.filter(p => p.category === category);
            return categoryProducts.reduce((sum, p) => sum + p.price, 0) / categoryProducts.length;
        });
        
        this.createChart('priceCategoryChart', {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Цена vs Категория',
                    data: categories.map((category, i) => ({
                        x: i,
                        y: avgPrices[i],
                        r: 10
                    })),
                    backgroundColor: '#8b5cf6'
                }]
            },
            options: {
                scales: {
                    x: {
                        title: { display: true, text: 'Категории' },
                        ticks: {
                            callback: function(value) {
                                return categories[value];
                            }
                        }
                    },
                    y: {
                        title: { display: true, text: 'Средняя цена (₽)' }
                    }
                }
            }
        });
    }

    createMarketplaceDynamicsChart() {
        this.createChart('marketplaceDynamicsChart', {
            type: 'line',
            data: {
                labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май'],
                datasets: [
                    {
                        label: 'Wildberries',
                        data: [10, 15, 12, 18, 22],
                        borderColor: '#FF6B6B',
                        tension: 0.4
                    },
                    {
                        label: 'Ozon',
                        data: [8, 12, 10, 15, 18],
                        borderColor: '#4ECDC4',
                        tension: 0.4
                    },
                    {
                        label: 'Яндекс Маркет',
                        data: [5, 8, 12, 10, 14],
                        borderColor: '#45B7D1',
                        tension: 0.4
                    }
                ]
            }
        });
    }

    createPurchaseFunnelChart() {
        this.createChart('purchaseFunnelChart', {
            type: 'doughnut',
            data: {
                labels: ['Просмотры', 'В корзине', 'Покупки'],
                datasets: [{
                    data: [100, 60, 30],
                    backgroundColor: ['#4ECDC4', '#45B7D1', '#FF6B6B']
                }]
            }
        });
    }

    createCategoryComparisonChart() {
        const countData = this.getCountByField('category');
        const valueData = this.getTotalValueByCategory();
        
        this.createChart('categoryComparisonChart', {
            type: 'bar',
            data: {
                labels: Object.keys(countData).map(key => this.formatCategoryName(key)),
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
                scales: {
                    y: { type: 'linear', position: 'left' },
                    y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false } }
                }
            }
        });
    }

    // Добавь остальные методы создания графиков по аналогии...

    // ТАБЛИЦЫ
    updateTables() {
        this.updateMarketplaceTable();
        this.updateCategoryTable();
        this.updateProductsTable();
    }

    updateMarketplaceTable() {
        const products = this.getCurrentUserProducts();
        const stats = this.getMarketplaceStats();
        const tableBody = document.querySelector('#marketplaceTable tbody');
        if (!tableBody) return;
        
        const totalProducts = products.length;
        
        tableBody.innerHTML = Object.entries(stats).map(([marketplace, data]) => {
            const percentage = totalProducts > 0 ? ((data.count / totalProducts) * 100).toFixed(1) : 0;
            return `
                <tr>
                    <td>${this.formatMarketplaceName(marketplace)}</td>
                    <td>${data.count}</td>
                    <td>${data.total.toLocaleString('ru-RU')}₽</td>
                    <td>${data.average.toLocaleString('ru-RU', {maximumFractionDigits: 2})}₽</td>
                    <td>${percentage}%</td>
                </tr>
            `;
        }).join('');
    }

    updateCategoryTable() {
        const products = this.getCurrentUserProducts();
        const stats = this.getCategoryStats();
        const tableBody = document.querySelector('#categoryTable tbody');
        if (!tableBody) return;
        
        const totalProducts = products.length;
        
        tableBody.innerHTML = Object.entries(stats).map(([category, data]) => {
            const percentage = totalProducts > 0 ? ((data.count / totalProducts) * 100).toFixed(1) : 0;
            return `
                <tr>
                    <td>${this.formatCategoryName(category)}</td>
                    <td>${data.count}</td>
                    <td>${data.total.toLocaleString('ru-RU')}₽</td>
                    <td>${data.average.toLocaleString('ru-RU', {maximumFractionDigits: 2})}₽</td>
                    <td>${percentage}%</td>
                </tr>
            `;
        }).join('');
    }

    updateProductsTable() {
        const products = this.getCurrentUserProducts();
        const tableBody = document.querySelector('#productsTable tbody');
        if (!tableBody) return;
        
        tableBody.innerHTML = products
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(product => `
            <tr>
                <td>${new Date(product.date).toLocaleDateString('ru-RU')}</td>
                <td>${this.formatMarketplaceName(product.marketplace)}</td>
                <td>${this.formatCategoryName(product.category)}</td>
                <td>${product.name}</td>
                <td>${product.price.toLocaleString('ru-RU')}₽</td>
                <td>${product.rating ? '⭐'.repeat(product.rating) : '-'}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="app.showDeleteModal('${product.id}')">
                        🗑️ Удалить
                    </button>
                </td>
            </tr>
        `).join('');
    }

    getCategoryStats() {
        const products = this.getCurrentUserProducts();
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

    // ФОРМАТИРОВАНИЕ
    formatMarketplaceName(marketplace) {
        const names = {
            'wildberries': 'Wildberries',
            'ozon': 'Ozon',
            'yandex': 'Яндекс Маркет',
            'aliexpress': 'AliExpress',
            'amazon': 'Amazon',
            'sbermegamarket': 'СберМегаМаркет',
            'citilink': 'Citilink',
            'dns': 'DNS',
            'mvideo': 'М.Видео',
            'eldorado': 'Эльдорадо'
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
            'jewelry': 'Украшения',
            'furniture': 'Мебель',
            'tools': 'Инструменты',
            'pet': 'Товары для животных',
            'office': 'Канцелярия'
        };
        return names[category] || category;
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    // ЭКСПОРТ
    exportTable(tableId) {
        const table = document.getElementById(tableId);
        if (!table) return;
        
        const ws = XLSX.utils.table_to_sheet(table);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Таблица');
        XLSX.writeFile(wb, `${tableId}_${new Date().toISOString().split('T')[0]}.xlsx`);
        this.showNotification('✅ Таблица экспортирована в Excel', 'success');
    }

    exportAllData() {
        if (!this.currentUser) return;
        
        const products = this.getCurrentUserProducts();
        const wb = XLSX.utils.book_new();
        
        // Экспорт сводки по маркетплейсам
        const marketplaceStats = this.getMarketplaceStats();
        const marketplaceData = Object.entries(marketplaceStats).map(([marketplace, data]) => ({
            'Маркетплейс': this.formatMarketplaceName(marketplace),
            'Количество товаров': data.count,
            'Общая стоимость': data.total,
            'Средняя цена': data.average,
            'Доля (%)': ((data.count / products.length) * 100).toFixed(1)
        }));
        const marketplaceWs = XLSX.utils.json_to_sheet(marketplaceData);
        XLSX.utils.book_append_sheet(wb, marketplaceWs, 'Маркетплейсы');
        
        // Экспорт сводки по категориям
        const categoryStats = this.getCategoryStats();
        const categoryData = Object.entries(categoryStats).map(([category, data]) => ({
            'Категория': this.formatCategoryName(category),
            'Количество товаров': data.count,
            'Общая стоимость': data.total,
            'Средняя цена': data.average,
            'Доля (%)': ((data.count / products.length) * 100).toFixed(1)
        }));
        const categoryWs = XLSX.utils.json_to_sheet(categoryData);
        XLSX.utils.book_append_sheet(wb, categoryWs, 'Категории');
        
        // Экспорт всех товаров
        const productsData = products.map(product => ({
            'Дата добавления': new Date(product.date).toLocaleDateString('ru-RU'),
            'Дата покупки': product.purchaseDate ? new Date(product.purchaseDate).toLocaleDateString('ru-RU') : '-',
            'Маркетплейс': this.formatMarketplaceName(product.marketplace),
            'Категория': this.formatCategoryName(product.category),
            'Товар': product.name,
            'Цена': product.price,
            'Рейтинг': product.rating || '-',
            'Примечания': product.notes || ''
        }));
        const productsWs = XLSX.utils.json_to_sheet(productsData);
        XLSX.utils.book_append_sheet(wb, productsWs, 'Все товары');
        
        XLSX.writeFile(wb, `product_analytics_${this.currentUser.username}_${new Date().toISOString().split('T')[0]}.xlsx`);
        this.showNotification('✅ Все данные экспортированы в Excel', 'success');
    }

    exportProductsData() {
        if (!this.currentUser) return;
        
        const products = this.getCurrentUserProducts();
        const productsData = products.map(product => ({
            'Дата добавления': new Date(product.date).toLocaleDateString('ru-RU'),
            'Дата покупки': product.purchaseDate ? new Date(product.purchaseDate).toLocaleDateString('ru-RU') : '-',
            'Маркетплейс': this.formatMarketplaceName(product.marketplace),
            'Категория': this.formatCategoryName(product.category),
            'Товар': product.name,
            'Цена': product.price,
            'Рейтинг': product.rating || '-',
            'Примечания': product.notes || ''
        }));
        
        const ws = XLSX.utils.json_to_sheet(productsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Товары');
        XLSX.writeFile(wb, `products_${this.currentUser.username}_${new Date().toISOString().split('T')[0]}.xlsx`);
        this.showNotification('✅ Товары экспортированы в Excel', 'success');
    }

    // УВЕДОМЛЕНИЯ
    showNotification(message, type = 'info') {
        // Удаляем существующие уведомления
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Product Analytics Pro Starting...');
    window.app = new ProductAnalytics();
});
