function showReportMenu() {
    const menuHTML = `
        <h2>Selecione o Relatório a Ser Gerado</h2>
        <div class="report-option" id="report-user-allocations">
            <button>Relatório de Locações por Usuário</button>
        </div>
        <div class="report-option" id="report-item-allocations">
            <button>Relatório de Itens Mais Locados</button>
        </div>
        <div class="report-option" id="report-location">
            <button>Relatório de locações com mais itens</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = menuHTML;

    // Adicionando eventos para as opções
    document.getElementById("report-user-allocations").addEventListener("click", () => {
        showAllocationReport();
    });

    document.getElementById("report-item-allocations").addEventListener("click", () => {
        showItemAllocationReport();
    });

    document.getElementById("report-location").addEventListener("click", () => {
        showItemByLocationReport();
    });
}


