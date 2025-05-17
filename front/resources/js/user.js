let userPermissions = []; // Permissões globais do usuário

async function loadUserInfo() {
    const token = getCookie("token");
    console.log(token);

    try {
        const response = await fetch('http://localhost:8080/user', {
            method: 'GET',
            headers: {
                'Authorization': `${token}`,
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar dados do usuário: ${response.statusText}`);
        }

        const responseText = await response.text();
        console.log("Resposta do servidor:", responseText);

        const userData = JSON.parse(responseText);

        if (userData.data && userData.data.length > 0) {
            const user = userData.data[0];
            document.getElementById('user-name').textContent = user.name;

            // Armazena as permissões do usuário se existirem
            if (user.role && user.role.permissions) {
                userPermissions = user.role.permissions;
                console.log("Permissões do usuário:", userPermissions);
            }

            // Aplica as permissões após carregar o usuário
            aplicarControleDePermissoes();

        } else {
            console.error('Erro: Nenhum usuário encontrado');
            document.getElementById('user-name').textContent = 'Nome não encontrado';
        }

    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
        document.getElementById('user-name').textContent = 'Erro ao carregar o nome';
    }
}

// Verifica se o usuário possui uma permissão específica
function hasPermission(permission) {
    return userPermissions.includes(permission);
}

// Esconde todos os elementos com permissão que o usuário não tem
function aplicarControleDePermissoes() {
    const elements = document.querySelectorAll('.restricted');
    elements.forEach(el => {
        const perm = el.dataset.permission;
        if (!hasPermission(perm)) {
            el.style.display = 'none';
        }
    });
}

// Chama a função ao carregar a página
document.addEventListener("DOMContentLoaded", function () {
    loadUserInfo();
});
