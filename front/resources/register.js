function register(){
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
    .then(response => window.location.href = "../pages/login.html")

}