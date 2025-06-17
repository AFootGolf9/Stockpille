// Função de login principal (nenhuma mudança aqui, ela já usa o handleErrors melhorado)
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

    // Usando sua função handleErrors melhorada
    const data = await handleErrors(response);

    console.log('Sucesso:', data);
    
    document.cookie = `token=${data.token}; samesite=lax; path=/`;
    console.log('Token armazenado:', getCookie('token'));
    
    displayMessage("Login bem-sucedido! Redirecionando...", false);

    setTimeout(() => {
        window.location.href = "../pages/home.html";
    }, 1500);

  } catch (error) {
    // Exibe a mensagem de erro específica vinda do handleErrors.
    console.error('Erro de Login:', error);
    displayMessage(error.message, true);
  }
}

/**
 * =================================================================
 * FUNÇÃO handleErrors (VERSÃO FINAL E MAIS COMPLETA)
 * =================================================================
 */
async function handleErrors(response) {
  if (!response.ok) {
    let errorMessage = "Ocorreu um erro inesperado."; // Mensagem padrão

    // Tenta extrair uma mensagem de erro específica do corpo da resposta (JSON).
    try {
      const errorData = await response.json();
      // Prioriza a mensagem do servidor se ela existir.
      if (errorData && (errorData.message || errorData.error)) {
        throw new Error(errorData.message || errorData.error);
      }
    } catch (jsonError) {
      // O corpo do erro não era JSON ou não tinha uma mensagem.
      // Neste caso, vamos usar o código de status para dar uma mensagem mais clara.
    }
    
    // NOVO: Se não conseguiu uma mensagem do JSON, usa o código de status.
    switch (response.status) {
        case 400: // Bad Request
            errorMessage = "Usuário não encontrado. Verifique o nome de usuário digitado.";
            break;
        case 401: // Unauthorized
            errorMessage = "Senha incorreta. Por favor, tente novamente.";
            break;
        case 403: // Forbidden
            errorMessage = "Você não tem permissão para acessar.";
            break;
        case 500: // Internal Server Error
            errorMessage = "Ocorreu um erro no servidor. Tente novamente mais tarde.";
            break;
        default:
             errorMessage = `Erro: ${response.statusText} (código: ${response.status})`;
    }

    throw new Error(errorMessage);
  }
  
  // Se a resposta estiver OK (status 2xx), retorna o JSON do sucesso.
  return response.json();
}

// Função para mostrar mensagens na tela (mantida como na versão anterior)
function displayMessage(msg, isError = false) {
  const messageDiv = document.getElementById("message");
  if (!messageDiv) return;

  messageDiv.innerText = msg;
  messageDiv.className = isError ? 'message-error' : 'message-success';
  messageDiv.style.display = 'block';

  setTimeout(() => {
      messageDiv.style.display = 'none';
      messageDiv.innerText = '';
      messageDiv.className = '';
  }, 5000);
}

// Função para ler o cookie
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}