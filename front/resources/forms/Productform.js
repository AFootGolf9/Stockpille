function getToken() {
    // Aqui você pode buscar o token do localStorage ou de um cookie, conforme sua implementação
    return localStorage.getItem('token'); // Exemplo de token armazenado no localStorage
}

function showProductList() {
    const productListHTML = `
        <div class="product-header">
            <h2>Lista de Produtos</h2>
            <div class="product-filter">
                <input type="text" id="productSearch" placeholder="Pesquisar por Nome/SKU">
                <select id="categoryFilter">
                    <option value="">Todas as Categorias</option>
                </select>
            </div>
            <button id="createProductBtn">Criar</button>
            <button id="createCategoryBtn">Criar Categoria</button>
            <button id="listCategoryBtn">Listar Categorias</button>
        </div>
        <div id="product-list" class="product-list">
            <p>Carregando produtos...</p>
        </div>
    `;

    document.getElementById("main-content").innerHTML = productListHTML;
document.getElementById("listCategoryBtn").addEventListener("click", function() {
    showCategoryList();
});
    const productSearch = document.getElementById("productSearch");
    const categoryFilter = document.getElementById("categoryFilter");
    let allProducts = []; // Variável para armazenar todos os produtos carregados

    // Carregar as categorias no filtro
    fetch("http://localhost:8080/category", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${getToken()}` // Incluindo o token no cabeçalho
        }
    })
    .then(response => response.json())
    .then(categoriesData => {
        const categories = categoriesData.data;
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    })
    .catch(error => console.error("Erro ao carregar categorias para o filtro:", error));

    fetch("http://localhost:8080/item", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${getToken()}` // Incluindo o token no cabeçalho
        }
    })
    .then(response => response.text())
    .then(text => {
        console.log("Resposta do servidor:", text);
        try {
            const parsedData = tryParseJSON(text);
            if (parsedData) {
                allProducts = parsedData.data; // Armazenar todos os produtos
                const productListContainer = document.getElementById("product-list");

                if (Array.isArray(allProducts) && allProducts.length > 0) {
                    renderTable(allProducts); // Renderizar a tabela inicialmente com todos os produtos

                    // Adicionar listeners para pesquisa e filtro
                    productSearch.addEventListener("input", filterProducts);
                    categoryFilter.addEventListener("change", filterProducts);

                    function filterProducts() {
                        const searchTerm = productSearch.value.toLowerCase();
                        const selectedCategory = categoryFilter.value;

                        const filteredProducts = allProducts.filter(product => {
                            const nameMatches = product.name.toLowerCase().includes(searchTerm) || product.sku.toLowerCase().includes(searchTerm);
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

                        productsToRender.forEach(product => {
                            tableHTML += `
                                <tr>
                                    <td>${product.sku}</td>
                                    <td>${product.name}</td>
                                    <td id="category-name-${product.sku}">Carregando...</td>
                                    <td>${product.description}</td>
                                    <td id="quantity-${product.sku}">Carregando...</td>
                                    <td>
                                        <button class="editBtn" data-id="${product.sku}">Editar</button>
                                        <button class="deleteBtn" data-id="${product.sku}">Excluir</button>
                                    </td>
                                </tr>
                            `;

                            // Requisição para quantidade de cada item
                            fetch(`http://localhost:8080/item/quantity/${product.sku}`, {
                                method: "GET",
                                headers: {
                                    "Authorization": `Bearer ${getToken()}` // Incluindo o token no cabeçalho
                                }
                            })
                            .then(response => response.json())
                            .then(quantityData => {
                                document.getElementById(`quantity-${product.sku}`).textContent = quantityData.quantity;
                            })
                            .catch(error => {
                                console.error("Erro ao carregar quantidade:", error);
                                document.getElementById(`quantity-${product.sku}`).textContent = "Erro";
                            });

                            // Requisição para o nome da categoria
                            if (product.category_id) {
                                fetch(`http://localhost:8080/category/${product.category_id}`, {
                                    method: "GET",
                                    headers: {
                                        "Authorization": `Bearer ${getToken()}` // Incluindo o token no cabeçalho
                                    }
                                })
                                .then(response => response.json())
                                .then(categoryData => {
                                    document.getElementById(`category-name-${product.sku}`).textContent = categoryData.data ? categoryData.data.name : 'Sem Categoria';
                                })
                                .catch(error => {
                                    console.error("Erro ao carregar categoria:", error);
                                    document.getElementById(`category-name-${product.sku}`).textContent = "Erro";
                                });
                            } else {
                                document.getElementById(`category-name-${product.sku}`).textContent = 'Sem Categoria';
                            }
                        });

                        tableHTML += `
                                </tbody>
                            </table>
                        `;
                        productListContainer.innerHTML = tableHTML;

                        // Delegação de eventos para os botões (necessário refazer após cada renderização)
                        const table = productListContainer.querySelector("table");
                        if (table) {
                            table.addEventListener("click", function(event) {
                                const target = event.target;

                                if (target.classList.contains("editBtn")) {
                                    const productId = target.getAttribute("data-id");
                                    showProductForm(productId);
                                }

                                if (target.classList.contains("deleteBtn")) {
                                    const productId = target.getAttribute("data-id");
                                    deleteProduct(productId);
                                }
                            });
                        }
                    }
                } else {
                    productListContainer.innerHTML = "<p>Nenhum produto cadastrado.</p>";
                }
            } else {
                throw new Error("Formato de resposta inválido");
            }
        } catch (error) {
            console.error("Erro ao analisar o JSON:", error);
            document.getElementById("product-list").innerHTML = `<p>Erro ao carregar produtos: ${error.message}</p>`;
        }
    })
    .catch(error => {
        console.error("Erro ao carregar produtos:", error);
        document.getElementById("product-list").innerHTML = `<p>Erro ao carregar produtos: ${error.message}</p>`;
    });

    document.getElementById("createProductBtn").addEventListener("click", function() {
        showProductForm();
    });

    document.getElementById("createCategoryBtn").addEventListener("click", function() {
        showCategoryForm(); 
    });
    document.getElementById("listCategoryBtn").addEventListener("click", function() {
    showCategoryList();
});
}

function tryParseJSON(text) {
    try {
        const parsed = JSON.parse(text);
        return parsed;
    } catch (e) {
        console.error("Falha ao parsear JSON:", e);
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

    fetch("http://localhost:8080/category", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${getToken()}` // Incluindo o token no cabeçalho
        }
    })
    .then(response => response.json())
    .then(categoriesData => {
        const categories = categoriesData.data;
        categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });

        if (productId) {
            fetch(`http://localhost:8080/item/${productId}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${getToken()}` // Incluindo o token no cabeçalho
                }
            })
            .then(response => response.json())
            .then(productData => {
                const product = productData.data;
                if (product && product.category_id) {
                    categorySelect.value = product.category_id;
                }
            })
            .catch(error => console.error("Erro ao carregar dados do produto para edição:", error));
        }
    })
    .catch(error => console.error("Erro ao carregar categorias:", error));

    document.getElementById("registerProductBtn").addEventListener("click", function() {
        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;
        const categoryId = document.getElementById("category").value;
        const productData = { name, description, category_id: categoryId };

        const method = productId ? "PUT" : "POST";
        const url = productId ? `http://localhost:8080/item/${productId}` : "http://localhost:8080/item";

        fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${getToken()}` // Incluindo o token no cabeçalho
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
            headers: {
                "Authorization": `Bearer ${getToken()}` // Incluindo o token no cabeçalho
            }
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
        createCategory(); // Chamar a função para criar a categoria
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
                "Authorization": `Bearer ${getToken()}` // Incluindo o token no cabeçalho
            },
            body: JSON.stringify({ name: name }),
        });

        const data = await response.json();
        if (response.ok) {
            alert("Categoria criada com sucesso!");
            showProductList(); // Voltar à lista de produtos após criar a categoria
        } else {
            alert("Erro ao criar categoria: " + (data.message || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error("Erro ao criar categoria:", error);
        alert("Erro ao criar categoria.");
    }
}