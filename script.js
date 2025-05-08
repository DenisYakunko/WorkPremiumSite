document.addEventListener('DOMContentLoaded', () => {
    // 1. Мобильное меню (работает на всех страницах)
    const burger = document.getElementById('burger');
    const menu = document.getElementById('menu');
    if (burger && menu) {
        burger.addEventListener('click', () => {
            menu.classList.toggle('active');
        });
    }

// 2. Слайдер (работает только на index.html)
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.prev');
const nextBtn = document.querySelector('.next');

if (slides.length > 0) {
    let currentIndex = 0;
    const intervalTime = 3000;
    let sliderInterval;

    function showSlide(index) {
        // Сдвигаем контейнер слайдов
        const offset = -index * 100;
        document.querySelector('.slides-container').style.transform = `translateX(${offset}%)`;
        
        // Обновляем точки
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        
        currentIndex = index;
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(currentIndex);
    }

    prevBtn.addEventListener('click', () => {
        prevSlide();
        resetInterval();
    });

    nextBtn.addEventListener('click', () => {
        nextSlide();
        resetInterval();
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-slide'));
            showSlide(index);
            resetInterval();
        });
    });

    function startInterval() {
        sliderInterval = setInterval(nextSlide, intervalTime);
    }

    function resetInterval() {
        clearInterval(sliderInterval);
        startInterval();
    }

    // Инициализация
    showSlide(currentIndex);
    startInterval();
}

    // 3. Каталог товаров (работает только на catalog.html)
    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        let currentPage = 1;
        const itemsPerPage = 12;
        let filteredProducts = [];
        let allProducts = [];

        // Загрузка данных
        async function loadProducts() {
            const response = await fetch('data/products.json');
            allProducts = await response.json();
            filteredProducts = [...allProducts];
            renderCategories(allProducts);
            renderProducts(filteredProducts, currentPage);
        }

        // Рендер категорий
        function renderCategories(products) {
            const categories = [...new Set(products.map(p => p.category))];
            const container = document.getElementById('category-filters');
            if (!container) return;

            categories.forEach(cat => {
                const li = document.createElement('li');
                li.innerHTML = `<label><input type="checkbox" class="category-filter" value="${cat}"> ${cat}</label>`;
                container.appendChild(li);
            });

            // Обработчики фильтров
            document.querySelectorAll('.category-filter').forEach(cb => {
                cb.addEventListener('change', applyFilters);
            });
        }

        // Применение фильтров
        function applyFilters() {
            let filtered = [...allProducts];

            // Фильтр по категориям
            const selectedCategories = Array.from(document.querySelectorAll('.category-filter:checked')).map(cb => cb.value);
            if (selectedCategories.length > 0) {
                filtered = filtered.filter(p => selectedCategories.includes(p.category));
            }

            // Фильтр по цене
            const priceRange = document.getElementById('price-range')?.value;
            if (priceRange) {
                filtered = filtered.filter(p => p.price <= priceRange);
            }

            // Фильтр по наличию
            if (document.getElementById('in-stock')?.checked) {
                filtered = filtered.filter(p => p.inStock);
            }

            // Поиск по тексту
            const searchQuery = document.getElementById('search-input')?.value.toLowerCase();
            if (searchQuery) {
                filtered = filtered.filter(p => 
                    p.name.toLowerCase().includes(searchQuery) || 
                    p.description.toLowerCase().includes(searchQuery)
                );
            }

            // Сортировка
            const sortSelect = document.getElementById('sort-select');
            const sortValue = sortSelect?.value;

            if (sortValue === 'priceAsc') {
                filtered.sort((a, b) => a.price - b.price);
            } else if (sortValue === 'priceDesc') {
                filtered.sort((a, b) => b.price - a.price);
            } else if (sortValue === 'popularity') {
                filtered.sort((a, b) => b.description.length - a.description.length);
            }

            renderProducts(filtered, 1); // Сброс на первую страницу
        }

        // Рендер товаров
        function renderProducts(products, page) {
            const container = document.getElementById('product-grid');
            if (!container) return;

            container.innerHTML = '';
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginated = products.slice(start, end);

            paginated.forEach(product => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <img src="${product.images[0]}" alt="${product.name}">
                    <h4>${product.name}</h4>
                    <p>${product.description}</p>
                    <div class="price">${product.price} ₽</div>
                `;
                card.addEventListener('click', () => openModal(product));
                container.appendChild(card);
            });

            updatePagination(products, page);
        }

        // Пагинация
        function updatePagination(products, currentPage) {
            const totalPages = Math.ceil(products.length / itemsPerPage);
            const pageInfo = document.getElementById('page-info');
            const prevBtn = document.getElementById('prev-page');
            const nextBtn = document.getElementById('next-page');

            if (pageInfo) pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;
            if (prevBtn) prevBtn.disabled = currentPage === 1;
            if (nextBtn) nextBtn.disabled = currentPage === totalPages;

            if (prevBtn) {
                prevBtn.onclick = () => {
                    if (currentPage > 1) renderProducts(products, currentPage - 1);
                };
            }

            if (nextBtn) {
                nextBtn.onclick = () => {
                    if (currentPage < totalPages) renderProducts(products, currentPage + 1);
                };
            }
        }

        // Модальное окно
        function openModal(product) {
            const modal = document.getElementById('product-modal');
            if (!modal) return;

            modal.style.display = 'block';

            document.getElementById('modal-title').textContent = product.name;
            document.getElementById('modal-description').textContent = product.description;
            document.getElementById('modal-price').textContent = `${product.price} ₽`;

            const mainImage = document.getElementById('modal-image');
            mainImage.src = product.images[0];

            const thumbnails = document.getElementById('gallery-thumbnails');
            thumbnails.innerHTML = '';
            product.images.forEach((img, index) => {
                const imgEl = document.createElement('img');
                imgEl.src = img;
                imgEl.alt = `Превью ${index + 1}`;
                imgEl.className = index === 0 ? 'active' : '';
                imgEl.addEventListener('click', () => {
                    document.querySelectorAll('.gallery-thumbnails img').forEach(th => th.classList.remove('active'));
                    imgEl.classList.add('active');
                    mainImage.src = img;
                });
                thumbnails.appendChild(imgEl);
            });

            const video = document.getElementById('modal-video');
            video.src = product.video || '';

            document.querySelector('.close-btn').onclick = () => {
                modal.style.display = 'none';
                video.src = '';
            };
        }

        // Сброс фильтров
        const resetBtn = document.getElementById('reset-filters');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                document.querySelectorAll('.category-filter').forEach(cb => cb.checked = false);
                const priceRange = document.getElementById('price-range');
                if (priceRange) priceRange.value = 5000;

                const inStock = document.getElementById('in-stock');
                if (inStock) inStock.checked = false;

                const searchInput = document.getElementById('search-input');
                if (searchInput) searchInput.value = '';

                const sortSelect = document.getElementById('sort-select');
                if (sortSelect) sortSelect.value = 'priceAsc';

                applyFilters();
            });
        }

        // Поиск
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', applyFilters);
        }

        const priceRange = document.getElementById('price-range');
        if (priceRange) {
            priceRange.addEventListener('input', e => {
                document.getElementById('price-value').textContent = `${e.target.value} ₽`;
                applyFilters();
            });
        }

        // Сортировка
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', applyFilters);
        }

        // Инициализация
        loadProducts();
    }
});