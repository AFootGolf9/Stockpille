// Funções auxiliares (getToken, getCookie) - mantidas
function getToken() {
    return localStorage.getItem('authToken');
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

// =================================================================
// FUNÇÃO handleErrors (COPIADA DO SEU login.js - IMPORTANTE ESTAR ACESSÍVEL)
// =================================================================
async function handleErrors(response) {
    if (!response.ok) {
        let errorMessage = "Ocorreu um erro inesperado."; // Mensagem padrão

        try {
            const errorData = await response.json();
            if (errorData && (errorData.message || errorData.error)) {
                throw new Error(errorData.message || errorData.error);
            }
        } catch (jsonError) {
            // Corpo do erro não era JSON ou não tinha uma mensagem específica
        }
        
        switch (response.status) {
            case 400: // Bad Request
                errorMessage = "Requisição inválida. Verifique os dados enviados."; 
                break;
            case 401: // Unauthorized
                errorMessage = "Sua sessão expirou ou você não está autenticado. Faça login novamente.";
                break;
            case 403: // Forbidden
                errorMessage = "Não é possível ver as alocações por conta da permissão do cargo."; // Mensagem específica
                break;
            case 404: // Not Found (se a rota não existir, por exemplo)
                errorMessage = "Recurso não encontrado.";
                break;
            case 500: // Internal Server Error
                errorMessage = "Ocorreu um erro no servidor. Tente novamente mais tarde.";
                break;
            default:
                errorMessage = `Erro: ${response.statusText} (código: ${response.status})`;
        }

        throw new Error(errorMessage);
    }
    return response.json();
}

// =================================================================
// FUNÇÃO showNotification (RECRIADA NO ESTILO "TOAST" OU "SNACKBAR")
// =================================================================
function showNotification(message, type = 'info') {
    const notificationContainer = document.getElementById('notification-container');
    // Se o container não existir, crie-o no body
    if (!notificationContainer) {
        const newContainer = document.createElement('div');
        newContainer.id = 'notification-container';
        document.body.appendChild(newContainer);
        // showNotification(message, type); // Chame novamente para adicionar a notificação
        // return; // Saia para evitar duplicação ou erro se já estiver aqui
        // No seu caso, se o container não existe, adicione-o e prossiga
        // Uma melhor prática seria ter o container no seu HTML base.
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`; // Classes CSS para estilização (ex: .notification, .success, .error)
    notification.textContent = message;

    // Adiciona a notificação ao container (você pode querer um container específico no seu HTML)
    document.getElementById('notification-container').appendChild(notification);

    // Força o reflow para garantir que a transição CSS funcione
    void notification.offsetWidth;

    notification.classList.add('show'); // Adiciona classe para exibir a notificação

    // Remove a notificação após alguns segundos
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide'); // Adiciona classe para iniciar a animação de saída
        // Remove o elemento do DOM após a animação de saída
        notification.addEventListener('transitionend', () => {
            notification.remove();
        }, { once: true }); // Garante que o evento seja removido após ser disparado
    }, 4000); // Notificação visível por 4 segundos
}


// =================================================================
// FUNÇÃO showAllocationsList (MODIFICADA)
// =================================================================
function showAllocationsList() {
    const allocationsListHTML = `
        <div class="section-header">
            <h2>Lista de Alocações</h2>
        </div>
        <div class="product-filter"></div>
        <div id="allocations-list">
            <p>Carregando alocações...</p>
        </div>
        <div id="notification-container" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;"></div>
    `;

    document.getElementById("main-content").innerHTML = allocationsListHTML;
    const allocationsListContainer = document.getElementById("allocations-list");

    fetch("http://localhost:8080/allocation", {
        method: "GET",
        headers: {
            "Authorization": getCookie("token")
        }
    })
    .then(handleErrors) // Use o handleErrors aqui para tratar respostas não-OK
    .then(data => {
        const allocations = data.data;

        if (!Array.isArray(allocations) || allocations.length === 0) {
            allocationsListContainer.innerHTML = "<p>Nenhuma alocação encontrada.</p>";
            return;
        }

        // Se houver alocações, busca os dados relacionados (itens, usuários, localizações)
        const itemPromises = allocations.map(allocation =>
            fetch(`http://localhost:8080/item/${allocation.item_id}`, {
                method: "GET",
                headers: { "Authorization": getCookie("token") }
            }).then(handleErrors)
        );
        const userPromises = allocations.map(allocation =>
            fetch(`http://localhost:8080/user/${allocation.user_id}`, {
                method: "GET",
                headers: { "Authorization": getCookie("token") }
            }).then(handleErrors)
        );
        const locationPromises = allocations.map(allocation =>
            fetch(`http://localhost:8080/location/${allocation.location_id}`, {
                method: "GET",
                headers: { "Authorization": getCookie("token") }
            }).then(handleErrors)
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
                                            <button data-id="${allocation.id}" class="deleteBtn">Excluir</button>
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
                if (target.tagName === 'BUTTON' && target.classList.contains('deleteBtn')) {
                    const allocationId = target.dataset.id;
                    deleteAllocation(parseInt(allocationId));
                }
            });
        })
        .catch(error => {
            console.error("Erro ao carregar dados relacionados:", error);
            showNotification(`Erro ao carregar detalhes das alocações: ${error.message}`, "error");
            // Mantém o texto dentro do container principal para o caso de erros de carregamento irrecuperáveis
            allocationsListContainer.innerHTML = `<p class="error-message">${error.message}</p>`; 
        });
    })
    .catch(error => {
        console.error("Erro ao carregar as alocações:", error);
        // Exibe a mensagem de erro no container principal
        allocationsListContainer.innerHTML = `<p class="error-message">${error.message}</p>`;
        // E também exibe como notificação toast
        showNotification(error.message, "error"); 
    });
}

// Funções de deleção e modal - atualizadas para usar showNotification
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
        }).then(handleErrors);

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

// showConfirmationModal (mantida, já que é para confirmações com botões Sim/Não)
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