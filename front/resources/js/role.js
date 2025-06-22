function showRoleForm() {
    const entities = [
        { displayName: "Usuários", tableName: "user_data" },
        { displayName: "Cargos", tableName: "role" },
        { displayName: "Itens", tableName: "item" },
        { displayName: "Categorias", tableName: "category" },
        { displayName: "Localizações", tableName: "location" },
        { displayName: "Alocações", tableName: "allocation" },
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

    const baseEntities = entities.filter(e => !e.tableName.startsWith('relatorio'));

    baseEntities.forEach(entity => {
        permissionsHTML += `<tr><td>${entity.displayName}</td>`;
        permissionsHTML += actions.map(action => {
            return `
                <td>
                    <label class="toggle-switch">
                        <input type="checkbox" class="permission-checkbox" data-table="${entity.tableName}" data-permission="${action.permission}">
                        <span class="slider"></span>
                    </label>
                </td>
            `;
        }).join('');
        permissionsHTML += `</tr>`;
    });

    permissionsHTML += `
        <tr>
            <td>Relatórios</td>
            <td>
                <label class="toggle-switch">
                    <input type="checkbox" id="master-report-checkbox">
                    <span class="slider"></span>
                </label>
            </td>
            <td class="disabled-cell"></td>
            <td class="disabled-cell"></td>
            <td class="disabled-cell"></td>
        </tr>
    `;

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
    document.getElementById("backBtn").addEventListener("click", showRoleForm);
    
    document.getElementById("createRoleForm").addEventListener("submit", function (event) {
        event.preventDefault();
        const roleName = document.getElementById("roleName").value.trim();
        if (!roleName) {
            showNotification("O nome do cargo é obrigatório.", "error");
            return;
        }

        const permissions = {};
        
        // Coleta as permissões das checkboxes
        document.querySelectorAll(".permission-checkbox").forEach(cb => { // Removido :checked para iterar sobre todas
            const table = cb.dataset.table;
            const permission = cb.dataset.permission;
            if (cb.checked) {
                permissions[table] = (permissions[table] || "") + permission;
            }
        });

        // Adiciona 4 espaços vazios para tabelas sem permissão, se não for relatorio
        entities.forEach(entity => {
            if (!entity.tableName.startsWith('relatorio') && !permissions[entity.tableName]) {
                permissions[entity.tableName] = "    "; // 4 caracteres vazios
            }
        });

        if (document.getElementById('master-report-checkbox').checked) {
            const reportTableNames = ["relatorio1", "relatorio2", "relatorio3", "relatorio4", "relatorio5"];
            reportTableNames.forEach(tableName => {
                permissions[tableName] = "R";
            });
        } else {
             // Se o master-report-checkbox não estiver marcado, garante que os relatórios também recebam 4 espaços
            const reportTableNames = ["relatorio1", "relatorio2", "relatorio3", "relatorio4", "relatorio5"];
            reportTableNames.forEach(tableName => {
                if (!permissions[tableName]) {
                    permissions[tableName] = "    "; // 4 caracteres vazios para relatórios sem permissão
                }
            });
        }
        
        // Converte o objeto de permissões em um array no formato esperado pelo backend
        const permissionsArray = Object.keys(permissions).map(table => ({
            table: table,
            Permission: permissions[table]
        }));
        
        // Se após todas as verificações não houver permissão válida (apenas "    " em todos), exibe um erro.
        // Isso é para evitar que um cargo seja criado sem *nenhuma* permissão útil.
        const hasUsefulPermission = permissionsArray.some(p => p.Permission.trim() !== "");
        if (!hasUsefulPermission) {
            showNotification("É necessário selecionar pelo menos uma permissão válida para o cargo.", "error");
            return;
        }

        const roleData = {
            name: roleName,
            permission: permissionsArray
        };

        fetch("http://localhost:8080/role-permission", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": getCookie("token") },
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
                                <button class="btn-sm btn-edit edit-role-btn" data-role-id="${role.id}" data-role-name="${role.name}">Editar</button>
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
            { displayName: "Cargos", tableName: "role" },
            { displayName: "Itens", tableName: "item" },
            { displayName: "Categorias", tableName: "category" },
            { displayName: "Localizações", tableName: "location" },
            { displayName: "Alocações", tableName: "allocation" }
        ];

        const reportEntities = ["relatorio1", "relatorio2", "relatorio3", "relatorio4", "relatorio5"];
        const hasAllReportsPermission = reportEntities.every(report => permissionsForRole[report]?.includes('R'));

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
                const symbol = hasPermission ? '<span class="permission-indicator granted"></span>' : '<span class="permission-indicator denied"></span>';
                return `<td class="permission-cell">${symbol}</td>`;
            }).join('')}</tr>`;
        });

        const allReportsSymbol = hasAllReportsPermission ? '<span class="permission-indicator granted"></span>' : '<span class="permission-indicator denied"></span>';
        tableHTML += `
            <tr>
                <td>Relatórios</td>
                <td class="permission-cell">${allReportsSymbol}</td>
                <td class="disabled-cell"></td>
                <td class="disabled-cell"></td>
                <td class="disabled-cell"></td>
            </tr>
        `;
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
            { displayName: "Cargos", tableName: "role" },
            { displayName: "Itens", tableName: "item" },
            { displayName: "Categorias", tableName: "category" },
            { displayName: "Localizações", tableName: "location" },
            { displayName: "Alocações", tableName: "allocation" },
        ];
        
        const reportTableNames = ["relatorio1", "relatorio2", "relatorio3", "relatorio4", "relatorio5"];
        const actions = [
            { displayName: "Ver", permission: "R" },
            { displayName: "Criar", permission: "W" },
            { displayName: "Editar", permission: "U" },
            { displayName: "Excluir", permission: "D" }
        ];

        let permissionsHTML = `<div class="table-responsive-container"><table class="permission-table"><thead><tr><th>Entidade</th>${actions.map(action => `<th>${action.displayName}</th>`).join('')}</tr></thead><tbody>`;
        
        const baseEntities = entities.filter(e => !e.tableName.startsWith('relatorio'));
        const allReportsChecked = reportTableNames.every(name => permissionsMap[name]?.includes('R'));

        baseEntities.forEach(entity => {
            permissionsHTML += `<tr><td>${entity.displayName}</td>`;
            permissionsHTML += actions.map(action => {
                const isChecked = permissionsMap[entity.tableName]?.includes(action.permission);
                return `<td><label class="toggle-switch"><input type="checkbox" class="permission-checkbox" data-table="${entity.tableName}" data-permission="${action.permission}" ${isChecked ? 'checked' : ''}><span class="slider"></span></label></td>`;
            }).join('');
            permissionsHTML += `</tr>`;
        });

        permissionsHTML += `
            <tr>
                <td>Relatórios</td>
                <td>
                    <label class="toggle-switch">
                        <input type="checkbox" id="master-report-checkbox" ${allReportsChecked ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </td>
                <td class="disabled-cell"></td>
                <td class="disabled-cell"></td>
                <td class="disabled-cell"></td>
            </tr>
        `;
        permissionsHTML += '</tbody></table></div>';

        const formHTML = `
            <div class="form-container card-style">
                <div class="section-header"><h2>Editar Cargo</h2></div>
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
                        <button type="submit" class="btn-primary">Atualizar Cargo</button>
                    </div>
                </form>
            </div>
        `;

        document.getElementById('main-content').innerHTML = formHTML;
        document.getElementById('backBtn').addEventListener('click', showRoleForm);

        // ===== LÓGICA DE SUBMIT CORRIGIDA E SIMPLIFICADA =====
        document.getElementById('editRoleForm').addEventListener('submit', async (event) => {
            event.preventDefault();
            const newName = document.getElementById('roleName').value.trim();
            if (!newName) {
                showNotification("O nome do cargo é obrigatório.", "error");
                return;
            }

            const permissions = {};
            
            // Coleta as permissões das checkboxes
            document.querySelectorAll(".permission-checkbox").forEach(cb => { // Removido :checked para iterar sobre todas
                const table = cb.dataset.table;
                const permission = cb.dataset.permission;
                if (cb.checked) {
                    permissions[table] = (permissions[table] || "") + permission;
                }
            });

            // Adiciona 4 espaços vazios para tabelas sem permissão, se não for relatorio
            entities.forEach(entity => {
                if (!entity.tableName.startsWith('relatorio') && !permissions[entity.tableName]) {
                    permissions[entity.tableName] = "    "; // 4 caracteres vazios
                }
            });
            
            const isMasterChecked = document.getElementById('master-report-checkbox').checked;
            if (isMasterChecked) {
                reportTableNames.forEach(tableName => {
                    permissions[tableName] = "R";
                });
            } else {
                // Se o master-report-checkbox não estiver marcado, garante que os relatórios também recebam 4 espaços
                reportTableNames.forEach(tableName => {
                    if (!permissions[tableName]) {
                        permissions[tableName] = "    "; // 4 caracteres vazios para relatórios sem permissão
                    }
                });
            }
            
            const permissionsArray = Object.keys(permissions).map(table => ({
                table: table,
                Permission: permissions[table]
            }));

            // Verifica se há pelo menos uma permissão útil (não apenas "    ")
            const hasUsefulPermission = permissionsArray.some(p => p.Permission.trim() !== "");
            if (!hasUsefulPermission) {
                showNotification("É necessário selecionar pelo menos uma permissão válida para o cargo.", "error");
                return;
            }
            
            const roleData = {
                id: parseInt(roleId),
                name: newName,
                permission: permissionsArray
            };

            try {
                await fetch(`http://localhost:8080/role-permission`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': getCookie('token') },
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
        await showConfirmationModal(`Tem certeza que deseja excluir o cargo "${roleName}"? Esta ação não pode ser desfeita.`, "Confirmar Exclusão");
        await fetch(`http://localhost:8080/role/${roleId}`, {
            method: 'DELETE',
            headers: { 'Authorization': getCookie('token') }
        }).then(handleResponse);
        showNotification("Cargo excluído com sucesso!", 'success');
        showRoleForm();
    } catch (error) {
        if (error && error.message) {
            showNotification(error.message, 'error');
        } else {
            console.log("Exclusão de cargo cancelada pelo usuário.");
        }
    }
}

function showConfirmationModal(message, title = 'Confirmar Ação') {
    return new Promise((resolve, reject) => {
        if (document.querySelector('.confirmation-overlay')) {
            return reject();
        }
        const overlay = document.createElement('div');
        overlay.className = 'confirmation-overlay';
        overlay.innerHTML = `
            <div class="confirmation-modal">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="confirmation-modal-actions">
                    <button class="confirmation-btn-cancel">Cancelar</button>
                    <button class="confirmation-btn-confirm">Confirmar</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('visible'), 10);
        const confirmBtn = overlay.querySelector('.confirmation-btn-confirm');
        const cancelBtn = overlay.querySelector('.confirmation-btn-cancel');
        const closeModal = (isConfirmed) => {
            overlay.classList.remove('visible');
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
                if (isConfirmed) {
                    resolve();
                } else {
                    reject();
                }
            }, 300);
        };
        confirmBtn.addEventListener('click', () => closeModal(true));
        cancelBtn.addEventListener('click', () => closeModal(false));
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeModal(false);
            }
        });
    });
}