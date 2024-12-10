function showAllocationReport() {
    const reportHTML = `
        <h2>Relatório de Locações por Usuários</h2>
        <div id="allocations-report-result">
            <p>Carregando relatório...</p>
        </div>
        <!-- Botão de Gerar PDF -->
        <div id="button-container">
            <button id="generate-pdf" onclick="generatePDF()">Gerar PDF</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = reportHTML;

    fetch("http://localhost:8080/rel/allocbyuser")
        .then(response => response.json())
        .then(allocationData => {
            console.log("Relatório de locações por usuário:", allocationData); // Log para verificar os dados recebidos

            if (allocationData && Object.keys(allocationData).length > 0) {
                const results = Object.entries(allocationData).map(([userName, totalAllocations]) => ({
                    user: userName,
                    totalAllocations: totalAllocations
                }));

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
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Relatório de locações por usuários", 14, 20);

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

        // Configuração da tabela no PDF
        doc.autoTable({
            head: [["Usuário", "Total de Locações"]],
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
        const text = "StockPille";
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(text, 10, pageHeight - 10); 
    }

    // Salva o PDF gerado
    doc.save("relatorio_locacoes.pdf");
}
