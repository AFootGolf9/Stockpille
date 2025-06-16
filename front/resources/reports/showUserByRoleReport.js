function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function showUserByRoleReport() {
    const token = getCookie('token');

    // ALTERAÇÃO APLICADA AQUI: Usando o cabeçalho padronizado.
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

    fetch('http://localhost:8080/rel/userbyrole', {
        headers: {
            "Authorization": token
        }
    })
    .then(res => {
        if (!res.ok) throw new Error(`Erro ${res.status} ao carregar relatório`);
        return res.json();
    })
    .then(data => {
        if (data && Object.keys(data).length > 0) {
            
            // ALTERAÇÕES APLICADAS AQUI:
            // 1. Adicionado o "list-container".
            // 2. Tabela usa a classe "generic-list-table" e não tem estilos inline.
            // 3. Cada <td> tem seu "data-label" para responsividade.
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

            for (const roleName in data) {
                tableHTML += `
                    <tr>
                        <td data-label="Função (Role)">${roleName}</td>
                        <td data-label="Quantidade de Usuários">${data[roleName]}</td>
                    </tr>
                `;
            }

            tableHTML += `</tbody></table></div>`; // Fechando table e div

            document.getElementById('user-by-role-report-result').innerHTML = tableHTML;
        } else {
            document.getElementById('user-by-role-report-result').innerHTML = "<p>Nenhum dado encontrado.</p>";
        }
    })
    .catch(err => {
        console.error('Erro ao carregar relatório:', err);
        document.getElementById('user-by-role-report-result').innerHTML = `<p>Falha ao carregar relatório: ${err.message}</p>`;
    });
}


function generateUserByRolePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Relatório de Usuários por Função (Role)", 14, 20);

    // ALTERAÇÃO APLICADA AQUI: O seletor agora busca pela classe genérica e correta.
    const table = document.querySelector(".generic-list-table");
    if (!table) {
        alert("Erro: Nenhuma tabela encontrada para gerar o PDF.");
        return;
    }

    doc.autoTable({
        html: table, // O método 'html' simplifica a extração de dados
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

    doc.save("relatorio_usuarios_por_funcao.pdf");
}