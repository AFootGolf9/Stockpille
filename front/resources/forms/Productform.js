function showProductList() {
    const productListHTML = `
        <div class="product-header">
            <h2>Lista de Produtos</h2>
            <button id="createProductBtn">Criar</button>
        </div>
        <div id="product-list" class="product-list">
            <p>Carregando produtos...</p>
        </div>
    `;

    document.getElementById("main-content").innerHTML = productListHTML;

    fetch("http://localhost:8080/item")
    .then(response => response.text())
    .then(text => {
        console.log("Resposta do servidor:", text);

        // Tenta separar múltiplos erros concatenados
        try {
            const parsedData = tryParseJSON(text);
            if (parsedData) {
                const products = parsedData.data;
                const productListContainer = document.getElementById("product-list");

                if (Array.isArray(products) && products.length > 0) {
                    const tableHTML = `
                        <table class="product-table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Item</th>
                                    <th>Descrição</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${products.map(product => `
                                    <tr>
                                        <td>${product.sku}</td>
                                        <td>${product.name}</td>
                                        <td>${product.description}</td>
                                        <td>
                                            <button class="editBtn" data-id="${product.sku}">Editar</button>
                                            <button class="deleteBtn" data-id="${product.sku}">Excluir</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    `;
                    productListContainer.innerHTML = tableHTML;

                    // Delegação de eventos para os botões
                    const table = productListContainer.querySelector("table");
                    table.addEventListener("click", function(event) {
                        const target = event.target;
                        
                        if (target.classList.contains("editBtn")) {
                            const productId = target.getAttribute("data-id");
                            showProductForm(productId);  // Passa o ID para edição
                        }
                        
                        if (target.classList.contains("deleteBtn")) {
                            const productId = target.getAttribute("data-id");
                            deleteProduct(productId);  // Passa o ID para exclusão
                        }
                    });
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
        showProductForm();  // Passa o ID vazio para criação
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
            <button id="registerProductBtn">${productId ? 'Atualizar Produto' : 'Cadastrar Produto'}</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = formHTML;

    if (productId) {
        fetch(`http://localhost:8080/item/${productId}`)
            .then(response => response.text())  // Alterado para texto
            .then(text => {
                console.log("Resposta do servidor:", text);
                const parsedData = tryParseJSON(text);
                if (parsedData) {
                    const product = parsedData.data;
                    if (product) {
                        document.getElementById("name").value = product.name;
                        document.getElementById("description").value = product.description;
                    }
                } else {
                    alert("Erro ao carregar dados do produto.");
                }
            })
            .catch(error => {
                console.error("Erro ao carregar os dados do produto:", error);
                alert("Erro ao carregar dados do produto.");
            });
    }

    document.getElementById("registerProductBtn").addEventListener("click", function() {
        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;
        const productData = { name, description };

        if (productId) {
            fetch(`http://localhost:8080/item/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(productData)
            })
            .then(response => {
                if (response.ok) {
                    alert("Produto atualizado com sucesso!");
                    showProductList();
                } else {
                    throw new Error("Erro ao atualizar o produto.");
                }
            })
            .catch(error => {
                console.error("Erro:", error);
                alert("Erro ao atualizar o produto. Tente novamente.");
            });
        } else {
            fetch("http://localhost:8080/item", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(productData)
            })
            .then(response => {
                if (response.ok) {
                    alert("Produto cadastrado com sucesso!");
                    showProductList();
                } else {
                    throw new Error("Erro ao cadastrar o produto.");
                }
            })
            .catch(error => {
                console.error("Erro:", error);
                alert("Erro ao cadastrar o produto. Tente novamente.");
            });
        }
    });
}

function deleteProduct(productId) {
    const confirmDelete = confirm("Tem certeza que deseja excluir este produto?");
    if (confirmDelete) {
        fetch(`http://localhost:8080/item/${productId}`, {
            method: "DELETE"
        })
        .then(response => {
            if (response.ok) {
                alert("Produto excluído com sucesso!");
                showProductList();
            } else {
                throw new Error("Erro ao excluir o produto.");
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro ao excluir o produto. Tente novamente.");
        });
    }
}
