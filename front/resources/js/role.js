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
            <h3>Permissões de Acesso:(ESTAS SAO DE EXEMPLO VOU IMPLEMENTAR MAIS DPS</h3>
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
            const html = `
                <ul>
                    ${roles.map(role => `
                        <li>
                            <strong>${role.name}</strong> - Permissões: ${role.permissions?.join(", ") || "Nenhuma"}
                            <!-- Botões de ação futura -->
                            <!-- <button onclick="editRole('${role.id}')">Editar</button> -->
                        </li>
                    `).join("")}
                </ul>
            `;
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
