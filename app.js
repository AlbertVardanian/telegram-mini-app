class ProductAnalytics {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.charts = {};
        this.productsToDelete = null;
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
                products: [
                    {
                        id: this.generateId(),
                        marketplace: 'wildberries',
                        category: 'electronics',
                        name: 'Смартфон Samsung Galaxy S23',
                        price: 74990,
                        date: new Date('2024-01-15').toISOString(),
                        purchaseDate: '2024-01-15',
                        notes: 'Покупка по акции',
                        rating: 5
                    },
                    {
                        id: this.generateId(),
                        marketplace: 'ozon',
                        category: 'books',
                        name: 'Книга "JavaScript для начинающих"',
                        price: 1560,
                        date: new Date('2024-01-20').toISOString(),
                        purchaseDate: '2024-01-18',
                        notes: 'Для изучения программирования',
                        rating: 4
                    },
                    {
                        id: this.generateId(),
                        marketplace: 'yandex',
                        category: 'clothing',
                        name: 'Футболка хлопковая черная',
                        price: 1299,
                        date: new Date('2024-02-01').toISOString(),
                        purchaseDate: '2024-01-28',
                        notes: 'Размер M',
                        rating: 4
                    },
                    {
                        id: this.generateId(),
                        marketplace: 'aliexpress',
                        category: 'electronics',
                        name: 'Наушники беспроводные',
                        price: 3499,
                        date: new Date('2024-02-10').toISOString(),
                        purchaseDate: '2024-02-08',
                        notes: 'Доставка 2 недели',
                        rating: 3
                    },
                    {
                        id: this.generateId(),
                        marketplace: 'wildberries',
                        category: 'home',
                        name: 'Набор кухонных ножей',
                        price: 4590,
                        date: new Date('2024-02-15').toISOString(),
                        purchaseDate: '2024-02-12',
                        notes: 'Отличное качество',
                        rating: 5
                    }
                ]
            };
            
            this.users.push(demoUser);
            this.saveUsers();
        }
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
        document.getElementById('showRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('registerPage');
        });
        
        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('loginPage');
        });

        // Формы аутентификации
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        document.getElementById('registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Демо-вход
        document.getElementById('demoLogin')?.addEventListener('click', () => {
            this.demoLogin();
        });

        // Выход
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });
    }

    setupMainListeners() {
        // Основные кнопки навигации
        document.getElementById('addProductBtn')?.addEventListener('click', () => {
            this.showPage('addProductPage');
        });
        
        document.getElementById('analyticsBtn')?.addEventListener('click', () => {
            this.showPage('analyticsPage');
            setTimeout(() => this.updateAnalytics(), 100);
        });
        
        document.getElementById('manageProductsBtn')?.addEventListener('click', () => {
            this.showPage('manageProductsPage');
            this.loadProductsManagement();
        });

        // Кнопки назад
        document.getElementById('backFromAddBtn')?.addEventListener('click', () => {
            this.showPage('mainPage');
            this.updateStats();
            this.updateRecentProducts();
        });
        
        document.getElementById('backFromAnalyticsBtn')?.addEventListener('click', () => {
            this.showPage('mainPage');
            this.updateStats();
            this.updateRecentProducts();
        });
        
        document.getElementById('backFromManageBtn')?.addEventListener('click', () => {
            this.showPage('mainPage');
            this.updateStats();
            this.updateRecentProducts();
        });

        // Форма добавления товара
        document.getElementById('productForm')?.addEventListener('submit', (e) => {
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
        document.getElementById('searchProducts')?.addEventListener('input', (e) => {
            this.filterProducts(e.target.value);
        });
        
        document.getElementById('sortProducts')?.addEventListener('change', (e) => {
            this.sortProducts(e.target.value);
        });

        // Экспорт товаров
        document.getElementById('exportProductsBtn')?.addEventListener('click', () => {
            this.exportProductsData();
        });
    }

    setupAnalyticsListeners() {
        // Экспорт
        document.getElementById('exportAllBtn')?.addEventListener('click', () => {
            this.exportAllData();
        });

        // Обновление таблиц
        document.getElementById('refreshProducts')?.addEventListener('click', () => {
            this.updateTables();
        });

        // Табы аналитики
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Экспорт таблиц
        document.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tableId = e.target.getAttribute('data-table');
                this.exportTable(tableId);
            });
        });
    }

    setupModalListeners() {
        // Модальное окно удаления
        document.getElementById('confirmDelete')?.addEventListener('click', () => {
            this.confirmDeleteProduct();
        });
        
        document.getElementById('cancelDelete')?.addEventListener('click', () => {
            this.hideDeleteModal();
        });
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
        
        const product = {
            id: this.generateId(),
            marketplace: document.getElementById('marketplace').value,
            category: document.getElementById('category').value,
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('price').value),
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

        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalValue').textContent = `${totalValue.toLocaleString('ru-RU')}₽`;
        document.getElementById('avgPrice').textContent = `${avgPrice.toLocaleString('ru-RU', {maximumFractionDigits: 2})}₽`;
        document.getElementById('totalCategories').textContent = uniqueCategories;
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

        container.innerHTML = products
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(product => `
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
        this.showNotification('✅ Товар успешно удален!', 'success');
    }

    // АНАЛИТИКА
    updateAnalytics() {
        if (!this.currentUser) return;
        
        this.updateAnalyticsStats();
        this.destroyCharts();
        this.updateTabCharts('overview');
        this.updateTables();
    }

    updateAnalyticsStats() {
        const products = this.getCurrentUserProducts();
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, product) => sum + product.price, 0);
        const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;
        const uniqueMarketplaces = new Set(products.map(p => p.marketplace)).size;

        document.getElementById('analyticsTotalProducts').textContent = totalProducts;
        document.getElementById('analyticsTotalValue').textContent = `${totalValue.toLocaleString('ru-RU')}₽`;
        document.getElementById('analyticsAvgPrice').textContent = `${avgPrice.toLocaleString('ru-RU', {maximumFractionDigits: 2})}₽`;
        document.getElementById('analyticsMarketplaces').textContent = uniqueMarketplaces;
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
        
        // Обновляем графики для выбранной вкладки
        this.updateTabCharts(tabName);
    }

    updateTabCharts(tabName) {
        this.destroyCharts();
        
        // Создаем несколько базовых графиков для демонстрации
        this.createBasicCharts();
    }

    createBasicCharts() {
        const products = this.getCurrentUserProducts();
        if (products.length === 0) {
            this.showNotification('📊 Добавьте товары для просмотра аналитики', 'info');
            return;
        }

        // График 1: Распределение по маркетплейсам
        this.createMarketplaceChart();
        
        // График 2: Распределение по категориям
        this.createCategoryChart();
        
        // График 3: Средние цены
        this.createAvgPriceChart();
        
        // График 4: Динамика по месяцам
        this.createMonthlyChart();
    }

    createMarketplaceChart() {
        const products = this.getCurrentUserProducts();
        const data = this.getCountByField('marketplace');
        const ctx = document.getElementById('marketplaceChart');
        if (!ctx) return;
        
        this.charts.marketplace = new Chart(ctx.getContext('2d'), {
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
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    createCategoryChart() {
        const products = this.getCurrentUserProducts();
        const data = this.getCountByField('category');
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;
        
        this.charts.category = new Chart(ctx.getContext('2d'), {
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
        const products = this.getCurrentUserProducts();
        const data = this.getAvgPriceByMarketplace();
        const ctx = document.getElementById('avgPriceChart');
        if (!ctx) return;
        
        this.charts.avgPrice = new Chart(ctx.getContext('2d'), {
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
        const products = this.getCurrentUserProducts();
        const data = this.getMonthlyData();
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;
        
        this.charts.monthly = new Chart(ctx.getContext('2d'), {
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

    destroyCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
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
            'Средняя цена': data.average
        }));
        const marketplaceWs = XLSX.utils.json_to_sheet(marketplaceData);
        XLSX.utils.book_append_sheet(wb, marketplaceWs, 'Маркетплейсы');
        
        // Экспорт сводки по категориям
        const categoryStats = this.getCategoryStats();
        const categoryData = Object.entries(categoryStats).map(([category, data]) => ({
            'Категория': this.formatCategoryName(category),
            'Количество товаров': data.count,
            'Общая стоимость': data.total,
            'Средняя цена': data.average
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
        existingNotifications.forEach(notification => notification.remove());

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
