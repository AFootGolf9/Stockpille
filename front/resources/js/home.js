function toggleSubmenu(id) {
    var submenu = document.getElementById(id);
    if (submenu.style.display === "none" || submenu.style.display === "") {
        submenu.style.display = "block";
    } else {
        submenu.style.display = "none";
    }
}

let dashboardChartInstance = null;

async function showDashboard() {
    if (dashboardChartInstance) {
        dashboardChartInstance.destroy();
        dashboardChartInstance = null;
    }

    const mainContent = document.getElementById("main-content");
    
    mainContent.innerHTML = `
        <div class="dashboard-header">
            <h2>Dashboard Principal</h2>
            <p>Visão geral do estoque e atividades.</p>
        </div>
        <div class="dashboard-grid">
            <div class="dashboard-card kpi-card">
                <div class="card-icon"><i class="fas fa-box"></i></div>
                <div class="card-content">
                    <h3 id="total-items">...</h3>
                    <p>Itens Totais</p>
                </div>
            </div>
            <div class="dashboard-card kpi-card">
                <div class="card-icon"><i class="fas fa-users"></i></div>
                <div class="card-content">
                    <h3 id="total-users">...</h3>
                    <p>Usuários Ativos</p>
                </div>
            </div>
            <div class="dashboard-card kpi-card">
                <div class="card-icon"><i class="fas fa-dolly"></i></div>
                <div class="card-content">
                    <h3 id="total-allocations">...</h3>
                    <p>Itens Alocados</p>
                </div>
            </div>
            <div class="dashboard-card kpi-card">
                <div class="card-icon"><i class="fas fa-map-marker-alt"></i></div>
                <div class="card-content">
                    <h3 id="total-locations">...</h3>
                    <p>Localizações</p>
                </div>
            </div>
            <div class="dashboard-card chart-card" id="chart-card-container">
                <h4>Top 5 Itens Mais Alocados</h4>
                <div class="chart-wrapper">
                    <canvas id="topItemsChart"></canvas>
                </div>
            </div>
            <div class="dashboard-card">
                <h4>Ações Rápidas</h4>
                <div class="quick-actions">
                    <button class="btn-quick-action" onclick="showAllocationForm()"><i class="fas fa-plus-circle"></i> Alocar Item</button>
                    <button class="btn-quick-action" onclick="showProductForm()"><i class="fas fa-plus-circle"></i> Novo Item</button>
                    <button class="btn-quick-action" onclick="showUserForm()"><i class="fas fa-user-plus"></i> Novo Usuário</button>
                </div>
                <hr>
                <h4>Locações Recentes</h4>
                <ul id="recent-activity-list" class="recent-activity">
                    <li>Carregando atividades...</li>
                </ul>
            </div>
        </div>
    `;

    try {
        const token = getCookie("token");
        const fetchOptions = {
            headers: { "Authorization": token },
            cache: 'no-cache'
        };

        const timestamp = new Date().getTime();
        const results = await Promise.allSettled([
            fetch(`http://localhost:8080/item?_t=${timestamp}`, fetchOptions).then(handleResponse),
            fetch(`http://localhost:8080/user?_t=${timestamp}`, fetchOptions).then(handleResponse),
            fetch(`http://localhost:8080/allocation?_t=${timestamp}`, fetchOptions).then(handleResponse),
            fetch(`http://localhost:8080/location?_t=${timestamp}`, fetchOptions).then(handleResponse),
            fetch(`http://localhost:8080/rel/allocbyitem?_t=${timestamp}`, fetchOptions).then(handleResponse)
        ]);
        
        const [itemResult, userResult, allocationResult, locationResult, topItemsResult] = results;

        // ===== INÍCIO DA ALTERAÇÃO FINAL =====
        
        // Função auxiliar para definir o conteúdo dos cards de KPI
        const setKpiContent = (elementId, result) => {
            const element = document.getElementById(elementId);
            if (result.status === 'fulfilled') {
                const count = result.value.data?.length;
                // Se a contagem for 0 ou indefinida, mostra um traço. Senão, mostra a contagem.
                element.textContent = count > 0 ? count : '-';
            } else {
                // Se a requisição falhou (ex: 403), mostra o cadeado.
                element.innerHTML = '<i class="fas fa-lock"></i>';
            }
        };

        setKpiContent('total-items', itemResult);
        setKpiContent('total-users', userResult);
        setKpiContent('total-allocations', allocationResult);
        setKpiContent('total-locations', locationResult);

        const recentActivityList = document.getElementById('recent-activity-list');
        if (allocationResult.status === 'fulfilled') {
            if (itemResult.status === 'fulfilled' && userResult.status === 'fulfilled' && locationResult.status === 'fulfilled') {
                const allAllocations = allocationResult.value.data || [];
                const sortedAllocations = [...allAllocations].sort((a, b) => b.id - a.id);
                const recentAllocations = sortedAllocations.slice(0, 5);

                if (recentAllocations.length > 0) {
                    recentActivityList.innerHTML = '<li>Carregando detalhes...</li>';
                    const activityPromises = recentAllocations.map(async (alloc) => {
                         try {
                            const [itemDetails, userDetails, locationDetails] = await Promise.all([
                                fetch(`http://localhost:8080/item/${alloc.item_id}`, fetchOptions).then(handleResponse),
                                fetch(`http://localhost:8080/user/${alloc.user_id}`, fetchOptions).then(handleResponse),
                                fetch(`http://localhost:8080/location/${alloc.location_id}`, fetchOptions).then(handleResponse)
                            ]);
                            const item = itemDetails.data || { name: 'Item desconhecido', sku: 'N/A' };
                            const user = userDetails.data || { name: 'Usuário desconhecido' };
                            const location = locationDetails.data || { name: 'local desconhecido' };
                            return `<li><b>${user.name}</b> alocou <b>${item.name}</b> (SKU: ${item.sku}) para <b>${location.name}</b>.</li>`;
                        } catch (error) {
                            return `<li>Erro ao carregar detalhes da alocação #${alloc.id}.</li>`;
                        }
                    });
                    const finalHtmlItems = await Promise.all(activityPromises);
                    recentActivityList.innerHTML = finalHtmlItems.join('');
                } else {
                    recentActivityList.innerHTML = '<li>Nenhuma locação recente.</li>';
                }
            } else {
                 recentActivityList.innerHTML = '<li><span class="error-message">Sem permissão para ver detalhes.</span></li>';
            }
        } else {
            recentActivityList.innerHTML = '<li><span class="error-message">Sem permissão para ver locações.</span></li>';
        }

        const chartContainer = document.getElementById('chart-card-container');
        if (topItemsResult.status === 'fulfilled') {
            const topItemsResponse = topItemsResult.value;
            if (topItemsResponse && Object.keys(topItemsResponse).length > 0) {
                const sortedItems = Object.entries(topItemsResponse).sort(([,a],[,b]) => b-a).slice(0, 5);
                const labels = sortedItems.map(item => item[0]);
                const dataValues = sortedItems.map(item => item[1]);
                const ctx = document.getElementById('topItemsChart').getContext('2d');
                dashboardChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: { labels, datasets: [{ label: 'Nº de Alocações', data: dataValues, backgroundColor: 'rgba(20, 54, 88, 0.8)', borderColor: 'rgba(20, 54, 88, 1)', borderWidth: 1 }] },
                    options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true } } }
                });
            } else {
                // Se a API retornar sucesso, mas sem dados, mostra uma mensagem amigável
                chartContainer.innerHTML = '<h4>Top 5 Itens Mais Alocados</h4><p style="padding: 10px;">Ainda não há dados para exibir neste gráfico.</p>';
            }
        } else {
            chartContainer.innerHTML = '<h4>Top 5 Itens Mais Alocados</h4><p class="error-message" style="padding: 10px;">Você não tem permissão para visualizar este gráfico.</p>';
        }

    } catch (error) {
        console.error("Erro geral ao montar o dashboard:", error);
        mainContent.innerHTML = `<p class="error-message">Ocorreu um erro inesperado ao carregar o dashboard.</p>`;
    }
}

function showHome() {
    showDashboard();
}

document.addEventListener("DOMContentLoaded", () => {
    const token = getCookie("token");
    if (!token) {
        console.error("Token de autenticação não encontrado. Redirecionando para a página de login.");
        window.location.href = '../pages/login.html';
        return; 
    }

});