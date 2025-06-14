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

    // Primeiro: carregar categorias
    fetch("http://localhost:8080/category", {
        method: "GET",
        headers: { "Authorization": getCookie("token") }
    })
    .then(res => res.json())
    .then(categoriesData => {
        const categories = categoriesData.data;
        if (Array.isArray(categories)) {
            categories.forEach(cat => {
                const option = document.createElement("option");
                option.value = cat.id;
                option.textContent = cat.name;
                categoryFilter.appendChild(option);
                categoryMap[cat.id] = cat.name;
            });
        }

        // Só depois de carregar as categorias, carregar os produtos
        return fetch("http://localhost:8080/item", {
            method: "GET",
            headers: { "Authorization": getCookie("token") }
        });
    })
    .then(res => res.text())
    .then(text => {
        const parsed = tryParseJSON(text);
        if (parsed?.data) {
            allProducts = parsed.data;
            if (allProducts.length > 0) {
                renderTable(allProducts);
                productSearch.addEventListener("input", filterProducts);
                categoryFilter.addEventListener("change", filterProducts);
            } else {
                productListContentArea.innerHTML = "<p>Nenhum produto cadastrado.</p>";
            }
        } else {
            productListContentArea.innerHTML = "<p>Formato de dados inválido.</p>";
        }
    })
    .catch(err => {
        console.error("Erro ao carregar dados:", err);
        productListContentArea.innerHTML = `<p>Erro: ${err.message}</p>`;
    });

    function filterProducts() {
        const term = productSearch.value.toLowerCase();
        const catId = categoryFilter.value;
        const filtered = allProducts.filter(p => {
            const nameStr = p.name ? p.name.toLowerCase() : "";
            const skuStr = p.sku != null ? String(p.sku).toLowerCase() : "";
            const nameMatch = nameStr.includes(term) || skuStr.includes(term);
            const catMatch = !catId || p.category_id == catId;
            return nameMatch && catMatch;
        });
        renderTable(filtered);
    }

    function renderTable(products) {
        let html = `
            <table class="product-table">
                <thead><tr>
                    <th>SKU</th><th>Item</th><th>Categoria</th>
                    <th>Descrição</th><th>Quantidade</th><th>Ações</th>
                </tr></thead><tbody>
        `;
        if (!products.length) {
            html += `<tr><td colspan="6" style="text-align:center">Nenhum produto encontrado.</td></tr>`;
        } else {
            products.forEach(p => {
                const catName = p.category_id ? (categoryMap[p.category_id] || 'Desconhecida') : 'Sem Categoria';
                html += `
                    <tr>
                        <td>${p.sku || '-'}</td>
                        <td>${p.name}</td>
                        <td>${catName}</td>
                        <td>${p.description || '-'}</td>
                        <td id="quantity-${p.sku}">Carregando...</td>
                        <td>
                            <button class="editBtn" data-id="${p.sku}">Editar</button>
                            <button class="deleteBtn" data-id="${p.sku}">Excluir</button>
                        </td>
                    </tr>`;
            });
        }
        html += "</tbody></table>";
        productListContentArea.innerHTML = html;

        // Buscar quantidades
        products.forEach(p => {
            fetch(`http://localhost:8080/item/quantity/${p.sku}`, {
                method: "GET",
                headers: { "Authorization": getCookie("token") }
            })
            .then(res => res.json())
            .then(qtd => {
                const cell = document.getElementById(`quantity-${p.sku}`);
                if (cell) cell.textContent = qtd.quantity ?? "N/D";
            })
            .catch(err => {
                console.error(`Erro quantidade ${p.sku}:`, err);
                const cell = document.getElementById(`quantity-${p.sku}`);
                if (cell) cell.textContent = "Erro";
            });
        });

        // Eventos de edição/exclusão
        document.querySelector(".product-table").addEventListener("click", e => {
            const id = e.target.getAttribute("data-id");
            if (e.target.classList.contains("editBtn")) showProductForm(id);
            if (e.target.classList.contains("deleteBtn")) deleteProduct(id);
        });
    }

    document.getElementById("createProductBtn").addEventListener("click", () => showProductForm());
    document.getElementById("createCategoryBtn").addEventListener("click", showCategoryForm);
    document.getElementById("listCategoryBtn").addEventListener("click", showCategoryList);
}

function tryParseJSON(text) {
    try {
        const obj = JSON.parse(text);
        return (obj && typeof obj === 'object') ? obj : null;
    } catch {
        console.error("JSON inválido:", text);
        return null;
    }
}

