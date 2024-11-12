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

function showAllocationForm() {
    const formHTML = `
        <h2>Alocar Produto em Localização</h2>
        <div class="form-group">
            <label for="itemSelect">Selecione o Produto:</label>
            <select id="itemSelect" required>
                <option value="">Selecione um Produto</option> <!-- opção inicial vazia -->
            </select>
        </div>
        <div class="form-group">
            <label for="locationSelect">Selecione a Localização:</label>
            <select id="locationSelect" required>
                <option value="">Selecione uma Localização</option> <!-- opção inicial vazia -->
            </select>
        </div>
        <div class="form-group">
            <button id="allocateBtn">Alocar Produto</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = formHTML;

    loadItems();
    loadLocations();

    document.getElementById("allocateBtn").addEventListener("click", function(event) {
        event.preventDefault(); 
        allocateProduct();
    });
}

function loadItems() {
    fetch("http://localhost:8080/item")
        .then(response => response.json())
        .then(data => {
            const items = data.data;
            const itemSelect = document.getElementById("itemSelect");
            if (Array.isArray(items) && items.length > 0) {
                items.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.sku;
                    option.textContent = `${item.sku} - ${item.name}`;
                    itemSelect.appendChild(option);
                });
            } else {
                const noItemsOption = document.createElement("option");
                noItemsOption.textContent = "Nenhum produto disponível";
                itemSelect.appendChild(noItemsOption);
            }
        })
        .catch(error => console.error("Erro ao carregar produtos:", error));
}

function loadLocations() {
    fetch("http://localhost:8080/location")
        .then(response => response.json())
        .then(data => {
            const locations = data.data;
            const locationSelect = document.getElementById("locationSelect");
            if (Array.isArray(locations) && locations.length > 0) {
                locations.forEach(location => {
                    const option = document.createElement("option");
                    option.value = location.id;
                    option.textContent = location.name;
                    locationSelect.appendChild(option);
                });
            } else {
                const noLocationsOption = document.createElement("option");
                noLocationsOption.textContent = "Nenhuma Localização disponível";
                locationSelect.appendChild(noLocationsOption);
            }
        })
        .catch(error => console.error("Erro ao carregar localizações:", error));
}

function allocateProduct() {
    const itemId = document.getElementById("itemSelect").value;
    const locationId = document.getElementById("locationSelect").value;
    const token = getCookie("token");
    9
    console.log("Produto selecionado:", itemId);
    console.log("Locação selecionada:", locationId);
    console.log("Token:", token);

    if (!itemId || !locationId || !token) {
        alert("Por favor, preencha todos os campos.");
        return;
    }
    

    // Verificando se os campos estão preenchidos corretamente
    if (!itemId || !locationId || !token) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    console.log(JSON.stringify({
        item_id: parseInt(itemId),
        location_id: parseInt(locationId),
        token: token
    }))
    

    // Enviar dados para o backend
    fetch("http://localhost:8080/allocation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            item_id: parseInt(itemId),
            location_id: parseInt(locationId),
            token: token
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Resposta do servidor:", data);
        if (data.status) {
            alert("Produto alocado com sucesso!");
        } else {
            alert("Deu ruim e");
        }
    })
    .catch(error => {
        console.error("Erro ao alocar o produto:", error);
        alert("Erro ao alocar o produto. Tente novamente.");
    });
}

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

    // Fazer a requisição para pegar as locações
    fetch("http://localhost:8080/allocation")
    .then(response => response.json())
    .then(data => {
        console.log("Resposta do servidor:", data);

        // Verifica se os dados são válidos
        if (data && Array.isArray(data.data) && data.data.length > 0) {
            const allocations = data.data;
            const allocationsListContainer = document.getElementById("allocations-list");

            const tableHTML = `
                <table class="allocations-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Produto</th>
                            <th>Locação</th>
                            <th>Usuário</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allocations.map(allocation => `
                            <tr>
                                <td>${allocation.id}</td>
                                <td>${allocation.item_id}</td>
                                <td>${allocation.location_id}</td>
                                <td>${allocation.user_id}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            allocationsListContainer.innerHTML = tableHTML;

        } else {
            // Caso não tenha locações
            document.getElementById("allocations-list").innerHTML = "<p>Nenhuma locação encontrada.</p>";
        }
    })
    .catch(error => {
        console.error("Erro ao carregar as locações:", error);
        document.getElementById("allocations-list").innerHTML = `<p>Erro ao carregar as locações: ${error.message}</p>`;
    });
}
