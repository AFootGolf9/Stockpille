function getToken() {
    return localStorage.getItem('token');
}

function showProductList() {
    const productListHTML = `
        <div class="product-section-header">
            <h2>Lista de Produtos</h2>
            <div class="product-header-actions"> 
                <button id="createProductBtn">Criar Produto</button>
                <button id="createCategoryBtn">Criar Categoria</button>
                <button id="listCategoryBtn">Listar Categorias</button>
            </div>
        </div>
        <div class="product-filter"> 
            <input type="text" id="productSearch" placeholder="Pesquisar por Nome/SKU">
            <select id="categoryFilter">
                <option value="">Todas as Categorias</option>
            </select>
        </div>
        <div class="product-table-wrapper"> 
            <div id="product-list-content-area"> 
                <p>Carregando produtos...</p>
            </div>
        </div>
    `;

    document.getElementById("main-content").innerHTML = productListHTML;

    const productSearch = document.getElementById("productSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    const productListContentArea = document.getElementById("product-list-content-area");
    let allProducts = [];
    let categoryMap = {};

    // Carregar categorias para o filtro e mapa
    fetch("http://localhost:8080/category", {
        method: "GET",
        headers: { "Authorization": getToken() }
    })
    .then(response => response.json())
    .then(categoriesData => {
        const categories = categoriesData.data;
        if (categories && Array.isArray(categories)) {
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
                categoryMap[category.id] = category.name;
            });
        }
    })
    .catch(error => console.error("Erro ao carregar categorias para o filtro:", error));

    // Carregar produtos
    fetch("http://localhost:8080/item", {
        method: "GET",
        headers: { "Authorization": getToken() }
    })
    .then(response => response.text())
    .then(text => {
        try {
            const parsedData = tryParseJSON(text);
            if (parsedData && parsedData.data) {
                allProducts = parsedData.data;
                if (Array.isArray(allProducts) && allProducts.length > 0) {
                    renderTable(allProducts);
                    productSearch.addEventListener("input", filterProducts);
                    categoryFilter.addEventListener("change", filterProducts);
                } else {
                    productListContentArea.innerHTML = "<p>Nenhum produto cadastrado.</p>";
                }
            } else {
                productListContentArea.innerHTML = "<p>Nenhum produto encontrado ou formato de dados inválido.</p>";
            }
        } catch (error) {
            console.error("Erro ao analisar o JSON dos produtos:", error);
            productListContentArea.innerHTML = `<p>Erro ao processar dados dos produtos: ${error.message}</p>`;
        }
    })
    .catch(error => {
        console.error("Erro ao carregar produtos:", error);
        productListContentArea.innerHTML = `<p>Erro ao carregar produtos: ${error.message}</p>`;
    });

    function filterProducts() {
        const searchTerm = productSearch.value.toLowerCase();
        const selectedCategory = categoryFilter.value;
        const filteredProducts = allProducts.filter(product => {
            const nameMatches = product.name.toLowerCase().includes(searchTerm) || (product.sku && product.sku.toLowerCase().includes(searchTerm));
            const categoryMatches = selectedCategory === "" || product.category_id == selectedCategory;
            return nameMatches && categoryMatches;
        });
        renderTable(filteredProducts);
    }

    function renderTable(productsToRender) {
        let tableHTML = `
            <table class="product-table">
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Item</th>
                        <th>Categoria</th>
                        <th>Descrição</th>
                        <th>Quantidade</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;
        if (!productsToRender || productsToRender.length === 0) {
            tableHTML += `<tr><td colspan="6" style="text-align:center;">Nenhum produto encontrado.</td></tr>`;
        } else {
            productsToRender.forEach(product => {
                const categoryName = product.category_id ? (categoryMap[product.category_id] || 'Desconhecida') : 'Sem Categoria';
                tableHTML += `
                    <tr>
                        <td>${product.sku || '-'}</td>
                        <td>${product.name}</td>
                        <td>${categoryName}</td>
                        <td>${product.description || '-'}</td>
                        <td id="quantity-${product.sku}">Carregando...</td>
                        <td>
                            <button class="editBtn" data-id="${product.sku}">Editar</button>
                            <button class="deleteBtn" data-id="${product.sku}">Excluir</button>
                        </td>
                    </tr>
                `;

                fetch(`http://localhost:8080/item/quantity/${product.sku}`, {
                    method: "GET",
                    headers: { "Authorization": getToken() }
                })
                .then(response => response.json())
                .then(quantityData => {
                    const quantityCell = document.getElementById(`quantity-${product.sku}`);
                    if (quantityCell) {
                        quantityCell.textContent = quantityData.quantity !== undefined ? quantityData.quantity : "N/D";
                    }
                })
                .catch(error => {
                    console.error(`Erro ao carregar quantidade para SKU ${product.sku}:`, error);
                    const quantityCell = document.getElementById(`quantity-${product.sku}`);
                    if (quantityCell) {
                        quantityCell.textContent = "Erro";
                    }
                });
            });
        }
        tableHTML += `</tbody></table>`;
        productListContentArea.innerHTML = tableHTML;

        const table = productListContentArea.querySelector(".product-table");
        if (table) {
            table.addEventListener("click", function(event) {
                const target = event.target;
                const productId = target.getAttribute("data-id");
                if (target.classList.contains("editBtn")) {
                    showProductForm(productId);
                } else if (target.classList.contains("deleteBtn")) {
                    deleteProduct(productId);
                }
            });
        }
    }

    document.getElementById("createProductBtn").addEventListener("click", function() { showProductForm(); });
    document.getElementById("createCategoryBtn").addEventListener("click", function() { showCategoryForm(); });
    document.getElementById("listCategoryBtn").addEventListener("click", function() { showCategoryList(); });
}

