function showRoleForm() {
    // ... (toda a parte de definição de 'entities', 'actions' e construção do HTML permanece a mesma) ...
    // Vou omitir essa parte para focar na mudança, mas ela deve continuar no seu código.

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
    document.getElementById("backBtn").addEventListener("click", showUserList);

    document.getElementById("createRoleForm").addEventListener("submit", function (event) {
        event.preventDefault();

        const roleName = document.getElementById("roleName").value.trim();
        if (!roleName) {
            showNotification("O nome do cargo é obrigatório.", "error");
            return;
        }

        const permissions = {};
        const checkboxes = document.querySelectorAll(".permission-checkbox:checked");
        
        checkboxes.forEach(cb => {
            const table = cb.getAttribute("data-table");
            const permission = cb.getAttribute("data-permission");
            if (!permissions[table]) {
                permissions[table] = "";
            }
            permissions[table] += permission;
        });

        // NOVO: Adiciona a validação para verificar se alguma permissão foi selecionada.
        if (Object.keys(permissions).length === 0) {
            showNotification("É necessário selecionar pelo menos uma permissão para o cargo.", "error");
            return; // Interrompe a execução se nenhuma permissão for selecionada.
        }

        const roleData = {
            name: roleName,
            permissions: permissions
        };
        
        fetch("http://localhost:8080/role", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": getCookie("token")
            },
            body: JSON.stringify(roleData)
        })
        .then(handleResponse)
        .then(() => {
            showNotification("Cargo criado com sucesso!", 'success');
            document.getElementById("createRoleForm").reset();
            listExistingRoles();
        })
        .catch(error => showNotification(error.message, 'error'));
    });

    listExistingRoles();
}


// REATORADO: A função agora é async e usa event listener delegado.
async function listExistingRoles() {
    const container = document.getElementById("existingRoles");
    container.innerHTML = "<p style='padding: 15px;'>Carregando cargos...</p>";

    try {
        const data = await fetch("http://localhost:8080/role", {
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse); // NOVO: Tratamento de erro

        const roles = data?.data || [];
        
        if (roles.length > 0) {
            let html = '<ul class="styled-list">';
            roles.forEach(role => {
                // NOVO: Adiciona data-attributes em vez de onclick
                html += `<li class="styled-list-item">
                            <span>${role.name}</span>
                            <button class="btn-sm view-permissions-btn" data-role-id="${role.id}" data-role-name="${role.name}">Ver Permissões</button>
                         </li>`;
            });
            html += '</ul>';
            container.innerHTML = html;

            // NOVO: Event listener delegado para os botões.
            container.addEventListener('click', (event) => {
                if (event.target.classList.contains('view-permissions-btn')) {
                    const roleId = event.target.dataset.roleId;
                    const roleName = event.target.dataset.roleName;
                    // Supondo que a função showRolePermissions exista e abra um modal ou outra tela.
                    showRolePermissions(roleId, roleName);
                }
            });

        } else {
            container.innerHTML = "<p style='padding: 15px;'>Nenhum cargo cadastrado ainda.</p>";
        }
    } catch (error) {
        // ALTERADO: Exibe erro detalhado na interface.
        console.error("Erro ao buscar cargos:", error);
        container.innerHTML = `<p class="error-message">Não foi possível carregar os cargos: ${error.message}</p>`;
    }
}


// NOTA: A função showRolePermissions(roleId, roleName) não foi fornecida,
// mas o código acima está pronto para chamá-la corretamente.
// Você precisará implementá-la, provavelmente para buscar e exibir
// as permissões de um cargo específico em um modal ou nova tela.