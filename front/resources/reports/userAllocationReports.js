function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function showAllocationReport() {
    // ALTERAÇÃO APLICADA AQUI: Padronizando o cabeçalho da página.
    const reportHTML = `
        <div class="section-header">
            <h2>Relatório de Locações por Usuários</h2>
            <button id="generate-pdf" onclick="generatePDF()">Gerar PDF</button>
        </div>
        <div id="allocations-report-result">
            <p>Carregando relatório...</p>
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

            // ALTERAÇÕES APLICADAS AQUI: Usando o padrão de container, tabela e data-labels.
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


function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Relatório de locações por usuários", 14, 20);

    // ALTERAÇÃO APLICADA AQUI: O seletor agora busca pela classe genérica e correta.
    const table = document.querySelector(".generic-list-table");
    if (!table) {
        alert("Erro: Nenhuma tabela encontrada para gerar o PDF.");
        return;
    }
    
    doc.autoTable({
        html: table, // O método 'html' simplifica a extração de dados da tabela
        startY: 30,
        theme: 'grid',
        headStyles: {
            fillColor: [20, 54, 88], // Cor do cabeçalho do nosso CSS
            textColor: 255,
            fontStyle: 'bold',
        }
    });
    
    // Adiciona rodapé em todas as páginas
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("StockPille", 14, pageHeight - 10);
        doc.text(`Página ${i} de ${pageCount}`, doc.internal.pageSize.getWidth() - 35, pageHeight - 10);
    }

    doc.save("relatorio_locacoes_por_usuario.pdf");
}