
async function showCategoryList() {
    // ALTERADO: Usando as classes .section-header e .list-container do novo CSS.
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

        // ALTERADO: Tabela agora usa a classe "generic-list-table".
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
            // ALTERAÇÃO CRÍTICA: Adicionado o atributo 'data-label' para responsividade.
            // O CSS usa este atributo para exibir os títulos em telas pequenas.
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

        // O event listener delegado continua funcionando perfeitamente.
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


/**
 * NENHUMA MUDANÇA NECESSÁRIA AQUI.
 * O CSS já estiliza os botões do formulário pelos seus IDs (#backBtn, etc.)
 * e a estrutura do formulário (.form-group, .form-actions) já é a correta.
 */
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


/**
 * Nenhuma alteração visual necessária nesta função.
 */
function deleteCategory(id) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    fetch(`http://localhost:8080/category/${id}`, {
        method: "DELETE",
        headers: { "Authorization": getCookie("token") }
    })
    .then(handleResponse)
    .then(() => {
        showNotification("Categoria excluída com sucesso!", "success");
        showCategoryList();
    })
    .catch(error => {
        console.error("Erro ao excluir categoria:", error);
        showNotification(error.message, "error");
    });
}