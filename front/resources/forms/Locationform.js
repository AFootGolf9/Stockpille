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

    document.getElementById("main-content").innerHTML = formHTML;

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
                document.getElementById("locationName").value = '';
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
