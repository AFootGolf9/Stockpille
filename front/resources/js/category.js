/**
 * Exibe a lista de categorias com um cabeçalho e botões de ação.
 * Agora, o botão "Editar" leva a um formulário dedicado.
 */
function showCategoryList() {
    const html = `
        <div class="product-section-header">
            <h2>Lista de Categorias</h2>
            <div class="product-header-actions">
                <button id="backToProductsBtn">Voltar para Produtos</button>
            </div>
        </div>
        <div class="product-table-wrapper">
            <div id="category-list-content">
                <p>Carregando categorias...</p>
            </div>
        </div>
    `;
    document.getElementById("main-content").innerHTML = html;
    document.getElementById("backToProductsBtn").addEventListener("click", showProductList);

    const categoryListContent = document.getElementById("category-list-content");

    fetch("http://localhost:8080/category", {
        method: "GET",
        headers: { "Authorization": getCookie("token") }
    })
    .then(response => response.json())
    .then(data => {
        const categories = data.data;
        if (!categories || !categories.length) {
            categoryListContent.innerHTML = "<p>Nenhuma categoria encontrada.</p>";
            return;
        }

        let listHTML = `
            <table class="product-table"> 
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
                    <td>${category.name}</td>
                    <td>
                        <button class="editBtn" data-id="${category.id}">Editar</button>
                        <button class="deleteBtn" data-id="${category.id}">Excluir</button>
                    </td>
                </tr>
            `;
        });

        listHTML += "</tbody></table>";
        categoryListContent.innerHTML = listHTML;

        // Adiciona um único event listener para os botões da tabela
        categoryListContent.querySelector('.product-table').addEventListener('click', (event) => {
            const button = event.target;
            const categoryId = button.getAttribute('data-id');

            if (button.classList.contains('editBtn')) {
                showCategoryEditForm(categoryId);
            }
            if (button.classList.contains('deleteBtn')) {
                deleteCategory(categoryId);
            }
        });
    })
    .catch(error => {
        console.error("Erro ao carregar categorias:", error);
        categoryListContent.innerHTML = "<p>Erro ao carregar categorias.</p>";
    });
}

/**
 * NOVA FUNÇÃO: Cria e exibe um formulário para editar uma categoria específica.
 */
function showCategoryEditForm(id) {
    // Primeiro, busca os dados atuais da categoria para preencher o formulário
    fetch(`http://localhost:8080/category/${id}`, {
        headers: { "Authorization": getCookie("token") }
    })
    .then(response => response.json())
    .then(data => {
        const category = data.data;
        if (!category) {
            alert("Categoria não encontrada.");
            showCategoryList();
            return;
        }

        const formHTML = `
            <h2>Editar Categoria</h2>
            <div class="form-group">
                <label for="categoryName">Nome da Categoria:</label>
                <input type="text" id="categoryName" class="form-control" value="${category.name}" required>
            </div>
            <div class="form-actions">
                <button type="button" id="backBtn">Voltar</button>
                <button id="saveCategoryBtn">Salvar Alterações</button>
            </div>
        `;
        document.getElementById("main-content").innerHTML = formHTML;

        // Evento para o botão "Voltar"
        document.getElementById("backBtn").addEventListener("click", showCategoryList);

        // Evento para o botão "Salvar"
        document.getElementById("saveCategoryBtn").addEventListener("click", () => {
            const newName = document.getElementById("categoryName").value;
            if (!newName.trim()) {
                alert("O nome da categoria não pode ser vazio.");
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
            .then(response => {
                if (response.ok) {
                    alert("Categoria atualizada com sucesso!");
                    showCategoryList(); // Volta para a lista após salvar
                } else {
                    return response.json().then(errData => {
                        throw new Error(errData.message || "Erro ao atualizar categoria");
                    });
                }
            })
            .catch(error => {
                console.error("Erro:", error);
                alert(error.message);
            });
        });

    })
    .catch(error => {
        console.error("Erro ao buscar categoria:", error);
        alert("Não foi possível carregar os dados da categoria para edição.");
        showCategoryList();
    });
}


/**
 * A função deleteCategory permanece a mesma.
 */
function deleteCategory(id) {
    if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

    fetch(`http://localhost:8080/category/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": getCookie("token")
        }
    })
    .then(response => {
        if (response.ok) {
            alert("Categoria excluída com sucesso!");
            showCategoryList(); // Recarrega a lista
        } else {
            return response.json().then(data => {
                throw new Error(data.message || "Erro ao excluir categoria");
            });
        }
    })
    .catch(error => {
        console.error("Erro:", error);
        alert(error.message);
    });
}