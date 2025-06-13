function getToken() {
    return localStorage.getItem('authToken');
}

function showAllocationForm() {
    const formHTML = `
        <h2>Alocar Produto em Localização</h2>
        <div class="form-group">
            <label for="itemSelect">Selecione o Produto:</label>
            <select id="itemSelect" required>
                <option value="">Selecione um Produto</option>
            </select>
        </div>
        <div class="form-group">
            <label for="locationSelect">Selecione a Localização:</label>
            <select id="locationSelect" required>
                <option value="">Selecione uma Localização</option>
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
    fetch("http://localhost:8080/item", {
        method: "GET",
        headers: {
            "Authorization": getCookie("token")
        }
    })
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
    fetch("http://localhost:8080/location", {
        method: "GET",
        headers: {
            "Authorization": getCookie("token")
        }
    })
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
    console.log("Produto selecionado:", itemId);
    console.log("Locação selecionada:", locationId);
    console.log("Token:", token);

    if (!itemId || !locationId || !token) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    fetch("http://localhost:8080/allocation", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": getCookie("token")
        },
        body: JSON.stringify({
            item_id: parseInt(itemId),
            location_id: parseInt(locationId)
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Resposta do servidor:", data);
        if (data.status) {
            alert("Produto alocado com sucesso!");
        } else {
            alert("Erro ao alocar o produto.");
        }
    })
    .catch(error => {
        console.error("Erro ao alocar o produto:", error);
        alert("Erro ao alocar o produto. Tente novamente.");
    });
}
