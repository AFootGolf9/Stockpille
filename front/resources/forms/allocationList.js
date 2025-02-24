function showAllocationsList() {
    const allocationsListHTML = `
        <div class="allocations-header">
            <h2>Lista de Locações</h2>
        </div>
        <div id="allocations-list" class="allocations-list">
            <p>Carregando locações...</p>
        </div>
    `;

    document.getElementById("main-content").innerHTML = allocationsListHTML;

    fetch("http://localhost:8080/allocation")
    .then(response => response.json())
    .then(data => {
        console.log("Resposta do servidor:", data);

        if (data && Array.isArray(data.data) && data.data.length > 0) {
            const allocations = data.data;
            const allocationsListContainer = document.getElementById("allocations-list");

            const itemPromises = allocations.map(allocation =>
                fetch(`http://localhost:8080/item/${allocation.item_id}`).then(res => res.json())
            );
            const userPromises = allocations.map(allocation =>
                fetch(`http://localhost:8080/user/${allocation.user_id}`).then(res => res.json())
            );
            const locationPromises = allocations.map(allocation =>
                fetch(`http://localhost:8080/location/${allocation.location_id}`).then(res => res.json())
            );

            Promise.all([Promise.all(itemPromises), Promise.all(userPromises), Promise.all(locationPromises)])
            .then(([items, users, locations]) => {
                const tableHTML = `
                    <table class="allocations-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Produto (SKU)</th>
                                <th>Localização</th>
                                <th>Usuário</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${allocations.map((allocation, index) => {
                                const item = items[index]?.data || {};
                                const user = users[index]?.data || {};
                                const location = locations[index]?.data || {};

                                return `
                                    <tr>
                                        <td>${allocation.id}</td>
                                        <td>${item.name || 'Produto não encontrado'} (${item.sku || 'SKU indisponível'})</td>
                                        <td>${location.name || 'Locação não encontrada'}</td>
                                        <td>${user.name || 'Usuário não encontrado'}</td>
                                        <td>
                                            <button class="delete-btn" onclick="deleteAllocation(${allocation.id})">Excluir</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                `;
                allocationsListContainer.innerHTML = tableHTML;

            }).catch(error => {
                console.error("Erro ao carregar dados relacionados:", error);
                allocationsListContainer.innerHTML = `<p>Erro ao carregar dados adicionais: ${error.message}</p>`;
            });

        } else {
            document.getElementById("allocations-list").innerHTML = "<p>Nenhuma locação encontrada.</p>";
        }
    })
    .catch(error => {
        console.error("Erro ao carregar as locações:", error);
        document.getElementById("allocations-list").innerHTML = `<p>Erro ao carregar as locações: ${error.message}</p>`;
    });
}

function deleteAllocation(allocationId) {
    if (confirm("Tem certeza de que deseja excluir esta locação?")) {
        fetch(`http://localhost:8080/allocation/${allocationId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert("Locação excluída com sucesso!");
                showAllocationsList(); // Recarrega a lista de locações
            } else {
                throw new Error("Erro ao excluir a locação.");
            }
        })
        .catch(error => {
            console.error("Erro ao excluir a locação:", error);
            alert("Erro ao excluir a locação: " + error.message);
        });
    }
}
