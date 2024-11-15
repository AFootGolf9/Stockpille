function showItemByLocationReport() {
    const reportHTML = `
        <h2>Relatório de Localizações com Mais Itens</h2>
        <div id="item-by-location-report-result">
            <p>Carregando relatório...</p>
        </div>
    `;

    // Insere o HTML inicial no conteúdo principal
    document.getElementById("main-content").innerHTML = reportHTML;

    // Faz a requisição para obter as localizações com mais itens
    fetch("http://localhost:8080/rel/itembylocation")
        .then(response => response.json())
        .then(locationData => {
            console.log("Relatório de localizações com mais itens:", locationData);  // Log para verificar as localizações recebidas
            
            // Verifica se a resposta contém os dados de localizações
            if (locationData && Object.keys(locationData).length > 0) {
                // Processa os dados e monta o relatório
                const results = Object.keys(locationData).map(locationName => {
                    const totalItems = locationData[locationName] || 0;  // Conta itens ou usa 0 caso não haja itens para a localização
                    return {
                        location: locationName,
                        totalItems: totalItems
                    };
                });

                // Ordena os resultados do mais itens para o menos itens
                results.sort((a, b) => b.totalItems - a.totalItems);

                // Monta a tabela do relatório
                const tableHTML = `
                    <table class="allocations-table">
                        <thead>
                            <tr>
                                <th>Localização</th>
                                <th>Total de Itens</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results.map(result => `
                                <tr>
                                    <td>${result.location}</td>
                                    <td>${result.totalItems}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                document.getElementById("item-by-location-report-result").innerHTML = tableHTML;
            } else {
                document.getElementById("item-by-location-report-result").innerHTML = "<p>Nenhuma localização encontrada.</p>";
            }
        })
        .catch(error => {
            console.error("Erro ao carregar o relatório de localizações com mais itens:", error);
            document.getElementById("item-by-location-report-result").innerHTML = `<p>Erro ao carregar o relatório de localizações: ${error.message}</p>`;
        });
}
