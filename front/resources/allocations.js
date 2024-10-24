// Função para buscar as locações da API e exibir na área principal
function fetchAllocations() {
    // Exibir uma mensagem de carregamento antes de a resposta chegar
    document.getElementById('main-content').innerHTML = '<p>Carregando locações...</p>';

    // Fazer a requisição para a API (substitua a URL pela URL correta da sua API)
    fetch('https://suaapi.com/locacoes') // URL da API de locações
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar locações');
            }
            return response.json();
        })
        .then(data => {
            // Montar o HTML com os dados retornados da API
            let html = '<h2>Locações Registradas</h2>';
            html += '<ul>';

            data.forEach(locacao => {
                html += `<li>Locação ID: ${locacao.id}, Cliente: ${locacao.cliente}, Data: ${locacao.data}</li>`;
            });

            html += '</ul>';

            // Inserir o HTML gerado na área principal
            document.getElementById('main-content').innerHTML = html;
        })
        .catch(error => {
            console.error('Erro:', error);
            document.getElementById('main-content').innerHTML = '<p>Erro ao carregar locações. Tente novamente mais tarde.</p>';
        });
}

// Função para buscar locações e permitir a edição
function fetchAllocationsForEdit() {
    // Exibir uma mensagem de carregamento antes de a resposta chegar
    document.getElementById('main-content').innerHTML = '<p>Carregando locações para edição...</p>';

    // Fazer a requisição para a API (substitua a URL pela URL correta da sua API)
    fetch('https://suaapi.com/locacoes') // URL da API de locações
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar locações');
            }
            return response.json();
        })
        .then(data => {
            // Montar o HTML com os dados retornados da API
            let html = '<h2>Editar Locações</h2>';
            html += '<ul>';

            data.forEach(locacao => {
                html += `<li>
                            Locação ID: ${locacao.id}, Cliente: ${locacao.cliente}, Data: ${locacao.data}
                            <button onclick="editAllocation(${locacao.id})">Editar</button>
                         </li>`;
            });

            html += '</ul>';

            // Inserir o HTML gerado na área principal
            document.getElementById('main-content').innerHTML = html;
        })
        .catch(error => {
            console.error('Erro:', error);
            document.getElementById('main-content').innerHTML = '<p>Erro ao carregar locações. Tente novamente mais tarde.</p>';
        });
}

// Função para exibir o formulário de edição de uma locação específica
function editAllocation(id) {
    // Exibir uma mensagem de carregamento antes de a resposta chegar
    document.getElementById('main-content').innerHTML = '<p>Carregando dados da locação...</p>';

    // Fazer a requisição para buscar os dados da locação específica
    fetch(`https://suaapi.com/locacoes/${id}`) // URL para buscar os dados de uma locação específica
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar os detalhes da locação');
            }
            return response.json();
        })
        .then(locacao => {
            // Montar o formulário de edição com os dados da locação
            let html = `
                <h2>Editar Locação ID: ${locacao.id}</h2>
                <form id="edit-allocation-form">
                    <label for="cliente">Cliente:</label>
                    <input type="text" id="cliente" name="cliente" value="${locacao.cliente}">
                    <br>
                    <label for="data">Data:</label>
                    <input type="date" id="data" name="data" value="${locacao.data}">
                    <br>
                    <button type="button" onclick="submitEdit(${locacao.id})">Salvar</button>
                </form>
            `;

            // Inserir o formulário na área principal
            document.getElementById('main-content').innerHTML = html;
        })
        .catch(error => {
            console.error('Erro:', error);
            document.getElementById('main-content').innerHTML = '<p>Erro ao carregar os detalhes da locação. Tente novamente mais tarde.</p>';
        });
}

// Função para enviar os dados editados para a API
function submitEdit(id) {
    // Capturar os valores do formulário
    const cliente = document.getElementById('cliente').value;
    const data = document.getElementById('data').value;

    // Enviar os dados atualizados para a API
    fetch(`https://suaapi.com/locacoes/${id}`, {
        method: 'PUT', // Usar o método PUT para atualizar os dados
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cliente, data }) // Enviar os dados atualizados no corpo da requisição
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao salvar as alterações');
        }
        return response.json();
    })
    .then(data => {
        alert('Locação atualizada com sucesso!');
        fetchAllocationsForEdit(); // Recarregar a lista de locações para edição
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao salvar as alterações. Tente novamente mais tarde.');
    });
}
