async function loadUserInfo() {
    const token = getCookie("token");

    if (!token) {
        window.location.href = "../pages/login.html"; // Redireciona para login se não estiver logado
        return;
    }

    // Decodifique o token para obter o ID do usuário logado
    const userId = parseJwt(token).id;

    if (!userId) {
        console.error("Erro: ID do usuário não encontrado no token.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/user/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });        

        if (!response.ok) {
            throw new Error(`Erro ao carregar dados do usuário: ${response.statusText}`);
        }

        const userData = await response.json(); // Obtém os dados do usuário logado
        console.log("Dados do usuário logado:", userData); // Para depuração

        if (userData.name) {
            document.getElementById('user-name').textContent = userData.name; // Atualiza o nome no header
        } else {
            console.error('Erro: Nome do usuário não encontrado.');
            document.getElementById('user-name').textContent = 'Nome não disponível';
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        document.getElementById('user-name').textContent = 'Erro ao carregar o nome';
    }
}

// Função para decodificar o token JWT
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Erro ao decodificar o token:', error);
        return null;
    }
}

// Função para obter o valor de um cookie
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1); 
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// Carregar o nome do usuário ao carregar a página
document.addEventListener("DOMContentLoaded", function() {
    loadUserInfo();
});
