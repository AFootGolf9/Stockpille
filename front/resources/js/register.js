function loginUser(username, password) {
    fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: username, password: password })
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
        document.cookie = `token=${token}; path=/`;
        alert("Login realizado com sucesso!");
        window.location.href = 'home.html';
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
            "Authorization": getCookie("token")
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
    document.getElementById("createRoleBtn").addEventListener("click", () => showRoleForm());
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
            <input type="password" id="password" name="password" ${userId ? 'placeholder="Deixe em branco para não alterar"' : 'required'}>
        </div>
        <div class="form-group">
            <button id="registerBtn">${userId ? 'Atualizar Usuário' : 'Cadastrar Usuário'}</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = formHTML;

    const roleSelect = document.getElementById("role");

    fetch("http://localhost:8080/role", {
        headers: { "Authorization": getCookie("token") }
    })
    .then(response => response.json())
    .then(data => {
        const roles = data.data;
        if (roles && Array.isArray(roles)) {
            roles.forEach(role => {
                const option = document.createElement("option");
                option.value = role.id;
                option.textContent = role.name;
                roleSelect.appendChild(option);
            });
        }

        if (userId) {
            fetch(`http://localhost:8080/user/${userId}`, {
                headers: { "Authorization": getCookie("token") }
            })
            .then(response => response.json())
            .then(data => {
                const user = data.data;
                if (user) {
                    document.getElementById("username").value = user.name;
                    document.getElementById("role").value = user.roleId;
                } else {
                    alert("Erro ao carregar dados do usuário.");
                }
            });
        }
    });

    document.getElementById("registerBtn").addEventListener("click", function() {
        const name = document.getElementById("username").value;
        const roleId = parseInt(document.getElementById("role").value, 10);
        const password = document.getElementById("password").value;

        if (!roleId) {
            alert("Por favor, selecione um cargo para o usuário.");
            return;
        }

        let userData = { name, roleId };
        if (password) {
            userData.password = password;
        }

        const method = userId ? "PUT" : "POST";
        const url = userId ? `http://localhost:8080/user/${userId}` : "http://localhost:8080/user";

        fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": getCookie("token")
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if (response.ok) {
                alert(`Usuário ${userId ? 'atualizado' : 'cadastrado'} com sucesso!`);
                showUserList();
            } else {
                throw new Error(`Erro ao ${userId ? 'atualizar' : 'cadastrar'} o usuário.`);
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert(error.message);
        });
    });
}

function deleteUser(userId) {
    const confirmDelete = confirm("Tem certeza que deseja excluir este usuário?");
    if (confirmDelete) {
        fetch(`http://localhost:8080/user/${userId}`, {
            method: "DELETE",
            headers: {
                "Authorization": getCookie("token")
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
