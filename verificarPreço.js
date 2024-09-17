
document.addEventListener('DOMContentLoaded', () => {
    // Evento para processar o código do produto ao mudar o input
    document.getElementById('codigoInput').addEventListener('change', function() {
        const codigoProduto = this.value;

        fetch(`http://localhost:3000/produtos/${codigoProduto}`)
            .then(response => response.json())
            .then(produto => {
                if (!produto || produto.error) {
                    alert('Erro: Produto não encontrado ou valor inválido');
                    return;
                }
                
                // Exibir informações do produto no modal
                const bolsa = document.getElementById('bolsa')
                const modal = document.getElementById('modal');
                const produtoInfo = document.getElementById('produtoInfo');
                produtoInfo.innerHTML = `
                    <strong>Código:</strong> ${produto.codigoProduto}<br>
                    <strong>Nome:</strong> ${produto.nome}<br>
                    <strong>Valor:</strong> R$ ${produto.preco ? produto.preco.toFixed(2) : 'N/A'}<br>
                    <strong>Data de Validade:</strong> ${produto.dataValidade ? produto.dataValidade : 'N/A'}<br>
                    <strong>Quantidade:</strong> ${produto.quantidade ? produto.quantidade : 'N/A'}<br>
                    <strong>Data Entrada:</strong> ${produto.dataEntrada ? produto.dataEntrada : 'N/A'}<br>
                `;
                modal.style.display = 'block';
                bolsa.style.display = 'none'
                // Exibir lixeira
                const lixeira = document.querySelector('.lixeira');
                lixeira.style.display = 'inline';

                // Somar valor ao total
                const totalInput = document.getElementById('total');
                const totalAtual = parseFloat(totalInput.value.replace('Total: R$ ', '').replace(',', '.')) || 0;
                const novoTotal = totalAtual + (produto.preco || 0);
                totalInput.value = `Total: R$ ${novoTotal.toFixed(2).replace('.', ',')}`;

              
              
                // Limpar o input após bipar
                this.value = '';  
            })
            .catch(error => console.error('Erro:', error));
    });

    // Fechar o modal ao clicar no "X"
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('modal').style.display = 'none';
        document.getElementById('codigoInput').focus();
        resetarTotalELixeira();
    });
    
    setTimeout(()=>{
       resetarTotalELixeira(); // Redefine o total e esconde a lixeira
   document.getElementById('modal').style.display = 'none';
       location.reload()
    },7000)
     
  
    
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
   
   
    
});
