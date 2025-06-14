function showItemAllocationReport() {
    const reportHTML = `
        <h2>Relatório de Itens Mais Locados</h2>
        <div id="item-allocation-report-result">
            <p>Carregando relatório...</p>
        </div>
        <div id="button-container">
            <button id="generate-pdf" onclick="generateItemAllocationPDF()">Gerar PDF</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = reportHTML;

    fetch("http://localhost:8080/rel/allocbyitem")
        .then(response => response.json())
        .then(itemData => {
            console.log("Relatório de itens mais locados:", itemData); 
            
            if (itemData && Object.keys(itemData).length > 0) {
                const results = Object.entries(itemData).map(([itemName, total]) => ({
                    item: itemName,
                    totalAllocations: total || 0
                }));

                results.sort((a, b) => b.totalAllocations - a.totalAllocations);

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
            document.getElementById("item-allocation-report-result").innerHTML = `<p>Erro ao carregar o relatório: ${error.message}</p>`;
        });
}


function generateItemAllocationPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Relatório de itens mais locados", 14, 20);

    const table = document.querySelector(".allocations-table");
    if (table) {
        const rows = table.querySelectorAll("tr");
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
            head: [["Item", "Total de Locações"]],
            body: tableData,
            startY: 30,  // Posição onde a tabela começa
            theme: 'grid',  // Tema para bordas visíveis
            styles: {
                font: 'helvetica',  // Fonte
                fontSize: 12,       // Tamanho da fonte
                cellPadding: 5,     // Espaçamento das células
                valign: 'middle',   // Alinhamento vertical
            },
            headStyles: {
                fillColor: [22, 160, 133],  // Cor do cabeçalho
                textColor: 255,              // Cor do texto no cabeçalho
                fontStyle: 'bold',           // Estilo da fonte do cabeçalho
            },
            bodyStyles: {
                fillColor: [242, 242, 242],  // Cor de fundo das células
                textColor: 0,                // Cor do texto
            },
            alternateRowStyles: {
                fillColor: [255, 255, 255],  // Cor alternada das linhas
            },
        });

        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setFont("helvetica");
        doc.text(`Página ${pageCount}`, 180, 285);

        const pageHeight = doc.internal.pageSize.getHeight();
        const text = "StockPille";
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(text, 10, pageHeight - 10); 
    }

    doc.save("relatorio_itens_locados.pdf");
}