function tryParseJSON(text) {
    try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object') {
            return parsed;
        }
        return null;
    } catch (e) {
        console.error("Falha ao parsear JSON:", e, "Input:", text);
        return null;
    }
}

function showProductForm(productId = null) {
    let formHTML = `
        <h2>${productId ? 'Editar Produto' : 'Cadastrar Produto'}</h2>
        <div class="form-group">
            <label for="name">Nome do Produto:</label>
            <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
            <label for="description">Descrição:</label>
            <textarea id="description" name="description" rows="4" required></textarea>
        </div>
        <div class="form-group">
            <label for="category">Categoria:</label>
            <select id="category" name="category" required>
                <option value="">Selecione a Categoria</option>
            </select>
        </div>
        <div class="form-group">
            <button id="registerProductBtn">${productId ? 'Atualizar Produto' : 'Cadastrar Produto'}</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = formHTML;

    const categorySelect = document.getElementById("category");
    const nameInput = document.getElementById("name");
    const descriptionInput = document.getElementById("description");

    fetch("http://localhost:8080/category", {
        method: "GET",
        headers: { "Authorization": getToken() }
    })
    .then(response => response.json())
    .then(categoriesData => {
        const categories = categoriesData.data;
        if (categories && Array.isArray(categories)) {
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }

        if (productId) {
            fetch(`http://localhost:8080/item/${productId}`, {
                method: "GET",
                headers: { "Authorization": getToken() }
            })
            .then(response => response.json())
            .then(productResponse => {
                const product = productResponse.data;
                if (product) {
                    nameInput.value = product.name || '';
                    descriptionInput.value = product.description || '';
                    if (product.category_id) {
                        categorySelect.value = product.category_id;
                    }
                }
            })
            .catch(error => {
                console.error("Erro ao carregar produto para edição:", error);
            });
        }
    })
    .catch(error => console.error("Erro ao carregar categorias para formulário:", error));

    document.getElementById("registerProductBtn").addEventListener("click", function() {
        const name = nameInput.value.trim();
        const description = descriptionInput.value.trim();
        const category = categorySelect.value;

        if (!name || !description || !category) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        const productData = {
            name: name,
            description: description,
            category_id: category
        };

        let url = "http://localhost:8080/item";
        let method = "POST";
        if (productId) {
            url += `/${productId}`;
            method = "PUT";
        }

        fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": getToken()
            },
            body: JSON.stringify(productData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert("Erro: " + data.error);
            } else {
                alert(productId ? "Produto atualizado com sucesso." : "Produto cadastrado com sucesso.");
                showProductList();
            }
        })
        .catch(error => {
            console.error("Erro ao salvar produto:", error);
            alert("Erro ao salvar produto.");
        });
    });
}

function deleteProduct(productId) {
    if (!confirm("Tem certeza que deseja excluir este produto?")) {
        return;
    }

    fetch(`http://localhost:8080/item/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": getToken() }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert("Erro ao excluir produto: " + data.error);
        } else {
            alert("Produto excluído com sucesso.");
            showProductList();
        }
    })
    .catch(error => {
        console.error("Erro ao excluir produto:", error);
        alert("Erro ao excluir produto.");
    });
}

function showCategoryForm() {
    let formHTML = `
        <h2>Cadastrar Categoria</h2>
        <div class="form-group">
            <label for="categoryName">Nome da Categoria:</label>
            <input type="text" id="categoryName" name="categoryName" required>
        </div>
        <div class="form-group">
            <button id="registerCategoryBtn">Cadastrar Categoria</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = formHTML;

    document.getElementById("registerCategoryBtn").addEventListener("click", function() {
        const name = document.getElementById("categoryName").value.trim();
        if (!name) {
            alert("Por favor, insira o nome da categoria.");
            return;
        }

        fetch("http://localhost:8080/category", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": getToken()
            },
            body: JSON.stringify({ name: name }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert("Erro: " + data.error);
            } else {
                alert("Categoria cadastrada com sucesso.");
                showProductList();
            }
        })
        .catch(error => {
            console.error("Erro ao cadastrar categoria:", error);
            alert("Erro ao cadastrar categoria.");
        });
    });
}

function showCategoryList() {
    let html = `
        <h2>Lista de Categorias</h2>
        <div id="category-list-content-area">Carregando categorias...</div>
    `;

    document.getElementById("main-content").innerHTML = html;

    fetch("http://localhost:8080/category", {
        method: "GET",
        headers: { "Authorization": getToken() }
    })
    .then(response => response.json())
    .then(data => {
        const categories = data.data;
        if (!categories || categories.length === 0) {
            document.getElementById("category-list-content-area").innerHTML = "<p>Nenhuma categoria cadastrada.</p>";
            return;
        }

        let listHTML = `<ul class="category-list">`;
        categories.forEach(category => {
            listHTML += `<li>${category.name}</li>`;
        });
        listHTML += `</ul>`;

        document.getElementById("category-list-content-area").innerHTML = listHTML;
    })
    .catch(error => {
        console.error("Erro ao carregar categorias:", error);
        document.getElementById("category-list-content-area").innerHTML = `<p>Erro ao carregar categorias.</p>`;
    });
}
