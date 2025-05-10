function showRoleForm() {
    const roleFormHTML = `
        <h2>Criar Novo Cargo</h2>
        <form id="createRoleForm">
            <div class="form-group">
                <label for="roleName">Nome do Cargo:</label>
                <input type="text" id="roleName" name="roleName" required>
            </div>
            <h3>Permissões de Acesso:</h3>
            <div class="permissions-group">
                <label>
                    <input type="checkbox" name="permissions" value="users.view">
                    Visualizar Usuários
                </label><br>
                <label>
                    <input type="checkbox" name="permissions" value="users.create">
                    Criar Usuários
                </label><br>
                <label>
                    <input type="checkbox" name="permissions" value="users.edit">
                    Editar Usuários
                </label><br>
                <label>
                    <input type="checkbox" name="permissions" value="users.delete">
                    Excluir Usuários
                </label><br>
            </div>
            <button type="submit">Criar Cargo</button>
        </form>
        <div id="roleMessage"></div>
    `;

    document.getElementById("main-content").innerHTML = roleFormHTML;

    const createRoleForm = document.getElementById("createRoleForm");
    createRoleForm.addEventListener("submit", function(event) {
        event.preventDefault();
        createRole();
    });
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

    fetch("http://localhost:8080/roles", { // Certifique-se de que este endpoint esteja correto
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getCookie("token")}`
        },
        body: JSON.stringify(roleData)
    })
    .then(response => response.json()) // Aqui está a mudança: usamos `response.json()` para extrair os dados da resposta
    .then(data => { // Agora `data` contém a resposta JSON
        if (data.success) {  // Mudança aqui, você deve verificar o valor correto retornado
            alert("Cargo criado com sucesso!");
            // Opcional: Atualizar a lista de usuários para refletir o novo cargo
            // showUserList();
        } else {
            alert(`Erro ao criar cargo: ${data.message || 'Erro desconhecido'}`);
        }
    })
    .catch(error => {
        console.error("Erro ao criar cargo:", error);
        alert("Erro ao criar cargo. Tente novamente.");
    });
}
