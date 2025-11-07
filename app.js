class ProductAnalytics {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
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
                id: 'demo',
                username: 'demo',
                email: 'demo@example.com',
                password: 'demo123',
                createdAt: new Date().toISOString(),
                products: [
                    {
                        id: '1',
                        marketplace: 'wildberries',
                        category: 'electronics',
                        name: 'Смартфон Samsung',
                        price: 25000,
                        date: new Date().toISOString()
                    },
                    {
                        id: '2',
                        marketplace: 'ozon',
                        category: 'books',
                        name: 'Книга по программированию',
                        price: 1500,
                        date: new Date().toISOString()
                    }
                ]
            };
            this.users.push(demoUser);
            localStorage.setItem('users', JSON.stringify(this.users));
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Аутентификация
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
        
        document.getElementById('demoLogin').addEventListener('click', () => {
            this.demoLogin();
        });
        
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
        
        // Навигация
        document.getElementById('goToRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('registerPage');
        });
        
        document.getElementById('goToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showPage('loginPage');
        });
        
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.showPage('addProductPage');
        });
        
        document.getElementById('analyticsBtn').addEventListener('click', () => {
            this.showPage('analyticsPage');
            this.updateAnalytics();
        });
        
        document.getElementById('backFromAddBtn').addEventListener('click', () => {
            this.showPage('mainPage');
            this.updateStats();
        });
        
        document.getElementById('backFromAnalyticsBtn').addEventListener('click', () => {
            this.showPage('mainPage');
            this.updateStats();
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
        
        console.log('Event listeners setup complete');
    }

    checkAuth() {
        if (this.currentUser) {
            this.showPage('mainPage');
            this.updateStats();
            this.updateUserWelcome();
        } else {
            this.showPage('loginPage');
        }
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        const user = this.users.find(u => u.username === username && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.showPage('mainPage');
            this.updateStats();
            this.updateUserWelcome();
            this.showNotification('Вход выполнен успешно!', 'success');
        } else {
            this.showNotification('Неверные данные для входа!', 'error');
        }
    }

    demoLogin() {
        document.getElementById('username').value = 'demo';
        document.getElementById('password').value = 'demo123';
        this.handleLogin();
    }

    handleRegister() {
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        if (password !== confirmPassword) {
            this.showNotification('Пароли не совпадают!', 'error');
            return;
        }

        if (this.users.find(u => u.username === username)) {
            this.showNotification('Пользователь уже существует!', 'error');
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password,
            createdAt: new Date().toISOString(),
            products: []
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));
        
        this.showNotification('Аккаунт создан! Теперь войдите.', 'success');
        this.showPage('loginPage');
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showPage('loginPage');
        this.showNotification('Вы вышли из системы', 'success');
    }

    updateUserWelcome() {
        const welcome = document.getElementById('userWelcome');
        if (welcome && this.currentUser) {
            welcome.textContent = `Добро пожаловать, ${this.currentUser.username}!`;
        }
    }

    updateStats() {
        if (!this.currentUser) return;
        
        const products = this.currentUser.products || [];
        const totalProducts = products.length;
        const totalValue = products.reduce((sum, p) => sum + p.price, 0);
        const avgPrice = totalProducts > 0 ? totalValue / totalProducts : 0;

        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalValue').textContent = `${totalValue.toFixed(2)}₽`;
        document.getElementById('avgPrice').textContent = `${avgPrice.toFixed(2)}₽`;
    }

    addProduct() {
        if (!this.currentUser) return;

        const product = {
            id: Date.now().toString(),
            marketplace: document.getElementById('marketplace').value,
            category: document.getElementById('category').value,
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('price').value),
            date: new Date().toISOString()
        };

        this.currentUser.products.push(product);
        
        // Обновляем пользователя в базе
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('users', JSON.stringify(this.users));
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        }

        document.getElementById('productForm').reset();
        this.showPage('mainPage');
        this.updateStats();
        this.showNotification('Товар добавлен!', 'success');
    }

    updateAnalytics() {
        if (!this.currentUser) return;

        this.updateCharts();
        this.updateTables();
    }

    updateCharts() {
        const products = this.currentUser.products || [];
        
        // Chart 1: Marketplace distribution
        const marketplaceData = this.getCountByField(products, 'marketplace');
        const marketplaceCtx = document.getElementById('marketplaceChart').getContext('2d');
        
        new Chart(marketplaceCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(marketplaceData).map(this.formatMarketplaceName),
                datasets: [{
                    data: Object.values(marketplaceData),
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
                }]
            }
        });

        // Chart 2: Category distribution
        const categoryData = this.getCountByField(products, 'category');
        const categoryCtx = document.getElementById('categoryChart').getContext('2d');
        
        new Chart(categoryCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(categoryData).map(this.formatCategoryName),
                datasets: [{
                    data: Object.values(categoryData),
                    backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
                }]
            }
        });
    }

    updateTables() {
        const products = this.currentUser.products || [];
        const tableBody = document.querySelector('#productsTable tbody');
        
        tableBody.innerHTML = products.map(product => `
            <tr>
                <td>${new Date(product.date).toLocaleDateString()}</td>
                <td>${this.formatMarketplaceName(product.marketplace)}</td>
                <td>${this.formatCategoryName(product.category)}</td>
                <td>${product.name}</td>
                <td>${product.price.toFixed(2)}₽</td>
            </tr>
        `).join('');
    }

    getCountByField(products, field) {
        return products.reduce((acc, product) => {
            acc[product[field]] = (acc[product[field]] || 0) + 1;
            return acc;
        }, {});
    }

    formatMarketplaceName(marketplace) {
        const names = {
            'wildberries': 'Wildberries',
            'ozon': 'Ozon',
            'yandex': 'Яндекс Маркет',
            'aliexpress': 'AliExpress'
        };
        return names[marketplace] || marketplace;
    }

    formatCategoryName(category) {
        const names = {
            'electronics': 'Электроника',
            'clothing': 'Одежда',
            'books': 'Книги',
            'home': 'Дом и сад'
        };
        return names[category] || category;
    }

    exportAllData() {
        if (!this.currentUser) return;
        
        const products = this.currentUser.products || [];
        const data = products.map(product => ({
            'Дата': new Date(product.date).toLocaleDateString(),
            'Маркетплейс': this.formatMarketplaceName(product.marketplace),
            'Категория': this.formatCategoryName(product.category),
            'Товар': product.name,
            'Цена': product.price
        }));
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Товары');
        XLSX.writeFile(wb, `товары_${this.currentUser.username}.xlsx`);
        
        this.showNotification('Данные экспортированы!', 'success');
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, starting app...');
    window.app = new ProductAnalytics();
});
