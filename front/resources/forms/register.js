function showUserList() {
    // Estrutura da tela com título e botão "Criar"
    const userListHTML = `
        <div class="user-header">
            <h2>Lista de Usuários</h2>
            <button id="createUserBtn">Criar</button>
        </div>
        <div id="user-list" class="user-list">
            <p>Carregando usuários...</p>
        </div>
    `;

    // Insere o HTML na área principal
    document.getElementById("main-content").innerHTML = userListHTML;

    // Carrega os usuários da API
    fetch("http://localhost:8080/user")
    .then(response => response.json())
    .then(data => {
        const users = data.data; // Acessando os dados dentro de 'data'
        console.log("Resposta da API:", users);
        
        const userListContainer = document.getElementById("user-list");

        if (Array.isArray(users) && users.length > 0) {
            // Criando a estrutura da tabela
            const tableHTML = `
                <table class="user-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Cargo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.name}</td>
                                <td>${user.role}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            userListContainer.innerHTML = tableHTML;
        } else {
            userListContainer.innerHTML = "<p>Nenhum usuário cadastrado.</p>";
        }
    })
    .catch(error => {
        console.error("Erro ao carregar usuários:", error);
        document.getElementById("user-list").innerHTML = "<p>Erro ao carregar usuários.</p>";
    });

    // Adiciona evento de clique para o botão "Criar"
    document.getElementById("createUserBtn").addEventListener("click", showUserForm);
}

function showUserForm() {
    const formHTML = `
        <h2>Cadastro de Usuário</h2>
        <div class="form-group">
            <label for="username">Nome:</label>
            <input type="text" id="username" name="username" required>
        </div>
        <div class="form-group">
            <label for="role">Cargo:</label>
            <input type="text" id="role" name="role" required>
        </div>
        <div class="form-group">
            <label for="password">Senha:</label>
            <input type="password" id="password" name="password" required>
        </div>
        <div class="form-group">
            <button id="register">Cadastrar Usuário</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = formHTML;

    document.getElementById("register").addEventListener("click", function() {
        const name = document.getElementById("username").value;
        const role = document.getElementById("role").value;
        const password = document.getElementById("password").value;

        // Verificação de campos vazios
        if (name === "" || role === "" || password === "") {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        // Verificação de tamanho mínimo de senha
        if (password.length < 4) {
            alert("A senha deve ter pelo menos 4 caracteres.");
            return;
        }

        // Envio do formulário via API
        fetch('http://localhost:8080/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                role: role,
                password: password
            })
        })
        .then(response => {
            if (response.ok) {
                alert("Usuário cadastrado com sucesso!");
                showUserList();  // Atualiza a lista após o cadastro
            } else {
                throw new Error("Erro ao cadastrar o usuário.");
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro ao cadastrar o usuário. Tente novamente.");
        });
    });
}
