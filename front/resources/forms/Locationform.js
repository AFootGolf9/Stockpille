function showLocationList() {
    const locationListHTML = `
        <div class="location-header">
            <h2>Lista de Localizações</h2>
            <button id="createLocationBtn">Criar</button>
        </div>
        <div id="location-list" class="location-list">
            <p>Carregando locações...</p>
        </div>
    `;

    document.getElementById("main-content").innerHTML = locationListHTML;

    fetch("http://localhost:8080/location", {
        method: "GET",
        headers: {
            "Authorization": getCookie("token")
        }
    })
        .then(response => response.json())
        .then(data => {
            const locations = data.data;
            console.log("Resposta da API:", locations);
            
            const locationListContainer = document.getElementById("location-list");

            if (Array.isArray(locations) && locations.length > 0) {
                const tableHTML = `
                    <table class="location-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nome</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${locations.map(location => `
                                <tr>
                                    <td>${location.id}</td>
                                    <td>${location.name}</td>
                                    <td>
                                        <button class="editBtn" data-id="${location.id}">Editar</button>
                                        <button class="deleteBtn" data-id="${location.id}">Excluir</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                locationListContainer.innerHTML = tableHTML;

                document.querySelectorAll(".editBtn").forEach(button => {
                    button.addEventListener("click", (event) => {
                        const locationId = event.target.getAttribute("data-id");
                        showLocationForm(locationId);
                    });
                });

                document.querySelectorAll(".deleteBtn").forEach(button => {
                    button.addEventListener("click", (event) => {
                        const locationId = event.target.getAttribute("data-id");
                        deleteLocation(locationId);
                    });
                });
            } else {
                locationListContainer.innerHTML = "<p>Nenhuma locação cadastrada.</p>";
            }
        })
        .catch(error => {
            console.error("Erro ao carregar localizações:", error);
            document.getElementById("location-list").innerHTML = "<p>Erro ao carregar locações.</p>";
        });

    document.getElementById("createLocationBtn").addEventListener("click", () => showLocationForm());
}

function showLocationForm(locationId = null) {
    const formHTML = `
        <h2>${locationId ? 'Editar Localização' : 'Cadastro de Localização'}</h2>
        <div class="form-group">
            <label for="locationName">Nome da Localização:</label>
            <input type="text" id="locationName" name="locationName" required>
        </div>
        <div class="form-group">
            <button id="registerLocationBtn">${locationId ? 'Atualizar Localização' : 'Cadastrar Localização'}</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = formHTML;

    if (locationId) {
        fetch(`http://localhost:8080/location/${locationId}`, {
            method: "GET",
            headers: {
                "Authorization": getCookie("token")
            }
        })
            .then(response => response.json())
            .then(data => {
                const location = data.data;
                if (location) {
                    document.getElementById("locationName").value = location.name;
                } else {
                    alert("Erro ao carregar dados da localização.");
                }
            })
            .catch(error => {
                console.error("Erro ao carregar dados da localização:", error);
                alert("Erro ao carregar dados da localização.");
            });
    }

    document.getElementById("registerLocationBtn").addEventListener("click", function() {
        const locationName = document.getElementById("locationName").value;

        if (!locationName) {
            alert("Por favor, informe o nome da localização.");
            return;
        }

        const locationData = { name: locationName };

        const url = locationId
            ? `http://localhost:8080/location/${locationId}`
            : "http://localhost:8080/location";

        const method = locationId ? "PUT" : "POST";

        fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": getCookie("token")
            },
            body: JSON.stringify(locationData)
        })
        .then(response => {
            if (response.ok) {
                alert(locationId ? "Localização atualizada com sucesso!" : "Localização cadastrada com sucesso!");
                showLocationList();
            } else {
                throw new Error(locationId ? "Erro ao atualizar a localização." : "Erro ao cadastrar a localização.");
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro ao processar a localização. Tente novamente.");
        });
    });
}

function deleteLocation(locationId) {
    const confirmDelete = confirm("Tem certeza que deseja excluir esta localização?");
    if (confirmDelete) {
        fetch(`http://localhost:8080/location/${locationId}`, {
            method: "DELETE",
            headers: {
                "Authorization": getCookie("token")
            }
        })
        .then(response => {
            if (response.ok) {
                alert("Localização excluída com sucesso!");
                showLocationList();
            } else {
                throw new Error("Erro ao excluir a localização.");
            }
        })
        .catch(error => {
            console.error("Erro:", error);
            alert("Erro ao excluir a localização. Tente novamente.");
        });
    }
}
