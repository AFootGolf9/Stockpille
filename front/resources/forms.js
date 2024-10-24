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

// Função para lidar com o envio do formulário
document.addEventListener('submit', function(event) {
    if (event.target && event.target.id === 'productForm') {
        event.preventDefault();
        
        // Pegando os valores dos inputs
        const productName = document.getElementById("productName").value;
        const productDescription = document.getElementById("productDescription").value;
        const productPrice = document.getElementById("productPrice").value;
        const productCategory = document.getElementById("productCategory").value;
        const productStock = document.getElementById("productStock").value;

        // Exemplo simples de validação e exibição dos dados (pode ser substituído por envio para API)
        if (productName && productDescription && productPrice && productCategory && productStock) {
            alert(`Produto cadastrado com sucesso:
            Nome: ${productName}
            Descrição: ${productDescription}
            Preço: ${productPrice}
            Categoria: ${productCategory}
            Estoque: ${productStock}`);
        } else {
            alert("Por favor, preencha todos os campos.");
        }
    }
});


function showAllocationForm() {
    document.getElementById("main-content").innerHTML = `
        <h2>Cadastro de Locações</h2>
        <form id="productForm">
            <div class="form-group">
                <label for="productName">Locação:</label>
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
                <button type="submit">Cadastrar Locação</button>
            </div>
        </form>
    `;
}

// Função para lidar com o envio do formulário
document.addEventListener('submit', function(event) {
    if (event.target && event.target.id === 'productForm') {
        event.preventDefault();
        
        // Pegando os valores dos inputs
        const productName = document.getElementById("productName").value;
        const productDescription = document.getElementById("productDescription").value;
        const productPrice = document.getElementById("productPrice").value;
        const productCategory = document.getElementById("productCategory").value;
        const productStock = document.getElementById("productStock").value;

        // Exemplo simples de validação e exibição dos dados (pode ser substituído por envio para API)
        if (productName && productDescription && productPrice && productCategory && productStock) {
            alert(`Produto cadastrado com sucesso:
            Nome: ${productName}
            Descrição: ${productDescription}
            Preço: ${productPrice}
            Categoria: ${productCategory}
            Estoque: ${productStock}`);
        } else {
            alert("Por favor, preencha todos os campos.");
        }
    }
});

function showUserForm() {
    document.getElementById("main-content").innerHTML = `
        <h2>Cadastro de Usuário</h2>
        <form id="productForm">
            <div class="form-group">
                <label for="productName">Nome do Fudido:</label>
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

// Função para lidar com o envio do formulário
document.addEventListener('submit', function(event) {
    if (event.target && event.target.id === 'productForm') {
        event.preventDefault();
        
        // Pegando os valores dos inputs
        const productName = document.getElementById("productName").value;
        const productDescription = document.getElementById("productDescription").value;
        const productPrice = document.getElementById("productPrice").value;
        const productCategory = document.getElementById("productCategory").value;
        const productStock = document.getElementById("productStock").value;

        // Exemplo simples de validação e exibição dos dados (pode ser substituído por envio para API)
        if (productName && productDescription && productPrice && productCategory && productStock) {
            alert(`Produto cadastrado com sucesso:
            Nome: ${productName}
            Descrição: ${productDescription}
            Preço: ${productPrice}
            Categoria: ${productCategory}
            Estoque: ${productStock}`);
        } else {
            alert("Por favor, preencha todos os campos.");
        }
    }
});
