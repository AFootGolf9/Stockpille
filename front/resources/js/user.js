async function loadUserInfo() {
    const token = getCookie("token");



    try {
        const response = await fetch('http://localhost:8080/user/validate', {
            method: 'GET',
            headers: {
                'Authorization': `${token}`, // Passa o token no cabeçalho
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar dados do usuário: ${response.status} ${response.statusText}`);
        }

        const userData = await response.json(); // Converte a resposta em JSON
        console.log("Resposta do servidor:", userData); // Debug

        if (userData.user && userData.user.name) {
            const userName = userData.user.name; // Acessa o nome do usuário
            document.getElementById('user-name').textContent = userName; // Atualiza o texto na interface
        } else {
            console.error('Erro: Estrutura de resposta inesperada ou usuário não encontrado.');
            document.getElementById('user-name').textContent = 'Nome não encontrado';
        }

    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error.message);
        document.getElementById('user-name').textContent = 'Erro ao carregar o nome';
    }
}

// Chama a função para carregar o nome do usuário ao carregar a página
document.addEventListener("DOMContentLoaded", function() {
    loadUserInfo();
});


  document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.getElementById("hamburger");
    const sidebar = document.querySelector(".sidebar");

    hamburger.addEventListener("click", function () {
      if (sidebar.classList.contains("show")) {
        sidebar.classList.remove("show");
        sidebar.classList.add("hide");
      } else {
        sidebar.classList.remove("hide");
        sidebar.classList.add("show");
      }
    });
  });
