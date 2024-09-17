document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('codigoInput').addEventListener('change', function() {
        const codigoProduto = this.value;

        fetch(`http://localhost:3000/produtos/${codigoProduto}`)
            .then(response => response.json())
            .then(produto => {
                if (!produto || produto.error) {
                    alert('Erro: Produto não encontrado ou valor inválido');
                    return;
                }

                const bolsa = document.getElementById('bolsa');
                const modal = document.getElementById('modal'); // Mover a referência para o escopo global
                const produtoInfo = document.getElementById('produtoInfo');
                produtoInfo.innerHTML = `
                    <strong>Código:</strong> ${produto.codigoProduto}<br>
                    <strong>Nome:</strong> ${produto.nome}<br>
                    <strong>Valor:</strong> R$ ${produto.preco ? parseFloat(produto.preco).toFixed(2).replace('.', ',') : 'N/A'}<br>
                    <strong>Data de Validade:</strong> ${formatDate(produto.dataValidade)}<br>
                    <strong>Quantidade:</strong> ${produto.quantidade ? produto.quantidade : 'N/A'}<br>
                    <strong>Data Entrada:</strong> ${produto.dataEntrada ? formatDate( produto.dataEntrada) : 'N/A'}<br>
                `;
                modal.style.display = 'block';
                bolsa.style.display = 'none';

                const lixeira = document.querySelector('.lixeira');
                lixeira.style.display = 'inline';

                const totalInput = document.getElementById('total');
                let totalAtual = totalInput.value.replace('Total: R$ ', '').replace(',', '.');
                totalAtual = parseFloat(totalAtual);

                if (isNaN(totalAtual)) {
                    totalAtual = 0; // Inicializa com 0 se não for um número válido
                }

                const precoProduto = parseFloat(produto.preco);

                if (isNaN(precoProduto)) {
                    console.error('Erro: preço do produto não é um número válido.');
                    return;
                }

                const novoTotal =  precoProduto;

                if (isNaN(novoTotal)) {
                    console.error('Erro: novoTotal não é um número válido.');
                    return;
                }

                totalInput.value = `Total: R$ ${novoTotal.toFixed(2).replace('.', ',')}`;

                this.value = '';  
            })
            .catch(error => console.error('Erro:', error));
    });

    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('modal').style.display = 'none';
        document.getElementById('codigoInput').focus();
        resetarTotalELixeira();
    });

    document.addEventListener("keydown", function(event) {
        if (event.key === "Delete") {
            event.preventDefault(); 
            document.getElementById('modal').style.display = 'none'; 
            resetarTotalELixeira(); 
           
        }
    });

    // Referência ao modal no escopo global
    const modal = document.getElementById('modal');

    const resetarTotalELixeira = () => {
        const totalInput = document.getElementById('total');
        totalInput.value = 'Total: R$ 0,00'; 
        const lixeira = document.querySelector('.lixeira');
        lixeira.style.display = 'none'; 
        modal.style.display = 'none'; // Agora `modal` está acessível 
        location.reload()
        
    }

    setTimeout(() => {
        resetarTotalELixeira();
    }, 7000);

    function formatDate(dateString) {
        if (!dateString) return null;
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}/${month}/${year}`;
    }
});
