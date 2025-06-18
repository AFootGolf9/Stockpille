function showLocationList() {
    const locationListHTML = `
        <div class="section-header">
            <h2>Lista de Localizações</h2>
            <button id="createLocationBtn">Criar</button>
        </div>
        <div id="location-list-container">
            <p>Carregando locações...</p>
        </div>
    `;

    document.getElementById("main-content").innerHTML = locationListHTML;
    const locationListContainer = document.getElementById("location-list-container");

    Promise.all([
        fetch("http://localhost:8080/location", {
            method: "GET",
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse),
        fetch("http://localhost:8080/allocation", {
            method: "GET",
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse)
    ])
    .then(([locationsData, allocationsData]) => {
        const locations = locationsData?.data || [];
        const allAllocations = allocationsData?.data || [];

        const locationCounts = new Map();
        allAllocations.forEach(alloc => {
            const count = locationCounts.get(alloc.location_id) || 0;
            locationCounts.set(alloc.location_id, count + 1);
        });

        if (locations.length > 0) {
            const tableHTML = `
                <div class="list-container">
                    <table class="generic-list-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Quantidade de Itens</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${locations.map(location => {
                                const itemCount = locationCounts.get(location.id) || 0;
                                return `
                                <tr>
                                    <td data-label="ID">${location.id}</td>
                                    <td data-label="Nome">${location.name}</td>
                                    <td data-label="Quantidade de Itens">${itemCount}</td>
                                    <td data-label="Ações">
                                        <button class="editBtn" data-id="${location.id}">Editar</button>
                                        <button class="deleteBtn" data-id="${location.id}">Excluir</button>
                                    </td>
                                </tr>
                            `}).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            locationListContainer.innerHTML = tableHTML;

            locationListContainer.addEventListener('click', (event) => {
                const target = event.target;
                const locationId = target.getAttribute("data-id");

                if (target.classList.contains('editBtn')) {
                    showLocationForm(locationId);
                } else if (target.classList.contains('deleteBtn')) {
                    deleteLocation(locationId);
                }
            });
            
        } else {
            locationListContainer.innerHTML = "<p>Nenhuma locação cadastrada.</p>";
        }
    })
    .catch(error => {
        console.error("Erro ao carregar dados:", error);
        locationListContainer.innerHTML = `<p class="error-message">Não foi possível carregar os dados: ${error.message}</p>`;
    });

    document.getElementById("createLocationBtn").addEventListener("click", () => showLocationForm());
}

function showLocationForm(locationId = null) {
    const isEdit = Boolean(locationId);
    const formHTML = `
        <h2>${isEdit ? 'Editar Localização' : 'Cadastro de Localização'}</h2>
        <div class="form-group">
            <label for="locationName">Nome da Localização:</label>
            <input type="text" id="locationName" name="locationName" required>
        </div>
        <div class="form-actions">
            <button type="button" id="backBtn">Voltar</button>
            <button id="registerLocationBtn">${isEdit ? 'Atualizar' : 'Cadastrar'}</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = formHTML;
    document.getElementById("backBtn").addEventListener("click", showLocationList);
    const locationNameInput = document.getElementById("locationName");

    if (isEdit) {
        fetch(`http://localhost:8080/location/${locationId}`, {
            method: "GET",
            headers: { "Authorization": getCookie("token") }
        })
        .then(handleResponse)
        .then(data => {
            if (data?.data) {
                locationNameInput.value = data.data.name;
            }
        })
        .catch(error => {
            showNotification(`Erro ao carregar dados: ${error.message}`);
            showLocationList();
        });
    }

    document.getElementById("registerLocationBtn").addEventListener("click", function() {
        const locationName = locationNameInput.value.trim();

        if (!locationName) {
            showNotification("Por favor, informe o nome da localização.", "error");
            return;
        }

        const locationData = { name: locationName };
        const url = isEdit ? `http://localhost:8080/location/${locationId}` : "http://localhost:8080/location";
        const method = isEdit ? "PUT" : "POST";

        fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": getCookie("token")
            },
            body: JSON.stringify(locationData)
        })
        .then(handleResponse)
        .then(() => {
            const successMessage = isEdit ? "Localização atualizada com sucesso!" : "Localização cadastrada com sucesso!";
            showNotification(successMessage, 'success');
            showLocationList();
        })
        .catch(error => {
            showNotification(error.message, 'error');
        });
    });
}

async function deleteLocation(locationId) {
    try {
        await showConfirmationModal("Tem certeza que deseja excluir esta localização? As alocações associadas não serão removidas.", "Excluir Localização");

        await fetch(`http://localhost:8080/location/${locationId}`, {
            method: "DELETE",
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse);

        showNotification("Localização excluída com sucesso!", 'success');
        showLocationList();

    } catch (error) {
        if (error) {
             showNotification(error.message, 'error');
        } else {
             console.log("Exclusão cancelada pelo usuário.");
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
                document.body.removeChild(overlay);
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