// Função para mostrar/esconder os submenus
function toggleSubmenu(id) {
    var submenu = document.getElementById(id);
    if (submenu.style.display === "none" || submenu.style.display === "") {
        submenu.style.display = "block"; // Mostra o submenu
    } else {
        submenu.style.display = "none"; // Esconde o submenu
    }
}
