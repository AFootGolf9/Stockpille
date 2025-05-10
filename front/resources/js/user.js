async function loadUserInfo() {
    const token = getCookie("token");// Exibe o token no console para depuração

    console.log(token);
    

    try {
        const response = await fetch('http://localhost:8080/user', {
            method: 'GET',
            headers: {
                'Authorization': `${token}`, // Passando o token para a requisição
            }
        });

        if (!response.ok) {
            throw new Error(`Erro ao carregar dados do usuário: ${response.statusText}`);
        }

        const responseText = await response.text();  // Pega a resposta como texto

        console.log("Resposta do servidor:", responseText);  // Exibe a resposta no console

        const userData = JSON.parse(responseText);  // Tenta converter a resposta em JSON

        if (userData.data && userData.data.length > 0) {
            // Aqui pegamos o primeiro usuário ou você pode ajustar para pegar o usuário desejado com base em outro critério
            const user = userData.data[0];  // Pega o primeiro usuário da lista (ou altere para outro critério, como ID)
            document.getElementById('user-name').textContent = user.name;  // Exibe o nome do usuário
        } else {
            console.error('Erro: Nenhum usuário encontrado');
            document.getElementById('user-name').textContent = 'Nome não encontrado';
        }

    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
        document.getElementById('user-name').textContent = 'Erro ao carregar o nome';
    }
}


// Chama a função para carregar o nome do usuário ao carregar a página
document.addEventListener("DOMContentLoaded", function() {
    loadUserInfo();
});
