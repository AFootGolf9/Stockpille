function showRoleForm() {
    // Mapeamento de entidades do frontend para tabelas do backend.
    // Adicione ou remova entidades conforme necessário.
    const entities = [
        { displayName: "Usuários", tableName: "user_data" },
        { displayName: "Cargos (Roles)", tableName: "role" },
        { displayName: "Itens", tableName: "item" },
        { displayName: "Categorias", tableName: "category" },
        { displayName: "Localizações", tableName: "location" },
        { displayName: "Alocações", tableName: "allocation" }
    ];

    // Mapeamento das ações para as letras de permissão do backend.
    const actions = [
        { displayName: "Ver", permission: "R" },
        { displayName: "Criar/Escrever", permission: "W" }, // Usando 'W' para ser consistente com mainController
        { displayName: "Editar", permission: "U" },
        { displayName: "Excluir", permission: "D" }
    ];

    let permissionsHTML = `
        <table class="permission-table">
            <thead>
                <tr>
                    <th>Entidade</th>
                    ${actions.map(action => `<th>${action.displayName}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
    `;

    entities.forEach(entity => {
        permissionsHTML += `
            <tr>
                <td>${entity.displayName}</td>
                ${actions.map(action => `
                    <td>
                        <input type="checkbox" class="permission-checkbox" data-table="${entity.tableName}" data-permission="${action.permission}">
                    </td>
                `).join('')}
            </tr>
        `;
    });

    permissionsHTML += '</tbody></table>';

    const roleFormHTML = `
        <h2>Criar Novo Cargo</h2>
        <form id="createRoleForm">
            <div class="form-group">
                <label for="roleName">Nome do Cargo:</label>
                <input type="text" id="roleName" name="roleName" required>
            </div>
            <h3>Permissões de Acesso:</h3>
            <div class="permissions-group">
                ${permissionsHTML}
            </div>
            <button type="submit">Criar Cargo</button>
        </form>
        <hr>
        <h2>Cargos Existentes</h2>
        <div id="existingRoles"></div>
    `;

    document.getElementById("main-content").innerHTML = roleFormHTML;

    document.getElementById("createRoleForm").addEventListener("submit", function (event) {
        event.preventDefault();
        createRole();
    });

    listExistingRoles();
}


/**
 * Coleta os dados do formulário, formata corretamente e envia para a API.
 */
function createRole() {
    const roleName = document.getElementById("roleName").value;
    if (!roleName) {
        alert("Por favor, insira o nome do cargo.");
        return;
    }

    // Monta o objeto de permissões no formato que o backend espera
    const permissionsMap = {};
    document.querySelectorAll('.permission-checkbox:checked').forEach(checkbox => {
        const table = checkbox.getAttribute('data-table');
        const permission = checkbox.getAttribute('data-permission');
        if (!permissionsMap[table]) {
            permissionsMap[table] = '';
        }
        permissionsMap[table] += permission;
    });

    // Converte o mapa para o array de objetos final
    const permissionsPayload = Object.keys(permissionsMap).map(table => {
        return {
            Table: table,
            Permission: permissionsMap[table]
        };
    });

    const roleData = {
        name: roleName,
        permission: permissionsPayload // Corrigido para 'permission' como no backend
    };

    // A rota para criar cargo e permissões é a que está em `rolePermission.go`
    fetch("http://localhost:8080/permission", { // Verifique se esta é a rota correta no seu router
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getCookie("token")}`
        },
        body: JSON.stringify(roleData)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw new Error(err.error || "Erro ao criar cargo.") });
        }
        return response.json();
    })
    .then(() => {
        alert("Cargo criado com sucesso!");
        showRoleForm(); // Recarrega o formulário e a lista
    })
    .catch(error => {
        console.error("Erro ao criar cargo:", error);
        alert(error.message);
    });
}

/**
 * Lista os cargos existentes. A exibição foi simplificada.
 */
function listExistingRoles() {
    fetch("http://localhost:8080/role", { // Assumindo que /role retorna todos os cargos
        headers: { "Authorization": `Bearer ${getCookie("token")}` }
    })
    .then(response => response.json())
    .then(data => {
        const roles = data.data;
        const container = document.getElementById("existingRoles");
        if (Array.isArray(roles) && roles.length > 0) {
            let html = '<ul>';
            roles.forEach(role => {
                html += `<li><strong>${role.name}</strong> (ID: ${role.id})</li>`;
            });
            html += '</ul>';
            container.innerHTML = html;
        } else {
            container.innerHTML = "<p>Nenhum cargo cadastrado ainda.</p>";
        }
    })
    .catch(error => {
        console.error("Erro ao buscar cargos:", error);
        document.getElementById("existingRoles").innerHTML = "<p>Erro ao carregar cargos.</p>";
    });
}