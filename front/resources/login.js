async function login(){
    var name = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    if(name == "" || password == ""){
        alert("Please fill all the fields");
        return
    }

    const response = await fetch('http://localhost:8080/user/login', {
        method: 'POST',
        // mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            password: password
        })
    }).then(response => response.json()).then((data) => {
        console.log('Success:', data);
        document.cookie = `token=${data.token}; samesite=lax; path=/`
        console.log(data.message)
        if (data.message != "Invalid user or password") {
            window.location.href = "../pages/home.html"
        }else{
            alert("Invalid credentials")
        }
    }).catch((error) => {
        console.error('Error:', error);
    });
}