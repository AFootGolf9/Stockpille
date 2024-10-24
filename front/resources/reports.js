// Função para exibir as opções de relatórios
function showReportOptions() {
    const reportHtml = `
        <h2>Gerar Relatórios</h2>
        <ul>
            <li><a href="#" onclick="generateReport('locacoes')">Relatório de locações por usuário</a></li>
            <li><a href="#" onclick="generateReport('maisLocados')">Relatório de itens mais locados</a></li>
            <li><a href="#" onclick="generateReport('maisItens')">Relatório de localizações com mais itens</a></li>
        </ul>
    `;
    
    // Atualiza a área principal para exibir as opções de relatórios
    document.getElementById('main-content').innerHTML = reportHtml;
}

// Função para gerar o PDF do relatório baseado no tipo selecionado
function generateReport(tipo) {
    // Exibe uma mensagem de carregamento enquanto a requisição é feita
    document.getElementById('main-content').innerHTML = `<p>Gerando relatório ${tipo} de produtos...</p>`;

    // Fazer uma requisição à API para obter o relatório correspondente
    fetch(`https://suaapi.com/relatorios/${tipo}`) // URL da API (substitua com a correta)
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar o relatório');
            }
            return response.json();
        })
        .then(data => {
            // Chama a função para gerar o PDF
            generatePDF(tipo, data);
        })
        .catch(error => {
            console.error('Erro:', error);
            document.getElementById('main-content').innerHTML = `<p>Erro ao carregar o relatório. Tente novamente mais tarde.</p>`;
        });
}

// Função para gerar o PDF usando jsPDF
function generatePDF(tipo, data) {
    // Carregar o jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título do PDF
    doc.setFontSize(18);
    doc.text(`Relatório de ${tipo}`, 10, 10);

    // Cabeçalhos da tabela
    doc.setFontSize(12);
    let headers = ['ID', 'Produto', 'Quantidade', 'Data'];
    let startX = 10;
    let startY = 20;

    headers.forEach((header, i) => {
        doc.text(header, startX + i * 40, startY);
    });

    // Adiciona os dados da API no PDF
    data.forEach((item, index) => {
        let yPosition = startY + 10 + index * 10;
        doc.text(item.id.toString(), startX, yPosition);
        doc.text(item.produto, startX + 40, yPosition);
        doc.text(item.quantidade.toString(), startX + 80, yPosition);
        doc.text(item.data, startX + 120, yPosition);
    });

    // Salvar o PDF
    doc.save(`relatorio_${tipo}.pdf`);

    // Atualiza a mensagem na página
    document.getElementById('main-content').innerHTML = `<p>Relatório de ${tipo} gerado com sucesso! Verifique seu download.</p>`;
}
