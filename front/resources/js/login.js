import { getCookie, handleErrors, displayMessage } from '../utils.js';

 async function login() {
  try {
  const name = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!name || !password) {
  displayMessage("Please fill all fields.", true);
  return;
  }

  const response = await fetch('http://localhost:8080/user/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, password })
  });

  const data = await handleErrors(response);

  console.log('Success:', data); // Mantendo o log de sucesso

  document.cookie = `token=${data.token}; samesite=lax; path=/`;

  console.log('Token stored:', getCookie('token')); // Log do token armazenado

  window.location.href = "../pages/home.html";

  } catch (error) {
  console.error('Login Error:', error);
  displayMessage("Invalid credentials. Please try again.", true);
  }
 }