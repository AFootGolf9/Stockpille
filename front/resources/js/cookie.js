function getCookie(cname) {
    let name = cname + "=";

    // Pega todos os cookies do documento e decodifica para tratar caracteres especiais
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();

        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    
    return ""; 
}