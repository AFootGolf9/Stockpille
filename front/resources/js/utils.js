 export function getCookie(cname) {
       const name = cname + "=";
       const decodedCookie = decodeURIComponent(document.cookie);
       const ca = decodedCookie.split(';');
       for(let i = 0; i < ca.length; i++) {
           let c = ca[i];
           while (c.charAt(0) === ' ') {
               c = c.substring(1);
           }
           if (c.indexOf(name) === 0) {
               return c.substring(name.length, c.length);
           }
       }
       return "";
   }
   export function handleErrors(response) {
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        return response.json();
    }

    export function displayMessage(message, isError = false) {
        const messageDiv = document.getElementById('message') || document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.color = isError ? 'red' : 'green';
        // ... (adicionar ao DOM, etc.)
    }