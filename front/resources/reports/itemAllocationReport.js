function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

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

    const token = getCookie("token");
    if (!token) {
        document.getElementById("item-allocation-report-result").innerHTML = "<p>Token de autenticação não encontrado. Faça login novamente.</p>";
        return;
    }

    fetch("http://localhost:8080/rel/allocbyitem", {
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

    doc.save("relatorio_itens_locados.pdf");
}

function showAllocationReport() {
    const reportHTML = `
        <h2>Relatório de Locações por Usuários</h2>
        <div id="allocations-report-result">
            <p>Carregando relatório...</p>
        </div>
        <div id="button-container">
            <button id="generate-pdf" onclick="generatePDF()">Gerar PDF</button>
        </div>
    `;
    document.getElementById("main-content").innerHTML = reportHTML;

    const token = getCookie("token");
    if (!token) {
        document.getElementById("allocations-report-result").innerHTML = "<p>Token de autenticação não encontrado. Faça login novamente.</p>";
        return;
    }

    fetch("http://localhost:8080/user", {
        headers: { "Authorization": token }
    })
    .then(response => response.json())
    .then(usersData => {
        if (!usersData || !Array.isArray(usersData.data) || usersData.data.length === 0) {
            document.getElementById("allocations-report-result").innerHTML = "<p>Nenhum usuário encontrado.</p>";
            return;
        }

        const users = usersData.data;

        fetch("http://localhost:8080/rel/allocbyuser", {
            headers: { "Authorization": token }
        })
        .then(res => res.json())
        .then(allocationData => {
            if (!allocationData || Object.keys(allocationData).length === 0) {
                document.getElementById("allocations-report-result").innerHTML = "<p>Nenhuma locação encontrada.</p>";
                return;
            }

            const results = users.map(user => ({
                user: user.name,
                totalAllocations: allocationData[user.name] || 0
            }));

            results.sort((a, b) => b.totalAllocations - a.totalAllocations);

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
        })
        .catch(error => {
            console.error("Erro ao carregar o relatório de locações:", error);
            document.getElementById("allocations-report-result").innerHTML = `<p>Erro ao carregar o relatório de locações: ${error.message}</p>`;
        });

    })
    .catch(error => {
        console.error("Erro ao carregar os usuários:", error);
        document.getElementById("allocations-report-result").innerHTML = `<p>Erro ao carregar os usuários: ${error.message}</p>`;
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
    } else {
        alert("Erro: Nenhuma tabela encontrada para gerar o PDF.");
    }

    doc.save("relatorio_locacoes.pdf");
}