document.addEventListener('DOMContentLoaded', () => {
    // Evento para processar o código do produto ao mudar o input
    document.getElementById('codigo_Produto').addEventListener('change', function() {
        const codigoProduto = this.value;

        // Buscar informações do produto
        fetch(`http://localhost:3000/produtos/${codigoProduto}`)
            .then(response => response.json())
            .then(produto => {
                if (!produto || produto.error) {
                    alert('Erro: Produto não encontrado ou valor inválido');
                    return;
                }

                // Exibir informações do produto no modal
                const modal = document.getElementById('modal');
                const produtoInfo = document.getElementById('produtoInfo');
                produtoInfo.innerHTML = `
                    <strong>Código:</strong> ${produto.codigoProduto}<br>
                    <strong>Nome:</strong> ${produto.nome}<br>
                    <strong>Valor:</strong> R$ ${produto.preco ? produto.preco.toFixed(2).replace('.', ',') : 'N/A'}<br>
                    <strong>Data de Validade:</strong> ${produto.dataValidade || 'N/A'}<br>
                    <strong>Quantidade:</strong> ${produto.quantidade || 'N/A'}<br>
                    <strong>Data Entrada:</strong> ${produto.dataEntrada || 'N/A'}<br>
                `;
                modal.style.display = 'block';
                
                // Exibir lixeira
                const lixeira = document.querySelector('.lixeira');
                lixeira.style.display = 'inline';

                // Somar valor ao total
                const totalInput = document.getElementById('total');
                const totalAtual = parseFloat(totalInput.value.replace('Total: R$ ', '').replace(',', '.')) || 0;
                const novoTotal = totalAtual + (produto.preco || 0);
                totalInput.value = `Total: R$ ${novoTotal.toFixed(2).replace('.', ',')}`;

                // Armazenar produto no localStorage
                const produtos = JSON.parse(localStorage.getItem('produtos')) || [];
                produtos.push(produto);
                localStorage.setItem('produtos', JSON.stringify(produtos));

                // Limpar o input após bipar
                this.value = '';  
            })
            .catch(error => console.error('Erro:', error));
    });

    // Fechar o modal ao clicar no "X"
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('modal').style.display = 'none';
        document.getElementById('codigo_Produto').focus();
        resetarTotalELixeira();
    });

    // Fechar o modal e esconder a lixeira ao pressionar a tecla Delete
    document.addEventListener("keydown", function(event) {
        if (event.key === "Delete") {
            event.preventDefault(); 
            document.getElementById('modal').style.display = 'none'; // Esconde o modal
            resetarTotalELixeira(); // Redefine o total e esconde a lixeira
        }
    });

    // Função para resetar o total e esconder a lixeira
    const resetarTotalELixeira = () => {
        const totalInput = document.getElementById('total');
        totalInput.value = 'Total: R$ 0,00'; // Redefine o valor do total
        const lixeira = document.querySelector('.lixeira');
        lixeira.style.display = 'none'; // Esconde a lixeira
    }

    // Função para lidar com o logout
  
      const logoutButton = document.getElementById('logoutButton');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.setItem('loggedOut', 'true');
            setTimeout(() => {
                window.location.href = 'http://127.0.0.1:5500/EntrarSistema/entrarSistema.html'; // Redireciona para a página de login
            }, 2000); // Espera 2 segundos antes de redirecionar
        });
    }
});
