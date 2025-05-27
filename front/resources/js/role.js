function showRoleForm() {
    const entities = ["users", "roles", "products"];
    const actions = ["view", "create", "edit", "delete"];

    // Gera dinamicamente os checkboxes de permissões
    let permissionsHTML = '';
    entities.forEach(entity => {
        actions.forEach(action => {
            const permission = `${entity}.${action}`;
            permissionsHTML += `
                <label>
                    <input type="checkbox" name="permissions" value="${permission}">
                    ${action.charAt(0).toUpperCase() + action.slice(1)} ${capitalize(entity)}
                </label><br>
            `;
        });
        permissionsHTML += `<br>`;
    });

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
        <div id="roleMessage"></div>
        <hr>
        <h2>Cargos Existentes</h2>
        <div id="existingRoles"></div>
    `;

    document.getElementById("main-content").innerHTML = roleFormHTML;

    const createRoleForm = document.getElementById("createRoleForm");
    createRoleForm.addEventListener("submit", function(event) {
        event.preventDefault();
        createRole();
    });

    listExistingRoles();
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function createRole() {
    const roleName = document.getElementById("roleName").value;
    const permissionCheckboxes = document.querySelectorAll('input[name="permissions"]:checked');
    const permissions = Array.from(permissionCheckboxes).map(checkbox => checkbox.value);

    if (!roleName) {
        alert("Por favor, insira o nome do cargo.");
        return;
    }

    const roleData = {
        name: roleName,
        permissions: permissions
    };

    fetch("http://localhost:8080/roles", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getCookie("token")}`
        },
        body: JSON.stringify(roleData)
    })
    .then(response => {
        if (!response.ok) throw new Error("Erro ao criar cargo.");
        return response.json();
    })
    .then(data => {
        alert("Cargo criado com sucesso!");
        showRoleForm(); // Recarrega para atualizar a lista
    })
    .catch(error => {
        console.error("Erro ao criar cargo:", error);
        alert("Erro ao criar cargo. Tente novamente.");
    });
}

function listExistingRoles() {
    fetch("http://localhost:8080/roles", {
        headers: {
            "Authorization": `Bearer ${getCookie("token")}`
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("Erro ao carregar cargos.");
        return response.json();
    })
    .then(data => {
        const roles = data.data;
        const container = document.getElementById("existingRoles");

        if (Array.isArray(roles) && roles.length > 0) {
            const html = roles.map(role => {
                const permissionsHtml = Object.entries(role.permissions || {}).map(([table, perms]) => `
                    <div>
                        <strong>${table}</strong>: 
                        <span id="perm-${role.id}-${table}">${perms}</span>
                        <input id="edit-${role.id}-${table}" type="text" value="${perms}" style="display:none;">
                        <button onclick="toggleEdit('${role.id}', '${table}')">Editar</button>
                        <button onclick="savePermission('${role.id}', '${table}')" style="display:none;" id="save-${role.id}-${table}">Salvar</button>
                    </div>
                `).join("");

                return `
                    <div style="margin-bottom: 15px;">
                        <strong>${role.name}</strong>
                        <div>${permissionsHtml || "Nenhuma permissão atribuída"}</div>
                    </div>
                `;
            }).join("");

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

function toggleEdit(roleId, table) {
    document.getElementById(`perm-${roleId}-${table}`).style.display = "none";
    document.getElementById(`edit-${roleId}-${table}`).style.display = "inline";
    document.getElementById(`save-${roleId}-${table}`).style.display = "inline";
}

function savePermission(roleId, table) {
    const newPermission = document.getElementById(`edit-${roleId}-${table}`).value;

    fetch(`http://localhost:8080/roles/${roleId}/permissions`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getCookie("token")}`
        },
        body: JSON.stringify({ table: table, permission: newPermission })
    })
    .then(response => {
        if (!response.ok) throw new Error("Erro ao atualizar permissão.");
        return response.json();
    })
    .then(data => {
        alert("Permissão atualizada com sucesso.");
        listExistingRoles();
    })
    .catch(error => {
        console.error("Erro ao atualizar permissão:", error);
        alert("Erro ao atualizar permissão.");
    });
}
