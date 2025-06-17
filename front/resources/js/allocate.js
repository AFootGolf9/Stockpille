
async function showAllocationForm() {
    const formHTML = `
        <h2>Alocar Produto em Localização</h2>
        <div class="form-group">
            <label for="itemSelect">Selecione o Produto:</label>
            <select id="itemSelect" required disabled>
                <option value="">Carregando produtos...</option>
            </select>
        </div>
        <div class="form-group">
            <label for="locationSelect">Selecione a Localização:</label>
            <select id="locationSelect" required disabled>
                <option value="">Carregando localizações...</option>
            </select>
        </div>
        <div class="form-group">
            <button id="allocateBtn" class="btn-primary" disabled>Alocar Produto</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = formHTML;

    const itemSelect = document.getElementById("itemSelect");
    const locationSelect = document.getElementById("locationSelect");
    const allocateBtn = document.getElementById("allocateBtn");

    try {
        // Carrega itens e localizações em paralelo
        const [itemsData, locationsData] = await Promise.all([
            fetch("http://localhost:8080/item", { headers: { "Authorization": getCookie("token") } }).then(handleResponse),
            fetch("http://localhost:8080/location", { headers: { "Authorization": getCookie("token") } }).then(handleResponse)
        ]);
        
        // Popula o seletor de produtos
        const items = itemsData?.data || [];
        itemSelect.innerHTML = '<option value="">Selecione um Produto</option>';
        if (items.length > 0) {
            items.forEach(item => {
                itemSelect.add(new Option(`${item.sku} - ${item.name}`, item.sku));
            });
        } else {
            itemSelect.add(new Option("Nenhum produto disponível", ""));
        }

        // Popula o seletor de localizações
        const locations = locationsData?.data || [];
        locationSelect.innerHTML = '<option value="">Selecione uma Localização</option>';
        if (locations.length > 0) {
            locations.forEach(location => {
                locationSelect.add(new Option(location.name, location.id));
            });
        } else {
            locationSelect.add(new Option("Nenhuma localização disponível", ""));
        }
        
        // Habilita os seletores e o botão
        itemSelect.disabled = false;
        locationSelect.disabled = false;
        allocateBtn.disabled = false;

    } catch (error) {
        // Exibe notificação de erro e mantém o formulário desabilitado
        console.error("Erro ao carregar dados para alocação:", error);
        showNotification(`Erro ao carregar dados do formulário: ${error.message}`, "error");
        itemSelect.innerHTML = '<option value="">Falha ao carregar</option>';
        locationSelect.innerHTML = '<option value="">Falha ao carregar</option>';
    }


    allocateBtn.addEventListener("click", function(event) {
        event.preventDefault();

        const itemId = itemSelect.value;
        const locationId = locationSelect.value;

        if (!itemId || !locationId) {
            showNotification("Por favor, selecione um produto e uma localização.", "error");
            return;
        }

        fetch("http://localhost:8080/allocation", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // MANTIDO O HEADER ORIGINAL:
                "Authorization": getCookie("token") 
            },
            body: JSON.stringify({
                item_id: parseInt(itemId),
                location_id: parseInt(locationId)
            })
        })
        .then(handleResponse)
        .then(data => {
            console.log("Resposta do servidor:", data);
            showNotification("Produto alocado com sucesso!", "success");
            itemSelect.selectedIndex = 0;
            locationSelect.selectedIndex = 0;
        })
        .catch(error => {
            console.error("Erro ao alocar o produto:", error);
            showNotification(error.message, "error");
        });
    });
}