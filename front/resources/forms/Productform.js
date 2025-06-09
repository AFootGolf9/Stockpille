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
    const productListContentArea = document.getElementById("product-list-content-area"); // Referência ao novo container
    let allProducts = [];
    let categoryMap = {}; // Mapa para nomes de categorias

    // Carregar categorias para o filtro e para o mapa
    fetch("http://localhost:8080/category", {
        method: "GET",
        headers: { "Authorization": `Bearer ${getToken()}` }
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
                categoryMap[category.id] = category.name; // Adiciona ao mapa
            });
        }
    })
    .catch(error => console.error("Erro ao carregar categorias para o filtro:", error));

    // Carregar produtos
    fetch("http://localhost:8080/item", {
        method: "GET",
        headers: { "Authorization": `Bearer ${getToken()}` }
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
                    headers: { "Authorization": `Bearer ${getToken()}` }
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

    // Listeners para os botões de ação do cabeçalho (removida duplicata)
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

// Revertendo showProductForm para mais próximo do original que você enviou
function showProductForm(productId = null) {
    // HTML do formulário como no original, sem SKU explícito ou botões de cancelar adicionados por mim
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
    `; // SKU não está aqui, será parte do productData enviado, mas não um campo visível/editável (a menos que seu backend o gere ou já exista no item)

    document.getElementById("main-content").innerHTML = formHTML;

    const categorySelect = document.getElementById("category");
    const nameInput = document.getElementById("name"); // Para preencher em modo de edição
    const descriptionInput = document.getElementById("description"); // Para preencher

    fetch("http://localhost:8080/category", {
        method: "GET",
        headers: { "Authorization": `Bearer ${getToken()}` }
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

        if (productId) { // Se for edição, carregar dados do produto
            fetch(`http://localhost:8080/item/${productId}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${getToken()}` }
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
                    // O SKU (productId) é conhecido, mas não há campo para ele no formHTML acima.
                    // Ele será usado na URL do PUT.
                } else {
                    alert("Produto não encontrado para edição.");
                    showProductList();
                }
            })
            .catch(error => console.error("Erro ao carregar dados do produto para edição:", error));
        }
    })
    .catch(error => console.error("Erro ao carregar categorias para o formulário:", error));

    document.getElementById("registerProductBtn").addEventListener("click", function() {
        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;
        const categoryId = document.getElementById("category").value;
        
        // O SKU não é pego do formulário, pois não foi adicionado um campo para ele.
        // Se for um novo produto, o backend deve gerar o SKU.
        // Se for edição, o SKU é `productId`.
        const productData = { name, description, category_id: categoryId };
        if (productId) { // Se for PUT, o backend pode esperar o SKU ou identificá-lo pela URL
            // Se o seu backend PRECISA do SKU no corpo do PUT, você pode adicioná-lo aqui:
            // productData.sku = productId; (Mas geralmente o ID na URL é suficiente)
        }


        const method = productId ? "PUT" : "POST";
        const url = productId ? `http://localhost:8080/item/${productId}` : "http://localhost:8080/item";

        fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify(productData)
        })
        .then(response => {
            if (response.ok) {
                alert(`Produto ${productId ? 'atualizado' : 'cadastrado'} com sucesso!`);
                showProductList();
            } else {
                return response.json().then(data => {
                    throw new Error(`Erro ao ${productId ? 'atualizar' : 'cadastrar'} o produto: ${data.message || 'Erro desconhecido'}`);
                });
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert(error.message);
        });
    });
}

function deleteProduct(productId) {
    const confirmDelete = confirm("Tem certeza que deseja excluir este produto?");
    if (confirmDelete) {
        fetch(`http://localhost:8080/item/${productId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${getToken()}` }
        })
        .then(response => {
            if (response.ok) {
                alert("Produto excluído com sucesso!");
                showProductList();
            } else {
                return response.json().then(data => {
                    throw new Error(`Erro ao excluir o produto: ${data.message || 'Erro desconhecido'}`);
                });
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert(error.message);
        });
    }
}

function showCategoryForm() {
    const formHTML = `
        <h2>Criar Nova Categoria</h2>
        <form id="category-form">
            <div class="form-group">
                <label for="category-name">Nome da Categoria:</label>
                <input type="text" id="category-name" name="category-name" required>
            </div>
            <button type="submit">Criar Categoria</button>
        </form>
        <div id="category-message"></div>
    `;
    document.getElementById("main-content").innerHTML = formHTML;

    const categoryForm = document.getElementById("category-form");
    categoryForm.addEventListener("submit", function(event) {
        event.preventDefault();
        createCategory();
    });
}

async function createCategory() {
    const name = document.getElementById("category-name").value;
    if (!name) {
        alert("Por favor, preencha o nome da categoria.");
        return;
    }
    try {
        const response = await fetch("http://localhost:8080/category", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}`
            },
            body: JSON.stringify({ name: name }),
        });
        const data = await response.json().catch(() => ({})); // Evita erro se não houver corpo JSON
        if (response.ok) {
            alert("Categoria criada com sucesso!" + (data.message ? ` ${data.message}` : ''));
            showProductList();
        } else {
            alert("Erro ao criar categoria: " + (data.message || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error("Erro ao criar categoria:", error);
        alert("Erro ao criar categoria.");
    }
}

// Se showCategoryList não estiver definida em outro lugar, você precisará dela:
// function showCategoryList() { /* ... sua lógica para listar categorias ... */ }