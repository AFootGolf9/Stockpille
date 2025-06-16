function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function showItemByCategoryReport() {
    const reportHTML = `
        <h2>Relatório de Itens por Categoria</h2>
        <div id="item-by-category-report-result">
            <p>Carregando relatório...</p>
        </div>
        <div id="button-container" style="margin-top: 15px;">
            <button id="generate-pdf-category" onclick="generateItemByCategoryPDF()">Gerar PDF</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = reportHTML;

    const token = getCookie("token");
    if (!token) {
        document.getElementById("item-by-category-report-result").innerHTML = "<p>Token de autenticação não encontrado. Faça login novamente.</p>";
        return;
    }

    fetch("http://localhost:8080/rel/itembycategory", {
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
    .then(data => {
        console.log("Relatório de itens por categoria:", data);

        if (data && Object.keys(data).length > 0) {
            const results = Object.keys(data).map(categoryName => {
                const count = data[categoryName] || 0;
                return { category: categoryName, totalItems: count };
            });

            results.sort((a, b) => b.totalItems - a.totalItems);

            const tableHTML = `
                <table class="allocations-table">
                    <thead>
                        <tr>
                            <th>Categoria</th>
                            <th>Total de Itens</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${results.map(r => `
                            <tr>
                                <td>${r.category}</td>
                                <td>${r.totalItems}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            document.getElementById("item-by-category-report-result").innerHTML = tableHTML;
        } else {
            document.getElementById("item-by-category-report-result").innerHTML = "<p>Nenhuma categoria encontrada.</p>";
        }
    })
    .catch(error => {
        console.error("Erro ao carregar o relatório de itens por categoria:", error);
        document.getElementById("item-by-category-report-result").innerHTML = `<p>Erro ao carregar relatório: ${error.message}</p>`;
    });
}

function generateItemByCategoryPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Relatório de Itens por Categoria", 14, 20);

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
            head: [["Categoria", "Total de Itens"]],
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
    }

    doc.save("relatorio_itens_por_categoria.pdf");
}