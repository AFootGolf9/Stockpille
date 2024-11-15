function showItemAllocationReport() {
    const reportHTML = `
        <h2>Relatório de Itens Mais Locados</h2>
        <div id="item-allocation-report-result">
            <p>Carregando relatório...</p>
        </div>
    `;

    // Insere o HTML inicial no conteúdo principal
    document.getElementById("main-content").innerHTML = reportHTML;

    // Faz a requisição para obter todos os itens mais locados
    fetch("http://localhost:8080/rel/allocbyitem")
        .then(response => response.json())
        .then(itemData => {
            console.log("Relatório de itens mais locados:", itemData);  // Log para verificar os itens recebidos
            
            // Verifica se a resposta contém os itens
            if (itemData && Object.keys(itemData).length > 0) {
                // Processa os dados e monta o relatório
                const results = Object.keys(itemData).map(itemName => {
                    const totalAllocations = itemData[itemName] || 0;  // Conta locações ou usa 0 caso não haja locações para o item
                    return {
                        item: itemName,
                        totalAllocations: totalAllocations
                    };
                });

                // Ordena os resultados do mais locado para o menos locado
                results.sort((a, b) => b.totalAllocations - a.totalAllocations);

                // Monta a tabela do relatório reutilizando o CSS de 'userAllocationsReport'
                const tableHTML = `
                    <table class="allocations-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Total de Locações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results.map(result => `
                                <tr>
                                    <td>${result.item}</td>
                                    <td>${result.totalAllocations}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
                document.getElementById("item-allocation-report-result").innerHTML = tableHTML;
            } else {
                document.getElementById("item-allocation-report-result").innerHTML = "<p>Nenhum item encontrado.</p>";
            }
        })
        .catch(error => {
            console.error("Erro ao carregar o relatório de itens mais locados:", error);
            document.getElementById("item-allocation-report-result").innerHTML = `<p>Erro ao carregar o relatório de itens: ${error.message}</p>`;
        });
}
