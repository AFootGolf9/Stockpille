import { getCookie } from './cookie.js';

function loginUser(username, password) {
    // Envia uma solicitação de login com as credenciais
    fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error("Falha ao fazer login. Verifique suas credenciais.");
        }
    })
    .then(data => {
        const token = data.token;

        // Armazena o token como um cookie
        document.cookie = `token=${token}; path=/`;

        // Exibe o token na tela
        displaytoken();

        alert("Login realizado com sucesso!");
        // Após o login bem-sucedido, você pode redirecionar para a lista de usuários
        showUserList();
    })
    .catch(error => {
        console.error("Erro no login:", error);
        alert("Erro ao fazer login. Tente novamente.");
    });
}


function showLoginForm() {
    const loginHTML = `
        <h2>Login</h2>
        <div class="form-group">
            <label for="username">Usuário:</label>
            <input type="text" id="username" required>
        </div>
        <div class="form-group">
            <label for="password">Senha:</label>
            <input type="password" id="password" required>
        </div>
        <button id="loginBtn">Entrar</button>
        <div id="tokenDisplay"></div>
    `;

    document.getElementById("main-content").innerHTML = loginHTML;

    document.getElementById("loginBtn").addEventListener("click", () => {
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;

        // Chama a função de login com as credenciais
        loginUser(username, password);
    });
}

function showUserList() {
    const userListHTML = `
        <div class="user-header">
            <h2>Lista de Usuários</h2>
            <div class="user-actions">
                <button id="createUserBtn">Criar Usuário</button>
                <button id="createRoleBtn">Criar Cargo</button>
            </div>
        </div>
        <div id="user-list" class="user-list">
            <p>Carregando usuários...</p>
        </div>
    `;

    document.getElementById("main-content").innerHTML = userListHTML;

    fetch("http://localhost:8080/user", {
        headers: {
            "Authorization": `Bearer ${getCookie("token")}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const users = data.data;
        console.log("Resposta da API:", users);

        const userListContainer = document.getElementById("user-list");

        if (Array.isArray(users) && users.length > 0) {
            const tableHTML = `
                <table class="user-table">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Cargo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(user => `
                            <tr>
                                <td>${user.name}</td>
                                <td>${user.role}</td>
                                <td>
                                    <button class="editBtn" data-id="${user.id}">Editar</button>
                                    <button class="deleteBtn" data-id="${user.id}">Excluir</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            userListContainer.innerHTML = tableHTML;

            document.querySelectorAll(".editBtn").forEach(button => {
                button.addEventListener("click", (event) => {
                    const userId = event.target.getAttribute("data-id");
                    showUserForm(userId);
                });
            });

            document.querySelectorAll(".deleteBtn").forEach(button => {
                button.addEventListener("click", (event) => {
                    const userId = event.target.getAttribute("data-id");
                    deleteUser(userId);
                });
            });
        } else {
            userListContainer.innerHTML = "<p>Nenhum usuário cadastrado.</p>";
        }
    })
    .catch(error => {
        console.error("Erro ao carregar usuários:", error);
        document.getElementById("user-list").innerHTML = "<p>Erro ao carregar usuários.</p>";
    });

    document.getElementById("createUserBtn").addEventListener("click", () => showUserForm());
    document.getElementById("createRoleBtn").addEventListener("click", () => showRoleForm()); // Call showRoleForm()
}

function showUserForm(userId = null) {
    const formHTML = `
        <h2>${userId ? 'Editar Usuário' : 'Cadastro de Usuário'}</h2>
        <div class="form-group">
            <label for="username">Nome:</label>
            <input type="text" id="username" name="username" required>
        </div>
        <div class="form-group">
            <label for="role">Cargo:</label>
            <select id="role" name="role" required>
                <option value="">Selecione um cargo</option>
            </select>
        </div>
        <div class="form-group">
            <label for="password">Senha:</label>
            <input type="password" id="password" name="password" ${userId ? '' : 'required'}>
        </div>
        <div class="form-group">
            <button id="register">${userId ? 'Atualizar Usuário' : 'Cadastrar Usuário'}</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = formHTML;

    const roleSelect = document.getElementById("role");
    const registerButton = document.getElementById("register");

    fetch("http://localhost:8080/roles", {
        headers: {
            "Authorization": `Bearer ${getCookie("token")}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const roles = data.data;
        if (roles && Array.isArray(roles)) {
            roles.forEach(role => {
                const option = document.createElement("option");
                option.value = role.name;
                option.textContent = role.name;
                roleSelect.appendChild(option);
            });
        }

        if (userId) {
            fetch(`http://localhost:8080/user/${userId}`, {
                headers: {
                    "Authorization": `Bearer ${getCookie("token")}`
                }
            })
            .then(response => response.json())
            .then(data => {
                const user = data.data;
                if (user) {
                    document.getElementById("username").value = user.name;
                    document.getElementById("role").value = user.role; // Seleciona o cargo existente
                } else {
                    alert("Erro ao carregar dados do usuário.");
                }
            })
            .catch(error => {
                console.error("Erro ao carregar dados do usuário:", error);
                alert("Erro ao carregar dados do usuário.");
            });
        }
    })
    .catch(error => {
        console.error("Erro ao carregar cargos:", error);
        alert("Erro ao carregar a lista de cargos.");
    });


    registerButton.addEventListener("click", function() {
        const name = document.getElementById("username").value;
        const roleSelectElement = document.getElementById("role");
        const role = roleSelectElement.value;
        const password = document.getElementById("password").value;
        const userData = userId ? { name, role } : { name, role, password };

        if (!role) {
            alert("Por favor, selecione um cargo para o usuário.");
            return; // Impede a execução da requisição se nenhum cargo for selecionado
        }

        if (userId) {
            fetch(`http://localhost:8080/user/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getCookie("token")}`
                },
                body: JSON.stringify(userData)
            })
            .then(response => {
                if (response.ok) {
                    alert("Usuário atualizado com sucesso!");
                    showUserList();
                } else {
                    throw new Error("Erro ao atualizar o usuário.");
                }
            })
            .catch(error => {
                console.error("Erro:", error);
                alert("Erro ao atualizar o usuário. Tente novamente.");
            });
        } else {
            fetch("http://localhost:8080/user", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${getCookie("token")}`
                },
                body: JSON.stringify(userData)
            })
            .then(response => {
                if (response.ok) {
                    alert("Usuário cadastrado com sucesso!");
                    showUserList();
                } else {
                    throw new Error("Erro ao cadastrar o usuário.");
                }
            })
            .catch(error => {
                console.error("Erro:", error);
                alert("Erro ao cadastrar o usuário. Tente novamente.");
            });
        }
    });

}

function deleteUser(userId) {
    const confirmDelete = confirm("Tem certeza que deseja excluir este usuário?");
    if (confirmDelete) {
        fetch(`http://localhost:8080/user/${userId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${getCookie("token")}`
            }
        })
        .then(response => {
            if (response.ok) {
                alert("Usuário excluído com sucesso!");
                showUserList();
            } else {
                throw new Error("Erro ao excluir o usuário.");
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro ao excluir o usuário. Tente novamente.");
        });
    }
}

