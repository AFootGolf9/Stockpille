function showReportMenu() {
    // ALTERAÇÃO: HTML simplificado para focar no texto e parecer um botão.
    const menuHTML = `
        <div class="section-header">
            <h2>Menu de Relatórios</h2>
        </div>
        
        <div class="report-menu-container">
            <div class="report-card-button" id="report-user-allocations">
                <h3>Locações por Usuário</h3>
            </div>

            <div class="report-card-button" id="report-item-allocations">
                <h3>Itens Mais Locados</h3>
            </div>

            <div class="report-card-button" id="report-location">
                <h3>Itens por Localização</h3>
            </div>

            <div class="report-card-button" id="report-category">
                <h3>Itens por Categoria</h3>
            </div>

            <div class="report-card-button" id="report-user-by-role">
                <h3>Usuários por Cargo</h3>
            </div>
        </div>
    `;

    document.getElementById("main-content").innerHTML = menuHTML;

    // A lógica de clique continua a mesma.
    document.getElementById("report-user-allocations").addEventListener("click", showAllocationReport);
    document.getElementById("report-item-allocations").addEventListener("click", showItemAllocationReport);
    document.getElementById("report-location").addEventListener("click", showItemByLocationReport);
    document.getElementById("report-category").addEventListener("click", showItemByCategoryReport);
    document.getElementById("report-user-by-role").addEventListener("click", showUserByRoleReport);
}