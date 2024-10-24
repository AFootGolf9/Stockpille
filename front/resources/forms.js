// Função para exibir o formulário de cadastro de produtos
function showProductForm() {
    document.getElementById("main-content").innerHTML = `
        <h2>Cadastro de Produto</h2>
        <form id="productForm">
            <div class="form-group">
                <label for="productName">Nome do Produto:</label>
                <input type="text" id="productName" name="productName" required>
            </div>
            <div class="form-group">
                <label for="productDescription">Descrição:</label>
                <textarea id="productDescription" name="productDescription" rows="4" required></textarea>
            </div>
            <div class="form-group">
                <label for="productPrice">Preço:</label>
                <input type="number" id="productPrice" name="productPrice" step="0.01" required>
            </div>
            <div class="form-group">
                <label for="productCategory">Categoria:</label>
                <select id="productCategory" name="productCategory" required>
                    <option value="eletronicos">Eletrônicos</option>
                    <option value="roupas">Roupas</option>
                    <option value="alimentos">Alimentos</option>
                    <option value="livros">Livros</option>
                </select>
            </div>
            <div class="form-group">
                <label for="productStock">Estoque:</label>
                <input type="number" id="productStock" name="productStock" required>
            </div>
            <div class="form-group">
                <button type="submit">Cadastrar Produto</button>
            </div>
        </form>
    `;
}

// Função para lidar com o envio do formulário de cadastro de produtos
document.addEventListener('submit', function(event) {
    if (event.target && event.target.id === 'productForm') {
        event.preventDefault();
        
        // Pegando os valores dos inputs
        const productName = document.getElementById("productName").value;
        const productDescription = document.getElementById("productDescription").value;
        const productPrice = document.getElementById("productPrice").value;
        const productCategory = document.getElementById("productCategory").value;
        const productStock = document.getElementById("productStock").value;

        // Criar o objeto de dados
        const productData = {
            name: productName,
            description: productDescription,
            price: productPrice,
            category: productCategory,
            stock: productStock
        };

        // Enviar dados para a API
        fetch('https://suaapi.com/produtos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        })
        .then(response => response.json())
        .then(data => {
            alert('Produto cadastrado com sucesso!');
            console.log('Sucesso:', data);
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Ocorreu um erro ao cadastrar o produto.');
        });
    }
});


