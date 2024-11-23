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

    // Insere o HTML inicial no conteúdo principal
    document.getElementById("main-content").innerHTML = reportHTML;

    // Faz a requisição para obter todos os usuários
    fetch("http://localhost:8080/user")
        .then(response => response.json())
        .then(usersData => {
            console.log("Usuários obtidos:", usersData);  // Log para verificar os usuários recebidos
            // Verifica se a resposta contém usuários
            if (usersData && Array.isArray(usersData.data) && usersData.data.length > 0) {
                const users = usersData.data;  // Lista de usuários

                // Faz uma requisição para obter a quantidade de locações por usuário
                fetch("http://localhost:8080/rel/allocbyuser")
                    .then(res => res.json())
                    .then(allocationData => {
                        console.log("Relatório de locações por usuário:", allocationData); // Log da resposta de locações

                        // Verifica se a resposta de locações contém dados
                        if (allocationData && Object.keys(allocationData).length > 0) {
                            // Processa os dados e monta o relatório
                            const results = users.map(user => {
                                const userName = user.name;
                                const totalAllocations = allocationData[userName] || 0;  // Conta locações ou usa 0 caso não haja locações para o usuário
                                return {
                                    user: userName,
                                    totalAllocations: totalAllocations
                                };
                            });

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

            } else {
                document.getElementById("allocations-report-result").innerHTML = "<p>Nenhum usuário encontrado.</p>";
            }
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

    // Salva o PDF gerado
    doc.save("relatorio_locacoes.pdf");
}
