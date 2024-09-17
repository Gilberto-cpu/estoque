document.addEventListener("DOMContentLoaded", function() {
    const password = document.getElementById("password");
    const entrarBtn = document.getElementById("entrar-btn");
    const aviso = document.getElementById('aviso');
    const gif = document.getElementById('gifEntrar');
     const url1 = '../PaginaPrincipal/principal.html';


    // Esconder o botão "entrar" se o campo de senha estiver vazio
    entrarBtn.style.display = password.value.trim() !== '' ? 'inline' : 'none';
    aviso.style.display = 'none';

    // Mostrar ou esconder o botão "entrar" baseado no input do usuário
    password.addEventListener("input", function() {
        entrarBtn.style.display = password.value.trim() !== '' ? 'inline' : 'none';
    });

    // Lidar com o evento de clique no botão "entrar"
    entrarBtn.addEventListener("click", function() {
        entrarBtn.style.display = 'none';
        gif.style.display = 'inline';

        validatePassword();
    });

    // Lidar com o evento de tecla "Enter"
    password.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Impede o comportamento padrão do Enter, se necessário
            entrarBtn.click(); // Simula um clique no botão de envio
        }
    });

    // Função para validar a senha através de uma requisição ao servidor
    window.validatePassword = async function() {
        const username = document.getElementById('user').value;
        const passwordValue = document.getElementById('password').value; // Renomeado para evitar conflito

        console.log('Tentando fazer login com:', { username, passwordValue });

        aviso.textContent = '';
        aviso.style.display = 'none';

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password: passwordValue }) // Corrigido
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Login bem-sucedido:', data.message);

                // Se o login for bem-sucedido, redireciona após um tempo
                setTimeout(() => {
                    window.location.href = url1;
                }, 3000);
            } else {
                // Se houver um erro no login, mostra o erro
                const errorData = await response.json();
                console.error('Erro de login:', errorData.error);
                aviso.textContent = errorData.error || 'Erro desconhecido';
                aviso.style.display = 'inline';
                gif.style.display = 'none';
                entrarBtn.style.display = 'inline'; // Mostrar o botão novamente em caso de erro
            }
        } catch (error) {
            console.error('Erro de requisição:', error.message);
            aviso.textContent = 'Erro na requisição. Tente novamente.';
            aviso.style.display = 'inline';
            gif.style.display = 'none';
            entrarBtn.style.display = 'inline'; // Mostrar o botão novamente em caso de erro
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        localStorage.removeItem('loggedOut');
    });
    
});
