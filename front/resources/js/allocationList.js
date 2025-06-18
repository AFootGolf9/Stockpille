function getToken() {
    return localStorage.getItem('authToken');
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function showAllocationsList() {
    const allocationsListHTML = `
        <div class="section-header">
            <h2>Lista de Alocações</h2>
        </div>
        <div class="product-filter"></div>
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
        const allocations = data.data;
        const allocationsListContainer = document.getElementById("allocations-list");

        if (!Array.isArray(allocations) || allocations.length === 0) {
            allocationsListContainer.innerHTML = "<p>Nenhuma alocação encontrada.</p>";
            return;
        }

        const itemPromises = allocations.map(allocation =>
            fetch(`http://localhost:8080/item/${allocation.item_id}`, {
                method: "GET",
                headers: { "Authorization": getCookie("token") }
            }).then(res => res.json())
        );
        const userPromises = allocations.map(allocation =>
            fetch(`http://localhost:8080/user/${allocation.user_id}`, {
                method: "GET",
                headers: { "Authorization": getCookie("token") }
            }).then(res => res.json())
        );
        const locationPromises = allocations.map(allocation =>
            fetch(`http://localhost:8080/location/${allocation.location_id}`, {
                method: "GET",
                headers: { "Authorization": getCookie("token") }
            }).then(res => res.json())
        );

        Promise.all([Promise.all(itemPromises), Promise.all(userPromises), Promise.all(locationPromises)])
        .then(([items, users, locations]) => {
            const tableHTML = `
                <div class="list-container">
                    <table class="generic-list-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Produto</th>
                                <th>SKU</th>
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
                                    <tr id="alloc-row-${allocation.id}">
                                        <td data-label="ID">${allocation.id}</td>
                                        <td data-label="Produto">${item.name || 'Produto não encontrado'}</td>
                                        <td data-label="SKU">${item.sku || 'N/D'}</td>
                                        <td data-label="Localização">${location.name || 'Locação não encontrada'}</td>
                                        <td data-label="Usuário">${user.name || 'Usuário não encontrado'}</td>
                                        <td data-label="Ações">
                                            <button data-id="${allocation.id}" class="btn-danger">Excluir</button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            allocationsListContainer.innerHTML = tableHTML;
            
            allocationsListContainer.addEventListener('click', (event) => {
                const target = event.target;
                if (target.tagName === 'BUTTON' && target.classList.contains('btn-danger')) {
                    const allocationId = target.dataset.id;
                    deleteAllocation(parseInt(allocationId));
                }
            });
        })
        .catch(error => {
            console.error("Erro ao carregar dados relacionados:", error);
            allocationsListContainer.innerHTML = `<p>Erro ao carregar dados adicionais: ${error.message}</p>`;
        });
    })
    .catch(error => {
        console.error("Erro ao carregar as alocações:", error);
        document.getElementById("allocations-list").innerHTML = `<p>Erro ao carregar as alocações: ${error.message}</p>`;
    });
}

async function deleteAllocation(allocationId) {
    if (!allocationId) {
        showNotification("Não foi possível obter o ID da alocação. Tente recarregar a página.", "error");
        return;
    }

    try {
        await showConfirmationModal("Tem certeza que deseja excluir esta alocação? O estoque do item será ajustado.", "Excluir Alocação");

        await fetch(`http://localhost:8080/allocation/${allocationId}`, {
            method: "DELETE",
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse);

        const row = document.getElementById(`alloc-row-${allocationId}`);
        if (row) {
            row.remove();
        }
        showNotification("Alocação excluída e estoque ajustado com sucesso!", "success");

    } catch (error) {
        if (error && error.message) {
            console.error("Erro no processo de exclusão da alocação:", error);
            showNotification(`Erro ao excluir: ${error.message}`, "error");
        } else {
            console.log("Exclusão de alocação cancelada.");
        }
    }
}

function showConfirmationModal(message, title = 'Confirmar Ação') {
    return new Promise((resolve, reject) => {
        const overlay = document.createElement('div');
        overlay.className = 'confirmation-overlay';

        overlay.innerHTML = `
            <div class="confirmation-modal">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="confirmation-modal-actions">
                    <button class="confirmation-btn-cancel">Cancelar</button>
                    <button class="confirmation-btn-confirm">Confirmar</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        setTimeout(() => overlay.classList.add('visible'), 10);

        const confirmBtn = overlay.querySelector('.confirmation-btn-confirm');
        const cancelBtn = overlay.querySelector('.confirmation-btn-cancel');

        const closeModal = () => {
            overlay.classList.remove('visible');
            setTimeout(() => {
                if(document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }, 300);
        };

        confirmBtn.addEventListener('click', () => {
            closeModal();
            resolve();
        });

        cancelBtn.addEventListener('click', () => {
            closeModal();
            reject();
        });

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeModal();
                reject();
            }
        });
    });
}