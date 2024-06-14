document.addEventListener("DOMContentLoaded", () => {
    const apiUrl = 'https://fakestoreapi.com/products';
    const categoryUrl = 'https://fakestoreapi.com/products/categories';
    const productList = document.getElementById('product-list');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortOptions = document.getElementById('sortOptions');
    const resultCount = document.getElementById('resultCount');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const searchInput = document.getElementById('searchInput');
    const pagination = document.getElementById('pagination');

    let products = [];
    let showLoadingState = true
    let selectedCategories = [];
    const productsPerPage = 6;
    let currentPage = 1;
    let searchQuery = '';

    function showShimmer() {
        productList.innerHTML = `
            <div class="shimmerbg shimmerLoad"></div>
            <div class="shimmerbg shimmerLoad"></div>
            <div class="shimmerbg shimmerLoad"></div>
            <div class="shimmerbg shimmerLoad"></div>
            <div class="shimmerbg shimmerLoad"></div>
            <div class="shimmerbg shimmerLoad"></div>
        `;
    }

    function hideShimmer() {
        productList.innerHTML = '';
    }


    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (!data || !Array.isArray(data)) {
                throw new Error('Invalid data format');
            }
            products = data;
            showLoadingState = false
            filterAndDisplayProducts();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            productList.innerHTML = '<div class="error"><p class="errormessage"><img src="./images/robot.png" />Error fetching products. Please try again later.</p></div>';
        });

    fetch(categoryUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(categories => {
            if (!categories || !Array.isArray(categories)) {
                throw new Error('Invalid categories format');
            }
            categories.forEach(category => {
                const label = document.createElement('label');
                label.innerHTML = `
                    <input type="checkbox" class="filter" value="${category}"> ${category}
                `;
                categoryFilter.appendChild(label);
            });

            const filters = document.querySelectorAll('.filter');
            filters.forEach(filter => {
                filter.addEventListener('change', (event) => {
                    if (event.target.checked) {
                        selectedCategories.push(event.target.value);
                    } else {
                        selectedCategories = selectedCategories.filter(cat => cat !== event.target.value);
                    }
                    currentPage = 1;
                    filterAndDisplayProducts();
                });
            });
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
            categoryFilter.innerHTML = '<div class="catergoryerror><p><img src="./images/robot.png" />Error fetching products. Please try again later.</p></div>';
        });

    function displayProducts(filteredProducts, append = false) {
        if (!append) {
            productList.innerHTML = '';
        }
        const startIndex = (currentPage - 1) * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        const productsToDisplay = filteredProducts.slice(startIndex, endIndex);

        if (productsToDisplay.length === 0 && currentPage === 1) {
            productList.innerHTML = '<p class="error">No products found.</p>';
        } else {
            productsToDisplay.forEach(product => {
                const listItem = document.createElement('div');
                listItem.classList.add('item');
                listItem.innerHTML = `
                    <div class="productImg">
                        <img src="${product.image}" alt="${product.title}">
                    </div>
                    <div class="productInfo">
                        <h3>${product.title}</h3>
                        <h4>$${product.price}</h4>
                        <p>${product.description}</p>
                        <div class="like"><img src="./images/like.png" /></div>
                    </div>
                `;
                productList.appendChild(listItem);
            });
        }

        resultCount.textContent = `${filteredProducts.length} Results`;
        loadMoreBtn.style.display = (endIndex < filteredProducts.length) ? 'block' : 'none';
        updatePagination(filteredProducts.length);
    }

    function updatePagination(totalProducts) {
        pagination.innerHTML = '';
        const totalPages = Math.ceil(totalProducts / productsPerPage);

        if (totalPages <= 1) return;

        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Previous';
            prevButton.addEventListener('click', () => {
                currentPage--;
                filterAndDisplayProducts();
            });
            pagination.appendChild(prevButton);
        }

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => {
                currentPage = i;
                filterAndDisplayProducts();
            });
            pagination.appendChild(pageButton);
        }

        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', () => {
                currentPage++;
                filterAndDisplayProducts();
            });
            pagination.appendChild(nextButton);
        }
    }

    function filterAndDisplayProducts() {
        showShimmer();
        let filteredProducts = products;

        if (selectedCategories.length > 0) {
            filteredProducts = filteredProducts.filter(product => selectedCategories.includes(product.category));
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            filteredProducts = filteredProducts.filter(product => product.title.toLowerCase().includes(lowercasedQuery));
        }

        const sortOption = sortOptions.value;
        if (sortOption === 'price-asc') {
            filteredProducts.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price-desc') {
            filteredProducts.sort((a, b) => b.price - a.price);
        }

        displayProducts(filteredProducts);
    }

    loadMoreBtn.addEventListener('click', () => {
        currentPage++;
        filterAndDisplayProducts();
    });

    sortOptions.addEventListener('change', () => {
        currentPage = 1;
        filterAndDisplayProducts();
    });

    searchInput.addEventListener('input', (event) => {
        searchQuery = event.target.value;
        currentPage = 1;
        filterAndDisplayProducts();
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            searchQuery = event.target.value;
            currentPage = 1;
            filterAndDisplayProducts();
        }
    });
});
