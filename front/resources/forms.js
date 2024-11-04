// Função que exibe os campos de cadastro de produto
function showProductForm() {
    // Defina o HTML para os campos de entrada
    const formHTML = `
        <h2>Cadastro de Produto</h2>
        <div class="form-group">
            <label for="sku">SKU:</label>
            <input type="text" id="sku" name="sku" required>
        </div>
        <div class="form-group">
            <label for="name">Nome do Produto:</label>
            <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
            <label for="description">Descrição:</label>
            <textarea id="description" name="description" rows="4" required></textarea>
        </div>
        <div class="form-group">
            <button id="registerProductBtn">Cadastrar Produto</button>
        </div>
    `;

    // Injeta o HTML no `main-content`
    document.getElementById("main-content").innerHTML = formHTML;

    // Adiciona o evento de clique no botão para enviar os dados ao backend
    document.getElementById("registerProductBtn").addEventListener("click", function() {
        // Captura os valores dos campos
        const sku = document.getElementById("sku").value;
        const name = document.getElementById("name").value;
        const description = document.getElementById("description").value;

        // Cria o objeto com os dados do produto
        const productData = {
            sku: sku,
            name: name,
            description: description
        };


        fetch("http://localhost:3000/??????", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(productData)
        })
        .then(response => {
            if (response.ok) {
                alert("Produto cadastrado com sucesso!");
                // Limpa os campos após o envio
                document.getElementById("sku").value = '';
                document.getElementById("name").value = '';
                document.getElementById("description").value = '';
            } else {
                throw new Error("Erro ao cadastrar o produto.");
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro ao cadastrar o produto. Tente novamente.");
        });
    });
}
