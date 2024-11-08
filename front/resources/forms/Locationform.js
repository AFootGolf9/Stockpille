function showLocationList() {
    // Estrutura da tela com título e botão "Criar"
    const locationListHTML = `
        <div class="location-header">
            <h2>Lista de Locações</h2>
            <button id="createLocationBtn">Criar</button>
        </div>
        <div id="location-list" class="location-list">
            <p>Carregando locações...</p>
        </div>
    `;

    // Insere o HTML na área principal
    document.getElementById("main-content").innerHTML = locationListHTML;

    // Carrega as locações da API
    fetch("http://localhost:8080/location")
        .then(response => response.json())
        .then(data => {
            const locations = data.data; // Acessando os dados dentro de 'data'
            console.log("Resposta da API:", locations);
            
            const locationListContainer = document.getElementById("location-list");

            if (Array.isArray(locations) && locations.length > 0) {
                // Criando a estrutura da tabela
                const tableHTML = `
                    <table class="location-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${locations.map(location => `
                                <tr>
                                    <td>${location.id}</td>
                                    <td>${location.name}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                locationListContainer.innerHTML = tableHTML;
            } else {
                locationListContainer.innerHTML = "<p>Nenhuma locação cadastrada.</p>";
            }
        })
        .catch(error => {
            console.error("Erro ao carregar locações:", error);
            document.getElementById("location-list").innerHTML = "<p>Erro ao carregar locações.</p>";
        });

    // Adiciona evento de clique para o botão "Criar"
    document.getElementById("createLocationBtn").addEventListener("click", showLocationForm);
}

function showLocationForm() {
    const formHTML = `
        <h2>Cadastro de Localização</h2>
        <div class="form-group">
            <label for="locationName">Nome da Localização:</label>
            <input type="text" id="locationName" name="locationName" required>
        </div>
        <div class="form-group">
            <button id="registerLocationBtn">Cadastrar Localização</button>
        </div>
    `;

    // Injeta o HTML no conteúdo principal
    document.getElementById("main-content").innerHTML = formHTML;

    // Adiciona o evento de clique para enviar o formulário
    document.getElementById("registerLocationBtn").addEventListener("click", function() {
        const locationName = document.getElementById("locationName").value;
        const locationData = {
            name: locationName
        };

        fetch("http://localhost:8080/location", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(locationData)
        })
        .then(response => {
            if (response.ok) {
                alert("Localização cadastrada com sucesso!");
                showLocationList();  // Atualiza a lista após o cadastro
            } else {
                throw new Error("Erro ao cadastrar a localização.");
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro ao cadastrar a localização. Tente novamente.");
        });
    });
}
