// A função getCookie continua a mesma
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}


// REATORADO: Convertido para async/await para simplificar o código.
async function showItemByLocationReport() {
    const reportHTML = `
        <div class="section-header">
            <h2>Relatório de Itens por Localização</h2>
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

    const reportResultContainer = document.getElementById("item-by-location-report-result");

    try {
        // NOVO: Usa handleResponse para tratar erros e simplifica a chamada.
        const locationData = await fetch("http://localhost:8080/rel/itembylocation", {
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse);

        if (locationData && typeof locationData === "object" && Object.keys(locationData).length > 0) {
            const results = Object.keys(locationData).map(locationName => ({
                location: locationName,
                totalItems: locationData[locationName] || 0
            }));

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
            reportResultContainer.innerHTML = tableHTML;
        } else {
            reportResultContainer.innerHTML = "<p>Nenhum dado de itens por localização encontrado.</p>";
        }
    } catch (error) {
        // ALTERADO: Captura qualquer erro e exibe uma mensagem clara na interface.
        console.error("Erro ao carregar o relatório de itens por localização:", error);
        reportResultContainer.innerHTML = `<p class="error-message">Erro ao carregar o relatório: ${error.message}</p>`;
    }
}

// ALTERADO: A função generateItemByLocationPDF agora usa notificação em vez de alert.
function generateItemByLocationPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Relatório de itens por localização", 14, 20);

    const table = document.querySelector(".generic-list-table");
    if (!table) {
        // Usa notificação para o erro.
        showNotification("Nenhuma tabela encontrada para gerar o PDF.", "error");
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

    doc.save("relatorio_itens_por_localizacao.pdf");
}