// A função getCookie continua a mesma
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function showItemAllocationReport() {
    // ALTERAÇÃO APLICADA AQUI: Adicionado o botão "Voltar".
    const reportHTML = `
        <div class="section-header">
            <h2>Relatório de Itens Mais Locados</h2>
            <div>
                <button class="btn-secondary" onclick="showReportMenu()">Voltar</button>
                <button id="generate-pdf" onclick="generateItemAllocationPDF()">Gerar PDF</button>
            </div>
        </div>
        <div id="item-allocation-report-result">
            <p>Carregando relatório...</p>
        </div>
    `;

    document.getElementById("main-content").innerHTML = reportHTML;

    // O restante da função permanece o mesmo...
    const token = getCookie("token");
    if (!token) {
        document.getElementById("item-allocation-report-result").innerHTML = "<p>Token de autenticação não encontrado. Faça login novamente.</p>";
        return;
    }

    fetch("http://localhost:8080/rel/allocbyitem", {
        headers: { "Authorization": token }
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
        if (itemData && Object.keys(itemData).length > 0) {
            const results = Object.entries(itemData).map(([itemName, total]) => ({
                item: itemName,
                totalAllocations: total || 0
            }));
            results.sort((a, b) => b.totalAllocations - a.totalAllocations);
            const tableHTML = `
                <div class="list-container">
                    <table class="generic-list-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Total de Locações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results.map(result => `
                                <tr>
                                    <td data-label="Item">${result.item}</td>
                                    <td data-label="Total de Locações">${result.totalAllocations}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
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

// A função generateItemAllocationPDF continua a mesma
function generateItemAllocationPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Relatório de itens mais locados", 14, 20);
    const table = document.querySelector(".generic-list-table");
    if (table) {
        doc.autoTable({
            html: table,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [20, 54, 88], textColor: 255, fontStyle: 'bold' }
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
    } else {
        alert("Erro: Nenhuma tabela encontrada para gerar o PDF.");
        return;
    }
    doc.save("relatorio_itens_locados.pdf");
}

function showAllocationReport() {
    // ALTERAÇÃO APLICADA AQUI: Adicionado o botão "Voltar".
    const reportHTML = `
        <div class="section-header">
            <h2>Relatório de Locações por Usuários</h2>
            <div>
                <button class="btn-secondary" onclick="showReportMenu()">Voltar</button>
                <button id="generate-pdf" onclick="generatePDF()">Gerar PDF</button>
            </div>
        </div>
        <div id="allocations-report-result">
            <p>Carregando relatório...</p>
        </div>
    `;
    document.getElementById("main-content").innerHTML = reportHTML;

    // O restante da função permanece o mesmo...
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
                <div class="list-container">
                    <table class="generic-list-table">
                        <thead>
                            <tr>
                                <th>Usuário</th>
                                <th>Total de Locações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${results.map(result => `
                                <tr>
                                    <td data-label="Usuário">${result.user}</td>
                                    <td data-label="Total de Locações">${result.totalAllocations}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
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

// A função generatePDF continua a mesma
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Relatório de locações por usuários", 14, 20);
    const table = document.querySelector(".generic-list-table");
    if (table) {
        doc.autoTable({
            html: table,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [20, 54, 88], textColor: 255, fontStyle: 'bold' }
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
    } else {
        alert("Erro: Nenhuma tabela encontrada para gerar o PDF.");
        return;
    }
    doc.save("relatorio_locacoes_por_usuario.pdf");
}