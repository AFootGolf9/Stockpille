function showNotification(message, type = 'error') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 5000);
}

async function handleResponse(response) {
    if (response.ok) {
        if (response.status === 204) {
            return null;
        }
        return response.json();
    }
    let errorMessage = 'Ocorreu um erro inesperado.';
    try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
            errorMessage = errorData.error;
        }
    } catch (e) {
    }
    switch (response.status) {
        case 400:
            errorMessage = `Dados inválidos: ${errorMessage}`;
            break;
        case 401:
            errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
            break;
        case 403:
            errorMessage = 'Você não tem permissão para realizar esta ação devido ao seu cargo.';
            break;
        case 404:
            errorMessage = 'O recurso solicitado não foi encontrado.';
            break;
        case 500:
            errorMessage = 'Ocorreu um erro interno no servidor. Tente novamente mais tarde.';
            break;
    }
    throw new Error(errorMessage);
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

function showProductList() {
    const productListHTML = `
        <div class="section-header"> 
            <h2>Lista de Produtos</h2>
            <div class="header-actions">
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
        <div class="list-container"> 
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

    fetch("http://localhost:8080/category", {
        method: "GET",
        headers: { "Authorization": getCookie("token") }
    })
    .then(handleResponse)
    .then(categoriesData => {
        const categories = categoriesData.data;
        if (Array.isArray(categories)) {
            categories.forEach(cat => {
                const option = new Option(cat.name, cat.id);
                categoryFilter.appendChild(option);
                categoryMap[cat.id] = cat.name;
            });
        }
        return fetch("http://localhost:8080/item", {
            method: "GET",
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse);
    })
    .then(productsData => {
        allProducts = productsData?.data || [];
        if (allProducts.length > 0) {
            renderTable(allProducts);
            productSearch.addEventListener("input", filterProducts);
            categoryFilter.addEventListener("change", filterProducts);
        } else {
            productListContentArea.innerHTML = "<p>Nenhum produto cadastrado.</p>";
        }
    })
    .catch(err => {
        console.error("Erro ao carregar dados:", err);
        productListContentArea.innerHTML = `<p class="error-message">Não foi possível carregar os produtos: ${err.message}</p>`;
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
            <table class="generic-list-table">
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
                        <td data-label="SKU">${p.sku || '-'}</td>
                        <td data-label="Item">${p.name}</td>
                        <td data-label="Categoria">${catName}</td>
                        <td data-label="Descrição">${p.description || '-'}</td>
                        <td data-label="Quantidade" id="quantity-${p.sku}">Carregando...</td>
                        <td data-label="Ações">
                            <button class="editBtn" data-id="${p.sku}">Editar</button>
                            <button class="deleteBtn" data-id="${p.sku}">Excluir</button>
                        </td>
                    </tr>`;
            });
        }
        html += "</tbody></table>";
        productListContentArea.innerHTML = html;

        products.forEach(p => {
            fetch(`http://localhost:8080/item/quantity/${p.sku}`, {
                method: "GET",
                headers: { "Authorization": getCookie("token") }
            })
            .then(handleResponse)
            .then(qtd => {
                const cell = document.getElementById(`quantity-${p.sku}`);
                if (cell) cell.textContent = qtd.count ?? "N/D";
            })
            .catch(err => {
                console.error(`Erro ao buscar quantidade para SKU ${p.sku}:`, err);
                const cell = document.getElementById(`quantity-${p.sku}`);
                if (cell) cell.textContent = "Erro";
            });
        });

        const table = productListContentArea.querySelector(".generic-list-table");
        if (table) {
            table.addEventListener("click", e => {
                const id = e.target.getAttribute("data-id");
                if (e.target.classList.contains("editBtn")) showProductForm(id);
                if (e.target.classList.contains("deleteBtn")) deleteProduct(id);
            });
        }
    }

    document.getElementById("createProductBtn").addEventListener("click", () => showProductForm());
    document.getElementById("createCategoryBtn").addEventListener("click", showCategoryForm);
    document.getElementById("listCategoryBtn").addEventListener("click", showCategoryList);
}

