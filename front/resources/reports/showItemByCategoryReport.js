function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function showItemByCategoryReport() {
    // ALTERAÇÃO APLICADA AQUI: Adicionado o botão "Voltar".
    const reportHTML = `
        <div class="section-header">
            <h2>Relatório de Itens por Categoria</h2>
            <div>
                <button class="btn-secondary" onclick="showReportMenu()">Voltar</button>
                <button id="generate-pdf-category" onclick="generateItemByCategoryPDF()">Gerar PDF</button>
            </div>
        </div>
        <div id="item-by-category-report-result">
            <p>Carregando relatório...</p>
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
                return { category: categoryName, totalItems: data[categoryName] || 0 };
            });

            results.sort((a, b) => b.totalItems - a.totalItems);

            const tableHTML = `
                <div class="list-container">
                    <table class="generic-list-table">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Total de Itens</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results.map(r => `
                                <tr>
                                    <td data-label="Categoria">${r.category}</td>
                                    <td data-label="Total de Itens">${r.totalItems}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
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
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("StockPille", 14, pageHeight - 10);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 35, pageHeight - 10);
    }

    doc.save("relatorio_itens_por_categoria.pdf");
}