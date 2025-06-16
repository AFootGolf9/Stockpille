// role.js

function showRoleForm() {
    const entities = [
        { displayName: "Usuários", tableName: "user_data" },
        { displayName: "Cargos (Roles)", tableName: "role" },
        { displayName: "Itens", tableName: "item" },
        { displayName: "Categorias", tableName: "category" },
        { displayName: "Localizações", tableName: "location" },
        { displayName: "Alocações", tableName: "allocation" }
    ];

    const actions = [
        { displayName: "Ver", permission: "R" },
        { displayName: "Criar", permission: "W" },
        { displayName: "Editar", permission: "U" },
        { displayName: "Excluir", permission: "D" }
    ];

    // --- ALTERAÇÃO AQUI: Tabela com classes para melhor estilização ---
    let permissionsHTML = `
        <div class="table-responsive-container">
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
                        <label class="toggle-switch">
                            <input type="checkbox" class="permission-checkbox" data-table="${entity.tableName}" data-permission="${action.permission}">
                            <span class="slider"></span>
                        </label>
                    </td>
                `).join('')}
            </tr>
        `;
    });

    permissionsHTML += '</tbody></table></div>';

    // --- ALTERAÇÃO AQUI: Formulário com classes e estrutura de botões ---
    const roleFormHTML = `
        <div class="form-container card-style">
            <div class="section-header">
                <h2>Criar Novo Cargo</h2>
            </div>
            <form id="createRoleForm">
                <div class="form-group">
                    <label for="roleName">Nome do Cargo:</label>
                    <input type="text" id="roleName" name="roleName" required>
                </div>
                
                <div class="form-group">
                    <h3>Permissões de Acesso:</h3>
                    ${permissionsHTML}
                </div>

                <div class="form-actions">
                    <button type="button" id="backBtn" class="btn-secondary">Voltar</button>
                    <button type="submit" id="createRoleSubmitBtn">Criar Cargo</button>
                </div>
            </form>
        </div>

        <div class="list-container card-style" style="margin-top: 30px;">
             <div class="section-header">
                <h2>Cargos Existentes</h2>
            </div>
            <div id="existingRoles"></div>
        </div>
    `;

    document.getElementById("main-content").innerHTML = roleFormHTML;
    document.getElementById("backBtn").addEventListener("click", showUserList); // Supondo que showUserList exista
    document.getElementById("createRoleForm").addEventListener("submit", function (event) {
        event.preventDefault();
        createRole();
    });

    listExistingRoles();
}


function listExistingRoles() {
    fetch("http://localhost:8080/role", {
        headers: { "Authorization": getCookie("token") }
    })
    .then(response => response.json())
    .then(data => {
        const roles = data.data;
        const container = document.getElementById("existingRoles");
        if (Array.isArray(roles) && roles.length > 0) {
            // --- ALTERAÇÃO AQUI: Usando uma lista com classes para estilização ---
            let html = '<ul class="styled-list">';
            roles.forEach(role => {
                html += `<li class="styled-list-item">
                            <span>${role.name}</span>
                            <button class="btn-sm" onclick="showRolePermissions(${role.id}, '${role.name}')">Ver Permissões</button>
                         </li>`;
            });
            html += '</ul>';
            container.innerHTML = html;
        } else {
            container.innerHTML = "<p style='padding: 15px;'>Nenhum cargo cadastrado ainda.</p>";
        }
    })
    .catch(error => {
        console.error("Erro ao buscar cargos:", error);
        document.getElementById("existingRoles").innerHTML = "<p>Erro ao carregar cargos.</p>";
    });
}