// Função para mostrar/esconder os submenus
function toggleSubmenu(id) {
    var submenu = document.getElementById(id);
    if (submenu.style.display === "none" || submenu.style.display === "") {
        submenu.style.display = "block"; // Mostra o submenu
    } else {
        submenu.style.display = "none"; // Esconde o submenu
    }
}

// Função para mostrar a página inicial
function showHome() {
    document.getElementById("main-content").innerHTML = `
        <h2>Bem-vindo!</h2>
        <p>Esta é a área principal. Selecione uma opção no menu.</p>
    `;
}


