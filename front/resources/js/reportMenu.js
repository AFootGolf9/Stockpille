function showReportMenu() {
    const menuHTML = `
        <h2>Selecione o Relatório a Ser Gerado</h2>
        <div class="report-option" id="report-user-allocations" style="margin-bottom: 10px;">
            <button>Relatório de Locações por Usuário</button>
        </div>
        <div class="report-option" id="report-item-allocations" style="margin-bottom: 10px;">
            <button>Relatório de Itens Mais Locados</button>
        </div>
        <div class="report-option" id="report-location" style="margin-bottom: 10px;">
            <button>Relatório de Locações com Mais Itens</button>
        </div>
        <div class="report-option" id="report-category" style="margin-bottom: 10px;">
            <button>Relatório de Itens por Categoria</button>
        </div>
        <div class="report-option" id="report-user-by-role" style="margin-bottom: 10px;">
            <button>Relatório de Usuários por Cargo</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = menuHTML;

    document.getElementById("report-user-allocations").addEventListener("click", () => {
        showAllocationReport();
    });

    document.getElementById("report-item-allocations").addEventListener("click", () => {
        showItemAllocationReport();
    });

    document.getElementById("report-location").addEventListener("click", () => {
        showItemByLocationReport();
    });

    document.getElementById("report-category").addEventListener("click", () => {
        showItemByCategoryReport();
    });

    document.getElementById("report-user-by-role").addEventListener("click", () => {
        showUserByRoleReport();
    });
}