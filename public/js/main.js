let categories = [];
let currentCategory = null;
let allApis = [];
let filteredApis = [];

window.tryApi = (category, apiPath) => {
    const fullUrl = `/api/${category}${apiPath}`;
    window.open(fullUrl, '_blank');
};

window.copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.createElement('div');
        toast.textContent = 'Copied to clipboard!';
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.right = '20px';
        toast.style.background = '#3b82f6';
        toast.style.color = 'white';
        toast.style.padding = '10px 20px';
        toast.style.borderRadius = '5px';
        toast.style.zIndex = '1000';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    });
};

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();

    const categoryList = document.getElementById('categoryList');
    const activeCategoryName = document.getElementById('activeCategoryName');
    const categoryTitle = document.getElementById('categoryTitle');
    const categoryDesc = document.getElementById('categoryDesc');
    const apiGrid = document.getElementById('apiGrid');
    const searchInput = document.getElementById('searchInput');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const categoryBtn = document.getElementById('categoryBtn');
    const menuToggle = document.getElementById('menuToggle');
    const navActions = document.getElementById('navActions');
    const header = document.querySelector('.header');

    const toggleTheme = () => {
        const body = document.body;
        if (body.classList.contains('light-theme')) {
            body.classList.replace('light-theme', 'dark-theme');
            themeIcon.setAttribute('data-lucide', 'sun');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.replace('dark-theme', 'light-theme');
            themeIcon.setAttribute('data-lucide', 'moon');
            localStorage.setItem('theme', 'light');
        }
        lucide.createIcons();
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.replace('light-theme', 'dark-theme');
        themeIcon.setAttribute('data-lucide', 'sun');
        lucide.createIcons();
    }

    themeToggle.addEventListener('click', toggleTheme);

    const handleScroll = () => {
        if (!header) return;
        if (window.scrollY > 10) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    const updateMenuIcon = () => {
        const iconEl = menuToggle.querySelector('i');
        if (!iconEl) return;
        const isOpen = navActions.classList.contains('mobile-visible');
        iconEl.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
        lucide.createIcons();
    };

    const closeDropdown = () => {
        categoryList.classList.remove('show');
        document.body.style.overflow = '';
    };

    const closeMenu = () => {
        navActions.classList.remove('mobile-visible');
        navActions.classList.add('mobile-hidden');
        closeDropdown();
        updateMenuIcon();
    };

    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        navActions.classList.toggle('mobile-visible');
        navActions.classList.toggle('mobile-hidden');
        updateMenuIcon();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.menu-toggle') && !e.target.closest('.nav-actions')) {
            closeMenu();
        }
    });

    categoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isOpen = categoryList.classList.contains('show');
        if (isOpen) {
            closeDropdown();
        } else {
            categoryList.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    });

    categoryList.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            closeDropdown();
        }
    });

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/categories');
            categories = response.data;
            renderCategories();
            if (categories.length > 0) {
                selectCategory(categories[0]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const renderCategories = () => {
        categoryList.innerHTML = categories.map(cat => `
            <a href="#" class="category-item" data-name="${cat.name}">${cat.name}</a>
        `).join('');

        categoryList.querySelectorAll('.category-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const name = e.currentTarget.getAttribute('data-name');
                const category = categories.find(c => c.name === name);
                selectCategory(category);
                categoryList.classList.remove('show');
                if (window.innerWidth <= 768) {
                    navActions.classList.remove('mobile-visible');
                    navActions.classList.add('mobile-hidden');
                    updateMenuIcon();
                }
            });
        });
    };

    const selectCategory = async (category) => {
        currentCategory = category;
        activeCategoryName.textContent = category.name;
        categoryTitle.textContent = `${category.name} APIs`;
        categoryDesc.textContent = category.description;
        await fetchEndpoints(category.name);
    };

    const fetchEndpoints = async (categoryName) => {
        try {
            apiGrid.innerHTML = '<div class="loading">Loading APIs...</div>';
            const response = await axios.get(`/api/endpoints/${categoryName}`);
            allApis = response.data;
            filterAndRenderApis();
        } catch (error) {
            console.error('Error fetching endpoints:', error);
            apiGrid.innerHTML = '<div class="error">Failed to load APIs</div>';
        }
    };

    const filterAndRenderApis = () => {
        const query = searchInput.value.toLowerCase();
        filteredApis = allApis.filter(api => 
            api.title.toLowerCase().includes(query) || 
            api.path.toLowerCase().includes(query)
        );
        renderApis();
    };

    const renderApis = () => {
        if (filteredApis.length === 0) {
            apiGrid.innerHTML = '<div class="no-results">No APIs found matching your search.</div>';
            return;
        }

        apiGrid.innerHTML = filteredApis.map(api => {
            const fullApiUrl = `/api/${currentCategory.name}${api.path}`;
            const methodClass = `method-${api.method.toLowerCase()}`;
            
            return `
            <div class="api-card api-card-animated">
                <div class="api-card-header">
                    <div class="api-card-title">
                        <h3>${api.title}</h3>
                        <code class="text-xs text-muted-foreground font-mono">${api.path}</code>
                    </div>
                    <span class="method-badge ${methodClass}">${api.method}</span>
                </div>
                <div class="api-card-body">
                    ${api.query && api.query.length > 0 ? `
                        <div class="space-y-1">
                            <p class="text-xs font-semibold text-muted-foreground">Query Parameters:</p>
                            <div class="query-params">
                                ${api.query.map(q => `<span class="badge">${q}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="space-y-1">
                        <p class="text-xs font-semibold text-muted-foreground">Endpoint:</p>
                        <div class="endpoint-box">
                            <code>${fullApiUrl}</code>
                            <button class="copy-btn" onclick="copyToClipboard('${fullApiUrl}')" title="Copy endpoint">
                                <i data-lucide="copy" style="width: 14px; height: 14px;"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="api-card-footer">
                    <button class="btn btn-outline btn-sm w-full" onclick="tryApi('${currentCategory.name}', '${api.path}')">
                        <i data-lucide="external-link"></i> Try API
                    </button>
                </div>
            </div>
            `;
        }).join('');
        lucide.createIcons();
        animateApiCards();
    };

    const animateApiCards = () => {
        const cards = apiGrid.querySelectorAll('.api-card-animated');
        cards.forEach((card, index) => {
            card.classList.remove('is-visible');
            const delay = 40 * index;
            setTimeout(() => {
                card.classList.add('is-visible');
            }, delay);
        });
    };

    searchInput.addEventListener('input', () => {
        filterAndRenderApis();
        setTimeout(animateApiCards, 0);
    });

    if (window.innerWidth <= 768) {
        navActions.classList.add('mobile-hidden');
        navActions.classList.remove('mobile-visible');
        updateMenuIcon();
    }

    fetchCategories();
});
