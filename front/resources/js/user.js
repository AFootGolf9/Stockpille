async function loadUserInfo() {
    const token = getCookie("token");

    try {
        const response = await fetch('http://localhost:8080/user/validate', {
            method: 'GET',
            headers: {
                'Authorization': `${token}`,
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar dados do usuário: ${response.status} ${response.statusText}`);
        }

        const userData = await response.json();
        console.log("Resposta do servidor:", userData);

        if (userData.user && userData.user.name) {
            document.getElementById('user-name').textContent = userData.user.name;
        } else {
            console.error('Erro: Estrutura de resposta inesperada ou usuário não encontrado.');
            document.getElementById('user-name').textContent = 'Nome não encontrado';
        }

    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error.message);
        document.getElementById('user-name').textContent = 'Erro ao carregar o nome';
    }
}

document.addEventListener("DOMContentLoaded", function () {
    loadUserInfo();

    const hamburger = document.getElementById("hamburger-btn");
    const sidebar = document.querySelector(".sidebar");

    if (hamburger && sidebar) {
        hamburger.addEventListener("click", function () {
            if (sidebar.classList.contains("show")) {
                sidebar.classList.remove("show");
                sidebar.classList.add("hide");
            } else {
                sidebar.classList.remove("hide");
                sidebar.classList.add("show");
            }
        });
    }
});
