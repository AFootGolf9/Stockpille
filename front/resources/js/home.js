function toggleSubmenu(id) {
    var submenu = document.getElementById(id);
    if (submenu.style.display === "none" || submenu.style.display === "") {
        submenu.style.display = "block"; // Mostra o submenu
    } else {
        submenu.style.display = "none"; // Esconde o submenu
    }
}

function showHome() {
    document.getElementById("main-content").innerHTML = `
        <h2>Bem-vindo!</h2>
        <p>Esta é a área principal. Selecione uma opção no menu.</p>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    // fetch("URL_DA_API_DO_USUARIO")
    //     .then(response => response.json())
    //     .then(data => {
    //         document.getElementById("user-name").textContent = data.nome || "Usuário";
    //     })
    //     .catch(error => console.error("Erro ao carregar dados do usuário:", error));
});


