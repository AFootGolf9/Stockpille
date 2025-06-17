
async function showUserList() {
    const userListHTML = `
    <div class="section-header">
        <h2>Lista de Usuários</h2>
        <div class="header-actions">
            <button id="createUserBtn">Criar Usuário</button>
            <button id="createRoleBtn">Criar Cargo</button>
        </div>
    </div>
    <div id="user-list-container">
        <p>Carregando usuários...</p>
    </div>
    <div id="role-list" class="role-list" style="margin-top: 20px;"></div>`;
    document.getElementById("main-content").innerHTML = userListHTML;

    const userListContainer = document.getElementById("user-list-container");

    try {
        // NOVO: Carrega cargos e usuários em paralelo para melhor performance.
        const [roleData, userData] = await Promise.all([
            fetch("http://localhost:8080/role", { headers: { "Authorization": getCookie("token") } }).then(handleResponse),
            fetch("http://localhost:8080/user", { headers: { "Authorization": getCookie("token") } }).then(handleResponse)
        ]);

        const roles = roleData?.data || [];
        const users = userData?.data || [];
        
        const roleMap = roles.reduce((map, role) => {
            map[role.id] = role.name;
            return map;
        }, {});

        if (users.length > 0) {
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

            // REATORADO: Event listener delegado para melhor performance.
            userListContainer.addEventListener('click', (event) => {
                const target = event.target;
                const userId = target.getAttribute('data-id');

                if (target.classList.contains('editBtn')) {
                    showUserForm(userId);
                } else if (target.classList.contains('deleteBtn')) {
                    deleteUser(userId);
                }
            });

        } else {
            userListContainer.innerHTML = "<p>Nenhum usuário cadastrado.</p>";
        }
    } catch (error) {
        // ALTERADO: Captura qualquer erro do Promise.all e exibe na interface.
        console.error("Erro ao carregar dados de usuários:", error);
        userListContainer.innerHTML = `<p class="error-message">Não foi possível carregar os dados: ${error.message}</p>`;
    }

    document.getElementById("createUserBtn").addEventListener("click", () => showUserForm());
    document.getElementById("createRoleBtn").addEventListener("click", () => showRoleForm());
    // Supondo que você tenha a função showRoleList
    document.getElementById("listRolesBtn").addEventListener("click", () => showRoleList()); 
}

// REATORADO: A função agora é async para simplificar o carregamento de dados.
async function showUserForm(userId = null) {
    const isEdit = Boolean(userId);
    const formHTML = `
        <h2>${isEdit ? 'Editar Usuário' : 'Cadastro de Usuário'}</h2>
        <div class="form-group">
            <label for="username">Nome:</label>
            <input type="text" id="username" name="username" required>
        </div>
        <div class="form-group">
            <label for="role">Cargo:</label>
            <select id="role" name="role" required>
                <option value="">Carregando cargos...</option>
            </select>
        </div>
        <div class="form-group">
            <label for="password">Senha:</label>
            <input type="password" id="password" name="password" ${isEdit ? 'placeholder="Deixe em branco para não alterar"' : 'required'}>
        </div>
        <div class="form-actions">
            <button type="button" id="backBtn">Voltar</button>
            <button id="registerBtn">${isEdit ? 'Atualizar Usuário' : 'Cadastrar Usuário'}</button>
        </div>
    `;
    document.getElementById("main-content").innerHTML = formHTML;

    document.getElementById("backBtn").addEventListener("click", showUserList);

    const roleSelect = document.getElementById("role");
    const usernameInput = document.getElementById("username");

    try {
        // NOVO: Carrega os cargos primeiro.
        const roleData = await fetch("http://localhost:8080/role", { headers: { "Authorization": getCookie("token") } }).then(handleResponse);
        const roles = roleData?.data || [];
        
        roleSelect.innerHTML = '<option value="">Selecione um cargo</option>'; // Limpa o "Carregando..."
        roles.forEach(role => {
            roleSelect.add(new Option(role.name, role.id));
        });

        // Se for edição, carrega os dados do usuário.
        if (isEdit) {
            const userData = await fetch(`http://localhost:8080/user/${userId}`, { headers: { "Authorization": getCookie("token") } }).then(handleResponse);
            const user = userData?.data;
            if (user) {
                usernameInput.value = user.name;
                roleSelect.value = user.roleId;
            }
        }
    } catch (error) {
        // ALTERADO: Usa notificação e volta para a lista em caso de erro.
        showNotification(`Erro ao carregar dados do formulário: ${error.message}`);
        showUserList();
    }

    document.getElementById("registerBtn").addEventListener("click", function() {
        const name = usernameInput.value.trim();
        const roleId = parseInt(document.getElementById("role").value, 10);
        const password = document.getElementById("password").value;

        if (!name || !roleId) {
            showNotification("Nome e Cargo são obrigatórios.", "error");
            return;
        }
        if (!isEdit && !password) {
            showNotification("A senha é obrigatória para novos usuários.", "error");
            return;
        }

        let userData = { name, roleId };
        if (password) { // Inclui a senha apenas se for preenchida
            userData.password = password;
        }

        const method = isEdit ? "PUT" : "POST";
        const url = isEdit ? `http://localhost:8080/user/${userId}` : "http://localhost:8080/user";

        fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": getCookie("token")
            },
            body: JSON.stringify(userData)
        })
        .then(handleResponse) // NOVO: Tratamento de erro
        .then(() => {
            showNotification(`Usuário ${isEdit ? 'atualizado' : 'cadastrado'} com sucesso!`, 'success');
            showUserList();
        })
        .catch(error => showNotification(error.message, 'error')); // ALTERADO
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
        const name = document.getElementById("roleName").value.trim();
        if (!name) {
            showNotification("Por favor, insira o nome do cargo.", "error");
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
        .then(handleResponse) // NOVO: Tratamento de erro
        .then(() => {
            showNotification("Cargo criado com sucesso!", 'success');
            showUserList(); // Ou showRoleList() se preferir ir para a lista de cargos
        })
        .catch(error => showNotification(error.message, 'error')); // ALTERADO
    });
}

function deleteUser(userId) {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
    
    fetch(`http://localhost:8080/user/${userId}`, {
        method: "DELETE",
        headers: { "Authorization": getCookie("token") }
    })
    .then(handleResponse) // NOVO: Tratamento de erro
    .then(() => {
        showNotification("Usuário excluído com sucesso!", 'success');
        showUserList();
    })
    .catch(error => showNotification(error.message, 'error')); // ALTERADO
}

// NOTA: Você precisará criar a função showRoleList() e as outras de edição/exclusão de cargos, 
// seguindo o mesmo padrão das funções acima.