function showProductForm(productId = null) {
    const isEdit = Boolean(productId);
    let currentSku = null;
    let currentUserId = null;

    document.getElementById("main-content").innerHTML = `
        <h2>${isEdit ? 'Editar Produto' : 'Cadastrar Produto'}</h2>
        <div class="form-group"><label>Nome:</label><input id="name" required></div>
        <div class="form-group"><label>Descrição:</label><textarea id="description" rows="4" required></textarea></div>
        <div class="form-group">
            <label>Categoria:</label>
            <select id="category" required><option value="">Selecione</option></select>
        </div>
        <button id="registerProductBtn">${isEdit ? 'Atualizar' : 'Cadastrar'}</button>
    `;

    const nameInput = document.getElementById("name");
    const descInput = document.getElementById("description");
    const catSelect = document.getElementById("category");

    fetch("http://localhost:8080/category", {
        method: "GET",
        headers: { "Authorization": getCookie("token") }
    })
    .then(res => res.json())
    .then(cats => {
        cats.data?.forEach(cat => {
            const opt = new Option(cat.name, cat.id);
            catSelect.add(opt);
        });

        if (isEdit) {
            fetch(`http://localhost:8080/item/${productId}`, {
                method: "GET",
                headers: { "Authorization": getCookie("token") }
            })
            .then(res => res.json())
            .then(prod => {
                const item = prod.data;
                nameInput.value = item.name || '';
                descInput.value = item.description || '';
                catSelect.value = item.category_id || '';
                currentSku = item.sku;
                currentUserId = item.user_id;
            })
            .catch(err => alert("Erro ao carregar produto: " + err.message));
        }
    })
    .catch(err => alert("Erro categorias: " + err.message));

    document.getElementById("registerProductBtn").addEventListener("click", () => {
        const name = nameInput.value.trim();
        const desc = descInput.value.trim();
        const catId = catSelect.value;

        if (!name || !desc || !catId) {
            alert("Preencha todos os campos.");
            return;
        }

        const data = {
            name,
            description: desc,
            category_id: parseInt(catId)
        };

        let url = "http://localhost:8080/item";
        let method = "POST";

        if (isEdit) {
            if (!currentSku || !currentUserId) {
                alert("Erro interno: dados do produto não carregados.");
                return;
            }

            data.sku = parseInt(currentSku);
            data.user_id = parseInt(currentUserId);

            url += `/${productId}`;
            method = "PUT";
        }

        fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": getCookie("token")
            },
            body: JSON.stringify(data)
        })
        .then(res => {
            if (!res.ok) throw new Error("Erro ao salvar produto.");
            alert("Produto salvo com sucesso!");
            showProductList();
        })
        .catch(err => alert(err.message));
    });
}
function deleteProduct(productId) {
    if (!confirm("Excluir produto?")) return;
    fetch(`http://localhost:8080/item/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": getCookie("token") }
    })
    .then(res => {
        if (!res.ok) throw new Error("Falha ao excluir");
        alert("Produto excluído!");
        showProductList();
    })
    .catch(err => alert(err.message));
}

function showCategoryForm() {
    document.getElementById("main-content").innerHTML = `
        <h2>Cadastrar Categoria</h2>
        <div class="form-group"><label>Nome:</label><input id="name" required></div>
        <button id="registerCategoryBtn">Cadastrar</button>
    `;
    document.getElementById("registerCategoryBtn").addEventListener("click", () => {
        const name = document.getElementById("name").value.trim();
        if (!name) return alert("Nome é obrigatório.");
        fetch("http://localhost:8080/category", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": getCookie("token")
            },
            body: JSON.stringify({ name })
        })
        .then(res => {
            if (!res.ok) throw new Error("Falha ao cadastrar");
            alert("Categoria cadastrada!");
            showCategoryList();
        })
        .catch(err => alert(err.message));
    });
}

function showCategoryList() {
    document.getElementById("main-content").innerHTML = `
        <h2>Lista de Categorias</h2>
        <div id="category-list-content-area"><p>Carregando...</p></div>
    `;
    fetch("http://localhost:8080/category", {
        method: "GET",
        headers: { "Authorization": getCookie("token") }
    })
    .then(res => res.json())
    .then(data => {
        const cats = data.data || [];
        if (!cats.length) {
            document.getElementById("category-list-content-area").innerHTML = "<p>Sem categorias.</p>";
            return;
        }
        let html = `<table><thead><tr><th>Nome</th><th>Ações</th></tr></thead><tbody>`;
        cats.forEach(cat => {
            html += `
                <tr>
                    <td>${cat.name}</td>
                    <td>
                        <button class="editCategoryBtn" data-id="${cat.id}">Editar</button>
                        <button class="deleteCategoryBtn" data-id="${cat.id}">Excluir</button>
                    </td>
                </tr>`;
        });
        html += `</tbody></table>`;
        document.getElementById("category-list-content-area").innerHTML = html;
        document.querySelector("table").addEventListener("click", e => {
            const id = e.target.getAttribute("data-id");
            if (e.target.classList.contains("editCategoryBtn")) showCategoryEditForm(id);
            if (e.target.classList.contains("deleteCategoryBtn")) deleteCategory(id);
        });
    })
    .catch(err => alert("Erro: " + err.message));
}

function showCategoryEditForm(categoryId) {
    fetch(`http://localhost:8080/category/${categoryId}`, {
        method: "GET",
        headers: { "Authorization": getCookie("token") }
    })
    .then(res => res.json())
    .then(data => {
        const cat = data.data;
        if (!cat) return alert("Categoria não encontrada.");
        document.getElementById("main-content").innerHTML = `
            <h2>Editar Categoria</h2>
            <div class="form-group"><label>Nome:</label><input id="name" value="${cat.name}" required></div>
            <button id="updateCategoryBtn">Atualizar</button>
        `;
        document.getElementById("updateCategoryBtn").addEventListener("click", () => {
            const newName = document.getElementById("name").value.trim();
            if (!newName) return alert("Nome é obrigatório.");
            fetch(`http://localhost:8080/category/${categoryId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": getCookie("token")
                },
                body: JSON.stringify({ name: newName })
            })
            .then(res => {
                if (!res.ok) throw new Error("Falha ao atualizar");
                alert("Categoria atualizada!");
                showCategoryList();
            })
            .catch(err => alert(err.message));
        });
    })
    .catch(err => alert("Erro: " + err.message));
}

function deleteCategory(categoryId) {
    if (!confirm("Excluir categoria?")) return;
    fetch(`http://localhost:8080/category/${categoryId}`, {
        method: "DELETE",
        headers: { "Authorization": getCookie("token") }
    })
    .then(res => {
        if (!res.ok) throw new Error("Falha ao excluir");
        alert("Categoria excluída!");
        showCategoryList();
    })
    .catch(err => alert(err.message));
}
