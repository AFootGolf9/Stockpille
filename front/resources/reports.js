function showUserReportForm() {
    const reportHTML = `
        <h2>Relatório de Locações por Usuário</h2>
        <div class="form-group">
            <label for="userSelect">Selecione o Usuário:</label>
            <select id="userSelect">
                <option value="">Carregando usuários...</option>
            </select>
        </div>
        <button id="generateUserReportBtn">Gerar Relatório</button>
        <div id="userReportResult"></div>
    `;

    document.getElementById("main-content").innerHTML = reportHTML;

    // Chama a API para carregar os usuários
    fetch("http://localhost:8080/user")  // Supondo que "/users" seja o endpoint para obter todos os usuários
        .then(response => response.json())
        .then(data => {
            const userSelect = document.getElementById("userSelect");
            userSelect.innerHTML = "";  // Limpa as opções anteriores
            if (data && Array.isArray(data.data)) {
                data.data.forEach(user => {
                    const option = document.createElement("option");
                    option.value = user.id;
                    option.textContent = user.name;
                    userSelect.appendChild(option);
                });
            } else {
                userSelect.innerHTML = "<option value=''>Nenhum usuário encontrado</option>";
            }
        })
        .catch(error => {
            console.error("Erro ao carregar usuários:", error);
            document.getElementById("userSelect").innerHTML = "<option value=''>Erro ao carregar usuários</option>";
        });

    document.getElementById("generateUserReportBtn").addEventListener("click", function() {
        const userId = document.getElementById("userSelect").value;
        if (userId) {
            generateUserReport(userId);
        } else {
            alert("Por favor, selecione um usuário para gerar o relatório.");
        }
    });
}


function generateUserReport() {
    const userId = document.getElementById("user-select").value;
    if (!userId) return;

    fetch(`http://localhost:8080/rel/allocbyuser?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            const reportResult = document.getElementById("report-result");
            if (data.allocations && data.allocations.length > 0) {
                const tableHTML = `
                    <table class="report-table">
                        <thead>
                            <tr>
                                <th>ID da Locação</th>
                                <th>Produto</th>
                                <th>Locação</th>
                                <th>Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.allocations.map(allocation => `
                                <tr>
                                    <td>${allocation.id}</td>
                                    <td>${allocation.product_name}</td>
                                    <td>${allocation.location_name}</td>
                                    <td>${allocation.date}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                reportResult.innerHTML = tableHTML;
            } else {
                reportResult.innerHTML = "<p>Nenhuma locação encontrada para este usuário.</p>";
            }
        })
        .catch(error => {
            console.error("Erro ao gerar o relatório:", error);
            document.getElementById("report-result").innerHTML = `<p>Erro ao gerar o relatório: ${error.message}</p>`;
        });
}
