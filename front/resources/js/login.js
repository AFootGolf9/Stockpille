async function login() {
  try {
    const name = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (!name || !password) {
      displayMessage("Por favor, preencha todos os campos.", true);
      return;
    }

    const response = await fetch('http://localhost:8080/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password })
    });

    const data = await handleErrors(response);

    console.log('Success:', data);

    document.cookie = `token=${data.token}; samesite=lax; path=/`;

    console.log('Token stored:', getCookie('token'));

    window.location.href = "../pages/home.html";

  } catch (error) {
    console.error('Login Error:', error);
    displayMessage("Credenciais inválidas. Tente novamente.", true);
  }
}

// Função para lidar com erros de resposta da API
async function handleErrors(response) {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Erro desconhecido.");
  }
  return await response.json();
}

// Função para mostrar mensagens na tela
function displayMessage(msg, isError = false) {
  const messageDiv = document.getElementById("message");
  messageDiv.innerText = msg;
  messageDiv.style.color = isError ? "red" : "green";
  messageDiv.style.marginTop = "10px";
}

// Função para ler o cookie (opcional)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

