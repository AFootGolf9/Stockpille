function getToken() {
    // Retorna o token simples do localStorage
    return localStorage.getItem('authToken'); 
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function showAllocationsList() {
    // ALTERAÇÃO APLICADA AQUI: Usando a classe genérica para o cabeçalho.
    const allocationsListHTML = `
        <div class="section-header">
            <h2>Lista de Alocações</h2>
        </div>
        <div id="allocations-list">
            <p>Carregando alocações...</p>
        </div>
    `;

    document.getElementById("main-content").innerHTML = allocationsListHTML;

    fetch("http://localhost:8080/allocation", {
        method: "GET",
        headers: {
            "Authorization": getCookie("token")
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log("Resposta do servidor:", data);

        if (data && Array.isArray(data.data) && data.data.length > 0) {
            const allocations = data.data;
            const allocationsListContainer = document.getElementById("allocations-list");

            const itemPromises = allocations.map(allocation =>
                fetch(`http://localhost:8080/item/${allocation.item_id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": getCookie("token")
                    }
                }).then(res => res.json())
            );
            const userPromises = allocations.map(allocation =>
                fetch(`http://localhost:8080/user/${allocation.user_id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": getCookie("token")
                    }
                }).then(res => res.json())
            );
            const locationPromises = allocations.map(allocation =>
                fetch(`http://localhost:8080/location/${allocation.location_id}`, {
                    method: "GET",
                    headers: {
                        "Authorization": getCookie("token")
                    }
                }).then(res => res.json())
            );

            Promise.all([Promise.all(itemPromises), Promise.all(userPromises), Promise.all(locationPromises)])
            .then(([items, users, locations]) => {
                // ALTERAÇÕES APLICADAS AQUI:
                // 1. Adicionado o "list-container"
                // 2. Tabela usa a classe "generic-list-table"
                // 3. Cada <td> tem seu "data-label" para responsividade
                const tableHTML = `
                    <div class="list-container">
                        <table class="generic-list-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Produto (SKU)</th>
                                    <th>Localização</th>
                                    <th>Usuário</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${allocations.map((allocation, index) => {
                                    const item = items[index]?.data || {};
                                    const user = users[index]?.data || {};
                                    const location = locations[index]?.data || {};

                                    return `
                                        <tr>
                                            <td data-label="ID">${allocation.id}</td>
                                            <td data-label="Produto (SKU)">${item.name || 'Produto não encontrado'} (${item.sku || 'SKU indisponível'})</td>
                                            <td data-label="Localização">${location.name || 'Locação não encontrada'}</td>
                                            <td data-label="Usuário">${user.name || 'Usuário não encontrado'}</td>
                                        </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
                allocationsListContainer.innerHTML = tableHTML;

            }).catch(error => {
                console.error("Erro ao carregar dados relacionados:", error);
                allocationsListContainer.innerHTML = `<p>Erro ao carregar dados adicionais: ${error.message}</p>`;
            });

        } else {
            document.getElementById("allocations-list").innerHTML = "<p>Nenhuma alocação encontrada.</p>";
        }
    })
    .catch(error => {
        console.error("Erro ao carregar as alocações:", error);
        document.getElementById("allocations-list").innerHTML = `<p>Erro ao carregar as alocações: ${error.message}</p>`;
    });
}