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
            const table = cb.dataset.table;
            const permission = cb.dataset.permission;
            permissions[table] = (permissions[table] || "") + permission;
        });

        if (Object.keys(permissions).length === 0) {
            showNotification("É necessário selecionar pelo menos uma permissão para o cargo.", "error");
            return;
        }

        const permissionsArray = Object.keys(permissions).map(table => {
            return {
                table: table,
                Permission: permissions[table]
            };
        });

        const roleData = {
            name: roleName,
            permission: permissionsArray 
        };
        
        fetch("http://localhost:8080/role-permission", {
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

async function listExistingRoles() {
    const container = document.getElementById("existingRoles");
    container.innerHTML = "<p style='padding: 15px;'>Carregando cargos...</p>";

    try {
        const data = await fetch("http://localhost:8080/role", {
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse);

        const roles = data?.data || [];
        
        if (roles.length > 0) {
            let html = '<ul class="styled-list">';
            roles.forEach(role => {
                html += `<li class="styled-list-item">
                            <span>${role.name}</span>
                            <div class="list-item-actions">
                                <button class="btn-sm view-permissions-btn" data-role-id="${role.id}" data-role-name="${role.name}">Ver</button>
                                <button class="btn-sm btn-secondary edit-role-btn" data-role-id="${role.id}" data-role-name="${role.name}">Editar</button>
                                <button class="btn-sm btn-danger delete-role-btn" data-role-id="${role.id}" data-role-name="${role.name}">Excluir</button>
                            </div>
                          </li>`;
            });
            html += '</ul>';
            container.innerHTML = html;

            container.addEventListener('click', (event) => {
                const button = event.target.closest('button');
                if (!button) return;

                const roleId = button.dataset.roleId;
                const roleName = button.dataset.roleName;

                if (button.classList.contains('view-permissions-btn')) {
                    showRolePermissions(roleId, roleName);
                } else if (button.classList.contains('edit-role-btn')) {
                    showRoleEditForm(roleId, roleName);
                } else if (button.classList.contains('delete-role-btn')) {
                    deleteRole(roleId, roleName);
                }
            });

        } else {
            container.innerHTML = "<p style='padding: 15px;'>Nenhum cargo cadastrado ainda.</p>";
        }
    } catch (error) {
        console.error("Erro ao buscar cargos:", error);
        container.innerHTML = `<p class="error-message">Não foi possível carregar os cargos: ${error.message}</p>`;
    }
}

async function showRolePermissions(roleId, roleName) {
    try {
        const response = await fetch(`http://localhost:8080/role-permission/${roleId}`, {
            headers: { "Authorization": getCookie("token") }
        });
        
        const roleDetails = await handleResponse(response);

        const permissionsForRole = (roleDetails.permission || []).reduce((acc, perm) => {
            if (perm.table && typeof perm.Permission === 'string') {
                acc[perm.table] = perm.Permission.toUpperCase();
            }
            return acc;
        }, {});

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

        let tableHTML = `<div class="table-responsive-container"><table class="permission-table view-only"><thead><tr><th>Entidade</th>${actions.map(action => `<th>${action.displayName}</th>`).join('')}</tr></thead><tbody>`;
        
        entities.forEach(entity => {
            tableHTML += `<tr><td>${entity.displayName}</td>${actions.map(action => {
                const hasPermission = permissionsForRole[entity.tableName]?.includes(action.permission);
                const symbol = hasPermission
                    ? '<span class="permission-indicator granted"></span>'
                    : '<span class="permission-indicator denied"></span>';
                return `<td class="permission-cell">${symbol}</td>`;
            }).join('')}</tr>`;
        });

        tableHTML += '</tbody></table></div>';

        const permissionsViewHTML = `<div class="card-style"><div class="section-header"><h2>Permissões do Cargo: ${roleName}</h2></div><div class="view-container">${tableHTML}</div><div class="form-actions"><button type="button" id="backToRolesBtn" class="btn-secondary">Voltar</button></div></div>`;
        
        document.getElementById('main-content').innerHTML = permissionsViewHTML;
        document.getElementById('backToRolesBtn').addEventListener('click', showRoleForm);

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function showRoleEditForm(roleId, roleName) {
    try {
        const roleDetails = await fetch(`http://localhost:8080/role-permission/${roleId}`, {
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse);

        const currentName = roleName;
        const permissionsMap = (roleDetails.permission || []).reduce((acc, perm) => {
            if (perm.table && typeof perm.Permission === 'string') {
                acc[perm.table] = perm.Permission.toUpperCase();
            }
            return acc;
        }, {});

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

        let permissionsHTML = `<div class="table-responsive-container"><table class="permission-table"><thead><tr><th>Entidade</th>${actions.map(action => `<th>${action.displayName}</th>`).join('')}</tr></thead><tbody>`;
        entities.forEach(entity => {
            permissionsHTML += `<tr><td>${entity.displayName}</td>`;
            permissionsHTML += actions.map(action => {
                const isChecked = permissionsMap[entity.tableName]?.includes(action.permission);
                return `<td><label class="toggle-switch"><input type="checkbox" class="permission-checkbox" data-table="${entity.tableName}" data-permission="${action.permission}" ${isChecked ? 'checked' : ''}><span class="slider"></span></label></td>`;
            }).join('');
            permissionsHTML += `</tr>`;
        });
        permissionsHTML += '</tbody></table></div>';

        const formHTML = `
            <div class="form-container card-style">
                <div class="section-header">
                    <h2>Editar Cargo</h2>
                </div>
                <form id="editRoleForm">
                    <div class="form-group">
                        <label for="roleName">Nome do Cargo:</label>
                        <input type="text" id="roleName" name="roleName" value="${currentName}" required>
                    </div>
                    <div class="form-group">
                        <h3>Permissões de Acesso:</h3>
                        ${permissionsHTML}
                    </div>
                    <div class="form-actions">
                        <button type="button" id="backBtn" class="btn-secondary">Cancelar</button>
                        <button type="submit">Atualizar Cargo</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('main-content').innerHTML = formHTML;
        document.getElementById('backBtn').addEventListener('click', showRoleForm);

        document.getElementById('editRoleForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const newName = document.getElementById('roleName').value.trim();
            if (!newName) {
                showNotification("O nome do cargo é obrigatório.", "error");
                return;
            }

            const permissions = {};
            document.querySelectorAll(".permission-checkbox:checked").forEach(cb => {
                const table = cb.dataset.table;
                const permission = cb.dataset.permission;
                permissions[table] = (permissions[table] || "") + permission;
            });

            const permissionsArray = Object.keys(permissions).map(table => ({
                table: table,
                Permission: permissions[table]
            }));

            const roleData = {
                id: parseInt(roleId),
                name: newName,
                permission: permissionsArray
            };

            try {
                await fetch(`http://localhost:8080/role-permission`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': getCookie('token')
                    },
                    body: JSON.stringify(roleData)
                }).then(handleResponse);

                showNotification('Cargo atualizado com sucesso!', 'success');
                showRoleForm();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        });

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

async function deleteRole(roleId, roleName) {
    try {
        const userCountResponse = await fetch(`http://localhost:8080/rel/userbyrole?id=${roleId}`, {
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse);
        
        const userCount = userCountResponse[roleName] || 0;

        if (userCount > 0) {
            showNotification(`Não é possível excluir o cargo "${roleName}", pois ele está atribuído a ${userCount} usuário(s).`, 'error');
            return;
        }

        const confirmation = confirm(`Tem certeza que deseja excluir o cargo "${roleName}"? Esta ação não pode ser desfeita.`);

        if (!confirmation) {
            return;
        }

        await fetch(`http://localhost:8080/role/${roleId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': getCookie('token')
            }
        }).then(handleResponse);

        showNotification("Cargo excluído com sucesso!", 'success');
        showRoleForm();

    } catch (error) {
        showNotification(error.message, 'error');
    }
}