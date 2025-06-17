// A função getCookie continua a mesma
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

// REATORADO: Convertido para async/await para simplificar o código.
async function showItemAllocationReport() {
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

    const reportResultContainer = document.getElementById("item-allocation-report-result");

    try {
        // NOVO: Usa handleResponse para tratar erros e simplifica a chamada.
        const itemData = await fetch("http://localhost:8080/rel/allocbyitem", {
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse);

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
            reportResultContainer.innerHTML = tableHTML;
        } else {
            reportResultContainer.innerHTML = "<p>Nenhum dado de locação por item encontrado.</p>";
        }
    } catch (error) {
        // ALTERADO: Captura qualquer erro e exibe uma mensagem clara na interface.
        console.error("Erro ao carregar o relatório de itens:", error);
        reportResultContainer.innerHTML = `<p class="error-message">Erro ao carregar o relatório: ${error.message}</p>`;
    }
}

// ALTERADO: A função generateItemAllocationPDF agora usa notificação em vez de alert.
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
        // Usa notificação para o erro.
        showNotification("Nenhuma tabela encontrada para gerar o PDF.", "error");
        return;
    }
    doc.save("relatorio_itens_locados.pdf");
}


// REATORADO: Convertido para async/await e usa Promise.all para eficiência.
async function showAllocationReport() {
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

    const reportResultContainer = document.getElementById("allocations-report-result");

    try {
        // NOVO: Usa Promise.all para buscar dados de usuários e alocações simultaneamente.
        const [usersResponse, allocationResponse] = await Promise.all([
            fetch("http://localhost:8080/user", { headers: { "Authorization": getCookie("token") } }).then(handleResponse),
            fetch("http://localhost:8080/rel/allocbyuser", { headers: { "Authorization": getCookie("token") } }).then(handleResponse)
        ]);

        const users = usersResponse?.data || [];
        const allocationData = allocationResponse || {};

        if (users.length === 0) {
            reportResultContainer.innerHTML = "<p>Nenhum usuário encontrado para gerar o relatório.</p>";
            return;
        }

        if (Object.keys(allocationData).length === 0) {
            reportResultContainer.innerHTML = "<p>Nenhuma locação encontrada.</p>";
            // Ainda assim, pode ser útil mostrar os usuários com 0 alocações.
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
        reportResultContainer.innerHTML = tableHTML;

    } catch (error) {
        // ALTERADO: Um único catch para qualquer erro na busca de dados.
        console.error("Erro ao carregar o relatório de locações:", error);
        reportResultContainer.innerHTML = `<p class="error-message">Erro ao carregar o relatório: ${error.message}</p>`;
    }
}


// ALTERADO: A função generatePDF agora usa notificação em vez de alert.
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
        // Usa notificação para o erro.
        showNotification("Nenhuma tabela encontrada para gerar o PDF.", "error");
        return;
    }
    doc.save("relatorio_locacoes_por_usuario.pdf");
}