function showProductForm(productId = null) {
    const isEdit = Boolean(productId);
    let currentSku = null;
    let currentUserId = null;
    document.getElementById("main-content").innerHTML = `
        <h2>${isEdit ? 'Editar Produto' : 'Cadastrar Produto'}</h2>
        <form>
            <div class="form-group"><label>Nome:</label><input id="name" required></div>
            <div class="form-group"><label>Descrição:</label><textarea id="description" rows="4" required></textarea></div>
            <div class="form-group">
                <label>Categoria:</label>
                <select id="category" required><option value="">Selecione</option></select>
            </div>
            <div class="form-actions">
                <button type="button" id="backBtn">Voltar</button>
                <button type="button" id="registerProductBtn">${isEdit ? 'Atualizar' : 'Cadastrar'}</button>
            </div>
        </form>
    `;
    document.getElementById("backBtn").addEventListener("click", showProductList);
    const nameInput = document.getElementById("name");
    const descInput = document.getElementById("description");
    const catSelect = document.getElementById("category");
    fetch("http://localhost:8080/category", {
        method: "GET",
        headers: { "Authorization": getCookie("token") }
    })
    .then(handleResponse)
    .then(cats => {
        cats.data?.forEach(cat => {
            catSelect.add(new Option(cat.name, cat.id));
        });
        if (isEdit) {
            return fetch(`http://localhost:8080/item/${productId}`, {
                method: "GET",
                headers: { "Authorization": getCookie("token") }
            }).then(handleResponse);
        }
    })
    .then(prod => {
        if (isEdit && prod) {
            const item = prod.data;
            nameInput.value = item.name || '';
            descInput.value = item.description || '';
            catSelect.value = item.category_id || '';
            currentSku = item.sku;
            currentUserId = item.user_id;
        }
    })
    .catch(err => {
        showNotification(`Erro ao carregar dados do formulário: ${err.message}`);
        showProductList();
    });

    document.getElementById("registerProductBtn").addEventListener("click", () => {
        const name = nameInput.value.trim();
        const desc = descInput.value.trim();
        const catId = catSelect.value;
        if (!name || !desc || !catId) {
            showNotification("Todos os campos são obrigatórios.", "error");
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
                showNotification("Erro interno: dados do produto não carregados. Não foi possível atualizar.", "error");
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
        .then(handleResponse)
        .then(() => {
            showNotification(`Produto ${isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
            showProductList();
        })
        .catch(err => showNotification(err.message, 'error'));
    });
}

async function deleteProduct(productId) {
    try {
        await showConfirmationModal("Tem certeza que deseja excluir este produto?", "Excluir Produto");
        
        await fetch(`http://localhost:8080/item/${productId}`, {
            method: "DELETE",
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse);
        
        showNotification("Produto excluído com sucesso!", 'success');
        showProductList();
    } catch (error) {
        if (error) {
            showNotification(error.message, 'error');
        } else {
            console.log("Exclusão de produto cancelada.");
        }
    }
}

function showCategoryForm() {
    document.getElementById("main-content").innerHTML = `
        <h2>Cadastrar Categoria</h2>
        <div class="form-group"><label>Nome:</label><input id="name" required></div>
        <div class="form-actions">
             <button type="button" id="backBtn">Voltar</button>
             <button id="registerCategoryBtn" class="btn-primary">Cadastrar</button>
        </div>
    `;
    document.getElementById("backBtn").addEventListener("click", showProductList);
    document.getElementById("registerCategoryBtn").addEventListener("click", () => {
        const name = document.getElementById("name").value.trim();
        if (!name) {
            showNotification("O nome da categoria é obrigatório.", "error");
            return;
        }
        fetch("http://localhost:8080/category", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": getCookie("token")
            },
            body: JSON.stringify({ name })
        })
        .then(handleResponse)
        .then(() => {
            showNotification("Categoria cadastrada com sucesso!", 'success');
            showCategoryList();
        })
        .catch(err => showNotification(err.message, 'error'));
    });
}

function showCategoryList() {
    document.getElementById("main-content").innerHTML = `
        <div class="section-header">
            <h2>Lista de Categorias</h2>
            <button id="backToProductsBtn">Voltar para Produtos</button>
        </div>
        <div id="category-list-content-area"><p>Carregando...</p></div>
    `;
    document.getElementById("backToProductsBtn").addEventListener("click", showProductList);
    const contentArea = document.getElementById("category-list-content-area");
    fetch("http://localhost:8080/category", {
        method: "GET",
        headers: { "Authorization": getCookie("token") }
    })
    .then(handleResponse)
    .then(data => {
        const cats = data.data || [];
        if (!cats.length) {
            contentArea.innerHTML = "<p>Nenhuma categoria cadastrada.</p>";
            return;
        }
        let html = `
            <div class="list-container">
                <table class="generic-list-table">
                    <thead><tr><th>Nome</th><th>Ações</th></tr></thead>
                    <tbody>
        `;
        cats.forEach(cat => {
            html += `
                <tr>
                    <td data-label="Nome">${cat.name}</td>
                    <td data-label="Ações">
                        <button class="editCategoryBtn" data-id="${cat.id}">Editar</button>
                        <button class="deleteCategoryBtn" data-id="${cat.id}">Excluir</button>
                    </td>
                </tr>`;
        });
        html += `</tbody></table></div>`;
        contentArea.innerHTML = html;
        const categoryTable = contentArea.querySelector(".generic-list-table");
        if (categoryTable) {
            categoryTable.addEventListener("click", e => {
                const id = e.target.getAttribute("data-id");
                if (e.target.classList.contains("editCategoryBtn")) showCategoryEditForm(id);
                if (e.target.classList.contains("deleteCategoryBtn")) deleteCategory(id);
            });
        }
    })
    .catch(err => {
        contentArea.innerHTML = `<p class="error-message">Não foi possível carregar as categorias: ${err.message}</p>`;
    });
}

function showCategoryEditForm(categoryId) {
    fetch(`http://localhost:8080/category/${categoryId}`, {
        method: "GET",
        headers: { "Authorization": getCookie("token") }
    })
    .then(handleResponse)
    .then(data => {
        const cat = data.data;
        if (!cat) {
            throw new Error("Categoria não encontrada.");
        }
        document.getElementById("main-content").innerHTML = `
            <h2>Editar Categoria</h2>
            <div class="form-group"><label>Nome:</label><input id="name" value="${cat.name}" required></div>
            <div class="form-actions">
                <button type="button" id="backBtn">Voltar</button>
                <button id="updateCategoryBtn">Atualizar</button>
            </div>
        `;
        document.getElementById("backBtn").addEventListener("click", showCategoryList);
        document.getElementById("updateCategoryBtn").addEventListener("click", () => {
            const newName = document.getElementById("name").value.trim();
            if (!newName) {
                showNotification("O nome da categoria é obrigatório.", "error");
                return;
            }
            fetch(`http://localhost:8080/category/${categoryId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": getCookie("token")
                },
                body: JSON.stringify({ name: newName })
            })
            .then(handleResponse)
            .then(() => {
                showNotification("Categoria atualizada com sucesso!", 'success');
                showCategoryList();
            })
            .catch(err => showNotification(err.message, 'error'));
        });
    })
    .catch(err => {
        showNotification(err.message, 'error');
        showCategoryList();
    });
}

async function deleteCategory(categoryId) {
    try {
        await showConfirmationModal("Excluir esta categoria? Todos os produtos associados ficarão sem categoria.", "Excluir Categoria");
        
        await fetch(`http://localhost:8080/category/${categoryId}`, {
            method: "DELETE",
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse);

        showNotification("Categoria excluída com sucesso!", 'success');
        showCategoryList();
    } catch (error) {
        if (error) {
            showNotification(error.message, 'error');
        } else {
            console.log("Exclusão de categoria cancelada.");
        }
    }
}

function showConfirmationModal(message, title = 'Confirmar Ação') {
    return new Promise((resolve, reject) => {
        const overlay = document.createElement('div');
        overlay.className = 'confirmation-overlay';
        overlay.innerHTML = `
            <div class="confirmation-modal">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="confirmation-modal-actions">
                    <button class="confirmation-btn-cancel">Cancelar</button>
                    <button class="confirmation-btn-confirm">Confirmar</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('visible'), 10);
        const confirmBtn = overlay.querySelector('.confirmation-btn-confirm');
        const cancelBtn = overlay.querySelector('.confirmation-btn-cancel');
        const closeModal = () => {
            overlay.classList.remove('visible');
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 300);
        };
        confirmBtn.addEventListener('click', () => {
            closeModal();
            resolve();
        });
        cancelBtn.addEventListener('click', () => {
            closeModal();
            reject();
        });
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeModal();
                reject();
            }
        });
    });
}