document.addEventListener('DOMContentLoaded', () => {
    // Função para formatar datas
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}/${month}/${year}`;
    }

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

                // Formatar o preço do produto
                const preco = parseFloat(produto.preco);
                const precoFormatado = !isNaN(preco) ? preco.toFixed(2).replace('.', ',') : 'N/A';

                // Exibir informações do produto no modal
                const modal = document.getElementById('modal');
                const produtoInfo = document.getElementById('produtoInfo');
                produtoInfo.innerHTML = `
                    <strong>Código:</strong> ${produto.codigoProduto}<br>
                    <strong>Nome:</strong> ${produto.nome}<br>
                    <strong>Valor:</strong> R$ ${precoFormatado}<br>
                    <strong>Data de Validade:</strong> ${formatDate(produto.dataValidade)}<br>
                    <strong>Quantidade:</strong> ${produto.quantidade || 'N/A'}<br>
                    <strong>Data Entrada:</strong> ${formatDate(produto.dataEntrada)}<br>
                `;
                modal.style.display = 'block';
                
                // Exibir lixeira
                const lixeira = document.querySelector('.lixeira');
                lixeira.style.display = 'inline';

                // Somar valor ao total
                const totalInput = document.getElementById('total');
                let totalAtual = parseFloat(totalInput.value.replace('Total: R$ ', '').replace(',', '.')) || 0;
                const novoTotal = totalAtual + (isNaN(preco) ? 0 : preco);
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
 
});
