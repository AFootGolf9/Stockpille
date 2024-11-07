function register(){

    const formHTML = `
        <h2>Cadastro de Produto</h2>
        <div class="form-group">
            <label for="username">Nome:</label>
            <input type="text" id="username" name="username" required>
        </div>
        <div class="form-group">
            <label for="name">Cargo:</label>
            <input type="text" id="role" name="role" required>
        </div>
        <div class="form-group">
            <label for="password">Senha:</label>
            <input type="password" id="password" name="password" required></textarea>
        </div>
        <div class="form-group">
            <button id="register">Cadastrar usuário</button>
        </div>
    `;

    document.getElementById("main-content").innerHTML = formHTML;

    document.getElementById("register").addEventListener("click", function() {

    var name = document.getElementById("username").value;
    var role = document.getElementById("role").value;
    var password = document.getElementById("password").value;

    if(name == "" || role == "" || password == ""){
        alert("Please fill all the fields");
        return
    }

    // length of 4 for testing purposes
    if(password.length < 4){
        alert("Password must be at least 4 characters long");
        return
    }
    


    fetch('http://localhost:8080/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            role: role,
            password: password
        })
        
    }) 
    .then(response => {
        if (response.ok) {
            alert("Produto cadastrado com sucesso!");
            document.getElementById("name").value = '';
            document.getElementById("role").value = '';
            document.getElementById("password").value = '';
        } else {
            throw new Error("Erro ao cadastrar usuário.");
        }
    })
})}