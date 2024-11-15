function showAllocationReport() {
    const reportHTML = `
        <h2>Relatório de Locações por Usuários</h2>
        <div id="allocations-report-result">
            <p>Carregando relatório...</p>
        </div>
    `;

    // Insere o HTML inicial no conteúdo principal
    document.getElementById("main-content").innerHTML = reportHTML;

    // Faz a requisição para obter todos os usuários
    fetch("http://localhost:8080/user")
        .then(response => response.json())
        .then(usersData => {
            console.log("Usuários obtidos:", usersData);  // Log para verificar os usuários recebidos
            // Verifica se a resposta contém usuários
            if (usersData && Array.isArray(usersData.data) && usersData.data.length > 0) {
                const users = usersData.data;  // Lista de usuários

                // Faz uma requisição para obter a quantidade de locações por usuário
                fetch("http://localhost:8080/rel/allocbyuser")
                    .then(res => res.json())
                    .then(allocationData => {
                        console.log("Relatório de locações por usuário:", allocationData); // Log da resposta de locações

                        // Verifica se a resposta de locações contém dados
                        if (allocationData && Object.keys(allocationData).length > 0) {
                            // Processa os dados e monta o relatório
                            const results = users.map(user => {
                                const userName = user.name;
                                const totalAllocations = allocationData[userName] || 0;  // Conta locações ou usa 0 caso não haja locações para o usuário
                                return {
                                    user: userName,
                                    totalAllocations: totalAllocations
                                };
                            });

                            // Monta a tabela do relatório
                            const tableHTML = `
                                <table class="allocations-table">
                                    <thead>
                                        <tr>
                                            <th>Usuário</th>
                                            <th>Total de Locações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${results.map(result => `
                                            <tr>
                                                <td>${result.user}</td>
                                                <td>${result.totalAllocations}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            `;
                            document.getElementById("allocations-report-result").innerHTML = tableHTML;
                        } else {
                            document.getElementById("allocations-report-result").innerHTML = "<p>Nenhuma locação encontrada.</p>";
                        }
                    })
                    .catch(error => {
                        console.error("Erro ao carregar o relatório de locações:", error);
                        document.getElementById("allocations-report-result").innerHTML = `<p>Erro ao carregar o relatório de locações: ${error.message}</p>`;
                    });

            } else {
                document.getElementById("allocations-report-result").innerHTML = "<p>Nenhum usuário encontrado.</p>";
            }
        })
        .catch(error => {
            console.error("Erro ao carregar os usuários:", error);
            document.getElementById("allocations-report-result").innerHTML = `<p>Erro ao carregar os usuários: ${error.message}</p>`;
        });
}
