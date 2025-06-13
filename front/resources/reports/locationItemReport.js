function showItemByLocationReport() {
    const reportHTML = `
        <h2>Relatório de Localizações com Mais Itens</h2>
        <div id="item-by-location-report-result">
            <p>Carregando relatório...</p>
        </div>
        <div id="button-container">
            <button id="generate-pdf" onclick="generateItemByLocationPDF()">Gerar PDF</button>
        </div>
    `;
    document.getElementById("main-content").innerHTML = reportHTML;

    fetch("http://localhost:8080/rel/itembylocation")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(locationData => {
            console.log("Relatório de localizações com mais itens:", locationData); 

            // Validação: locationData deve ser um objeto com pelo menos 1 chave
            if (locationData && typeof locationData === "object" && Object.keys(locationData).length > 0) {
                const results = Object.keys(locationData).map(locationName => {
                    const totalItems = locationData[locationName] || 0;  
                    return {
                        location: locationName,
                        totalItems: totalItems
                    };
                });

                results.sort((a, b) => b.totalItems - a.totalItems);

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

function generateItemByLocationPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Relatório de localizações com mais itens", 14, 20);

    const table = document.querySelector(".allocations-table");
    if (!table) {
        alert("Erro: Nenhuma tabela encontrada para gerar o PDF.");
        return;
    }

    const rows = table.querySelectorAll("tr");
    if (rows.length <= 1) {
        alert("Não há dados suficientes para gerar o PDF.");
        return;
    }

    const tableData = [];
    rows.forEach((row, index) => {
        const cells = row.querySelectorAll("td, th");
        const rowData = [];
        cells.forEach(cell => {
            rowData.push(cell.textContent);
        });
        if (index !== 0) {
            tableData.push(rowData);
        }
    });

    doc.autoTable({
        head: [["Localização", "Total de Itens"]],
        body: tableData,
        startY: 30,
        theme: 'grid',
        styles: {
            font: 'helvetica',
            fontSize: 12,
            cellPadding: 5,
            valign: 'middle',
        },
        headStyles: {
            fillColor: [22, 160, 133],
            textColor: 255,
            fontStyle: 'bold',
        },
        bodyStyles: {
            fillColor: [242, 242, 242],
            textColor: 0,
        },
        alternateRowStyles: {
            fillColor: [255, 255, 255],
        },
    });

    const pageCount = doc.internal.getNumberOfPages(); 
    doc.setFontSize(10);
    doc.setFont("helvetica");
    doc.text(`Página ${pageCount}`, 180, 285);

    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("StockPille", 10, pageHeight - 10);

    doc.save("relatorio_localizacoes.pdf");
}
