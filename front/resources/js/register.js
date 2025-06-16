function showUserList() {
    // ALTERAÇÃO: Usando classes genéricas "section-header" e "header-actions".
    const userListHTML = `
    <div class="section-header">
        <h2>Lista de Usuários</h2>
        <div class="header-actions">
            <button id="createUserBtn">Criar Usuário</button>
            <button id="createRoleBtn">Criar Cargo</button>
            <button id="listRolesBtn">Listar Cargos</button>
        </div>
    </div>
    <div id="user-list">
        <p>Carregando usuários...</p>
    </div>
    <div id="role-list" class="role-list" style="margin-top: 20px;"></div>`;
    document.getElementById("main-content").innerHTML = userListHTML;

    fetch("http://localhost:8080/role", {
        headers: { "Authorization": getCookie("token") }
    })
    .then(response => response.json())
    .then(roleData => {
        const roles = roleData.data;
        const roleMap = {};
        if (roles && Array.isArray(roles)) {
            roles.forEach(role => {
                roleMap[role.id] = role.name;
            });
        }

        fetch("http://localhost:8080/user", {
            headers: {
                "Authorization": getCookie("token")
            }
        })
        .then(response => response.json())
        .then(userData => {
            const users = userData.data;
            const userListContainer = document.getElementById("user-list");

            if (Array.isArray(users) && users.length > 0) {
                // ALTERAÇÃO:
                // 1. Tabela usa "generic-list-table" e está dentro de um "list-container".
                // 2. Cada <td> tem o atributo "data-label" para responsividade.
                const tableHTML = `
                    <div class="list-container">
                        <table class="generic-list-table">
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
                                        <td data-label="Nome">${user.name}</td>
                                        <td data-label="Cargo">${roleMap[user.roleId] || "Sem cargo"}</td>
                                        <td data-label="Ações">
                                            <button class="editBtn" data-id="${user.id}">Editar</button>
                                            <button class="deleteBtn" data-id="${user.id}">Excluir</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
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
    })
    .catch(error => {
        console.error("Erro ao carregar cargos:", error);
        document.getElementById("user-list").innerHTML = "<p>Erro ao carregar cargos.</p>";
    });

    document.getElementById("createUserBtn").addEventListener("click", () => showUserForm());
    document.getElementById("createRoleBtn").addEventListener("click", () => showRoleForm());
    document.getElementById("listRolesBtn").addEventListener("click", () => {showRoleList();}); // Supondo que você tenha a função showRoleList
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
        <div class="form-actions">
            <button type="button" id="backBtn">Voltar</button>
            <button id="registerBtn">${userId ? 'Atualizar Usuário' : 'Cadastrar Usuário'}</button>
        </div>
    `;
    document.getElementById("main-content").innerHTML = formHTML;

    document.getElementById("backBtn").addEventListener("click", showUserList);

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

function showRoleForm() {
    const formHTML = `
        <h2>Cadastro de Cargo</h2>
        <div class="form-group">
            <label for="roleName">Nome do Cargo:</label>
            <input type="text" id="roleName" name="roleName" required>
        </div>
        <div class="form-actions">
            <button type="button" id="backBtn">Voltar</button>
            <button id="createRoleSubmitBtn">Cadastrar Cargo</button>
        </div>
    `;
    document.getElementById("main-content").innerHTML = formHTML;

    document.getElementById("backBtn").addEventListener("click", showUserList);

    document.getElementById("createRoleSubmitBtn").addEventListener("click", () => {
        const name = document.getElementById("roleName").value;
        if (!name) {
            alert("Por favor, insira o nome do cargo.");
            return;
        }

        fetch("http://localhost:8080/role", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": getCookie("token")
            },
            body: JSON.stringify({ name })
        })
        .then(response => {
            if (response.ok) {
                alert("Cargo criado com sucesso!");
                showUserList();
            } else {
                throw new Error("Erro ao criar o cargo.");
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