// A função getCookie continua a mesma
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}



// REATORADO: Convertido para async/await para simplificar o código.
async function showUserByRoleReport() {
    const reportHTML = `
        <div class="section-header">
            <h2>Relatório de Usuários por Função (Role)</h2>
            <div>
                <button onclick="showReportMenu()">Voltar</button>
                <button id="generate-pdf" onclick="generateUserByRolePDF()">Gerar PDF</button>
            </div>
        </div>
        <div id="user-by-role-report-result">
            <p>Carregando relatório...</p>
        </div>
    `;
    document.getElementById('main-content').innerHTML = reportHTML;

    const reportResultContainer = document.getElementById('user-by-role-report-result');

    try {
        // NOVO: Usa handleResponse para tratar erros e simplifica a chamada.
        const reportData = await fetch('http://localhost:8080/rel/userbyrole', {
            headers: { "Authorization": getCookie("token") }
        }).then(handleResponse);

        if (reportData && Object.keys(reportData).length > 0) {
            let tableHTML = `
                <div class="list-container">
                    <table class="generic-list-table">
                        <thead>
                            <tr>
                                <th>Função (Role)</th>
                                <th>Quantidade de Usuários</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            for (const roleName in reportData) {
                tableHTML += `
                    <tr>
                        <td data-label="Função (Role)">${roleName}</td>
                        <td data-label="Quantidade de Usuários">${reportData[roleName]}</td>
                    </tr>
                `;
            }

            tableHTML += `</tbody></table></div>`;
            reportResultContainer.innerHTML = tableHTML;
        } else {
            reportResultContainer.innerHTML = "<p>Nenhum dado encontrado.</p>";
        }
    } catch (error) {
        // ALTERADO: Captura qualquer erro e exibe uma mensagem clara na interface.
        console.error('Erro ao carregar relatório de usuários por cargo:', error);
        reportResultContainer.innerHTML = `<p class="error-message">Falha ao carregar relatório: ${error.message}</p>`;
    }
}

// ALTERADO: A função generateUserByRolePDF agora usa notificação em vez de alert.
function generateUserByRolePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Relatório de Usuários por Função (Role)", 14, 20);

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
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("StockPille", 14, pageHeight - 10);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 35, pageHeight - 10);
    }

    doc.save("relatorio_usuarios_por_funcao.pdf");
}