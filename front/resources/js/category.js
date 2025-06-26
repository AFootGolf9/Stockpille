async function showCategoryList() {
    const html = `
        <div class="section-header">
            <h2>Lista de Categorias</h2>
            <div class="header-actions">
                <button id="backToProductsBtn">Voltar para Produtos</button>
            </div>
        </div>
        <div class="list-container">
            <div id="category-list-content">
                <p>Carregando categorias...</p>
            </div>
        </div>
    `;
    document.getElementById("main-content").innerHTML = html;
    document.getElementById("backToProductsBtn").addEventListener("click", showProductList);

    const categoryListContent = document.getElementById("category-list-content");

    try {
        const data = await fetch("http://localhost:8080/category", {
            method: "GET",
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse);

        const categories = data?.data || [];
        if (categories.length === 0) {
            categoryListContent.innerHTML = "<p>Nenhuma categoria encontrada.</p>";
            return;
        }

        let listHTML = `
            <table class="generic-list-table"> 
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
        `;

        categories.forEach(category => {
            listHTML += `
                <tr>
                    <td data-label="Nome">${category.name}</td>
                    <td data-label="Ações">
                        <button class="editBtn" data-id="${category.id}">Editar</button>
                        <button class="deleteBtn" data-id="${category.id}">Excluir</button>
                    </td>
                </tr>
            `;
        });

        listHTML += "</tbody></table>";
        categoryListContent.innerHTML = listHTML;

        categoryListContent.querySelector('.generic-list-table').addEventListener('click', (event) => {
            const button = event.target;
            const categoryId = button.getAttribute('data-id');

            if (button.classList.contains('editBtn')) {
                showCategoryEditForm(categoryId);
            }
            if (button.classList.contains('deleteBtn')) {
                deleteCategory(categoryId);
            }
        });

    } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        categoryListContent.innerHTML = `<p class="error-message">Não foi possível carregar as categorias: ${error.message}</p>`;
    }
}

async function showCategoryEditForm(id) {
    try {
        const data = await fetch(`http://localhost:8080/category/${id}`, {
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse);

        const category = data?.data;
        if (!category) {
            throw new Error("Dados da categoria não encontrados na resposta.");
        }

        const formHTML = `
            <h2>Editar Categoria</h2>
            <div class="form-group">
                <label for="categoryName">Nome da Categoria:</label>
                <input type="text" id="categoryName" value="${category.name}" required>
            </div>
            <div class="form-actions">
                <button type="button" id="backBtn">Voltar</button>
                <button id="saveCategoryBtn">Salvar Alterações</button>
            </div>
        `;
        document.getElementById("main-content").innerHTML = formHTML;

        document.getElementById("backBtn").addEventListener("click", showCategoryList);

        document.getElementById("saveCategoryBtn").addEventListener("click", () => {
            const newName = document.getElementById("categoryName").value.trim();
            if (!newName) {
                showNotification("O nome da categoria não pode ser vazio.", "error");
                return;
            }

            fetch(`http://localhost:8080/category/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": getCookie("token")
                },
                body: JSON.stringify({ name: newName })
            })
            .then(handleResponse)
            .then(() => {
                showNotification("Categoria atualizada com sucesso!", "success");
                showCategoryList();
            })
            .catch(error => showNotification(error.message, "error"));
        });

    } catch (error) {
        console.error("Erro ao buscar categoria para edição:", error);
        showNotification(error.message, "error");
        showCategoryList();
    }
}

async function deleteCategory(id) {
    try {
        showNotification("Verificando se a categoria está em uso...", "info"); 
        const itemsResponse = await fetch("http://localhost:8080/item", {
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse);

        const allItems = itemsResponse?.data || [];
        const categoryId = parseInt(id, 10);
        const isCategoryInUse = allItems.some(item => item.category_id === categoryId);

        if (isCategoryInUse) {
            showNotification("Não é possível excluir: esta categoria está atribuída a um ou mais itens.", "error");
            return; 
        }
        await showConfirmationModal("Esta categoria não está em uso. Deseja excluí-la permanentemente?", "Excluir Categoria");
        await fetch(`http://localhost:8080/category/${id}`, {
            method: "DELETE",
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse);
        
        showNotification("Categoria excluída com sucesso!", "success");
        showCategoryList();
        
    } catch (error) {
        if (error) {
            console.error("Erro ao excluir categoria:", error);
            showNotification(error.message, "error");
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
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
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