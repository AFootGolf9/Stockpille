function showCategoryList() {
    const html = `
        <h2>Lista de Categorias</h2>
        <div id="category-list"><p>Carregando categorias...</p></div>
    `;
    document.getElementById("main-content").innerHTML = html;

    fetch("http://localhost:8080/category", {
        method: "GET",
        headers: {
            "Authorization": getCookie("token")
        }
    })
    .then(response => response.json())
    .then(data => {
        const categories = data.data;
        if (!categories.length) {
            document.getElementById("category-list").innerHTML = "<p>Nenhuma categoria encontrada.</p>";
            return;
        }

        let listHTML = `
            <table class="category-table">
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
                    <td>
                        <input type="text" id="cat-name-${category.id}" value="${category.name}" />
                    </td>
                    <td>
                        <button onclick="updateCategory(${category.id})">Editar</button>
                        <button onclick="deleteCategory(${category.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });

        listHTML += "</tbody></table>";
        document.getElementById("category-list").innerHTML = listHTML;
    })
    .catch(error => {
        console.error("Erro ao carregar categorias:", error);
        document.getElementById("category-list").innerHTML = "<p>Erro ao carregar categorias.</p>";
    });
}

function updateCategory(id) {
    const newName = document.getElementById(`cat-name-${id}`).value;

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
        } else {
            return response.json().then(data => {
                throw new Error(data.message || "Erro ao atualizar categoria");
            });
        }
    })
    .catch(error => {
        console.error("Erro:", error);
        alert(error.message);
    });
}

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
