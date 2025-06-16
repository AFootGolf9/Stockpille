function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function showItemByLocationReport() {
    // ALTERAÇÃO APLICADA AQUI: Adicionado o botão "Voltar".
    const reportHTML = `
        <div class="section-header">
            <h2>Relatório de Localizações com Mais Itens</h2>
            <div>
                <button class="btn-secondary" onclick="showReportMenu()">Voltar</button>
                <button id="generate-pdf" onclick="generateItemByLocationPDF()">Gerar PDF</button>
            </div>
        </div>
        <div id="item-by-location-report-result">
            <p>Carregando relatório...</p>
        </div>
    `;
    document.getElementById("main-content").innerHTML = reportHTML;

    const token = getCookie("token");
    if (!token) {
        document.getElementById("item-by-location-report-result").innerHTML = "<p>Token de autenticação não encontrado. Faça login novamente.</p>";
        return;
    }

    fetch("http://localhost:8080/rel/itembylocation", {
        headers: {
            "Authorization": token
        }
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Não autorizado: Verifique seu login.');
            }
            throw new Error('Erro na requisição: ' + response.statusText);
        }
        return response.json();
    })
    .then(locationData => {
        console.log("Relatório de localizações com mais itens:", locationData);

        if (locationData && typeof locationData === "object" && Object.keys(locationData).length > 0) {
            const results = Object.keys(locationData).map(locationName => {
                return {
                    location: locationName,
                    totalItems: locationData[locationName] || 0
                };
            });

            results.sort((a, b) => b.totalItems - a.totalItems);

            const tableHTML = `
                <div class="list-container">
                    <table class="generic-list-table">
                        <thead>
                            <tr>
                                <th>Localização</th>
                                <th>Total de Itens</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results.map(result => `
                                <tr>
                                    <td data-label="Localização">${result.location}</td>
                                    <td data-label="Total de Itens">${result.totalItems}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
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

function generateItemByLocationPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Relatório de localizações com mais itens", 14, 20);

    const table = document.querySelector(".generic-list-table");
    if (!table) {
        alert("Erro: Nenhuma tabela encontrada para gerar o PDF.");
        return;
    }

    doc.autoTable({
        html: table,
        startY: 30,
        theme: 'grid',
        headStyles: {
            fillColor: [20, 54, 88],
            textColor: 255,
            fontStyle: 'bold',
        }
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("StockPille", 14, pageHeight - 10);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 35, pageHeight - 10);
    }

    doc.save("relatorio_localizacoes_itens.pdf");
}