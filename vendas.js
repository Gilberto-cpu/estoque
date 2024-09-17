<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", function () {
    const productList = document.getElementById('product-list');

    // Função para obter os produtos do localStorage
    function getProductsFromLocalStorage() {
        return JSON.parse(localStorage.getItem('produtos')) || [];
    }

    // Função para salvar produto no localStorage
    function saveProduct(produto) {
        let produtos = getProductsFromLocalStorage();
        produtos.push(produto);
        localStorage.setItem('produtos', JSON.stringify(produtos));
        calcularTotal();
    }

    // Função para remover produto do localStorage
    function removeProductFromLocalStorage(codigoProduto) {
        let produtos = getProductsFromLocalStorage();
        produtos = produtos.filter(produto => produto.codigoProduto !== parseInt(codigoProduto));
        localStorage.setItem('produtos', JSON.stringify(produtos));
        calcularTotal();
    }

    // Função para formatar data
    function formatDate(dateString) {
        const date = moment(dateString, 'YYYY-MM-DD');
        return date.isValid() ? date.format('DD/MM/YYYY') : 'N/A';
    }

    // Função para exibir produto na lista
    function ProdutoVendido(produto) {
        const listItem = document.createElement('li');
        const dataEntradaFormatada = formatDate(produto.dataEntrada);

        listItem.textContent = `Produto: ${produto.nome}, Quantidade: ${produto.quantidade}, Preço: R$ ${parseFloat(produto.preco).toFixed(2).replace('.', ',')}, Código: ${produto.codigoProduto}; Data de Entrada: ${dataEntradaFormatada}`;
        document.getElementById('product-list').appendChild(listItem);
    }

    // Evento de adicionar produto
    const botao = document.getElementById('addProduct');

    botao.addEventListener('click', (event) => {
        event.preventDefault();
        const nome = document.getElementById('productName').value;
        const preco = parseFloat(document.getElementById('price').value);
        const quantidade = parseInt(document.getElementById('quantity').value);
        const dataEntradaValue = document.getElementById('data_Entrada').value;
        const codigoProduto = parseInt(document.getElementById('codigo_Produto').value);
        const dataEntrada = moment(dataEntradaValue, 'YYYY-MM-DD');

        if (dataEntrada.isValid()) {
            if (codigoProduto > 0) {
                const produto = {
                    nome,
                    quantidade,
                    preco,
                    dataEntrada: dataEntradaValue,
                    codigoProduto
                };

                ProdutoVendido(produto);
                saveProduct(produto);
                eraserSoft();
                showSpan();
            } else {
                alert('Preencha todos os campos obrigatórios.');
            }
        } else {
            alert('Formato de data inválido.');
        }
    });

    // Evento de deletar produto
    document.getElementById('deleteProduct').addEventListener('click', async (event) => {
        event.preventDefault();
        const codigoProduto = parseInt(document.getElementById('codigo_Produto').value);
        const quantidade = parseInt(document.getElementById('quantity').value);
        const appearSpanDel = document.getElementById("prodDel");

        if (quantidade) {
            try {
                const response = await fetch(`http://localhost:3000/produtos/${codigoProduto}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ quantidade })
                });

                if (!response.ok) {
                    throw new Error(`Erro na solicitação: ${response.status} - ${response.statusText}`);
                }

                removeProductFromLocalStorage(codigoProduto);
                console.log('Produto deletado com sucesso.');
                appearSpanDel.style.display = 'inline';
                
            } catch (error) {
                console.error('Erro ao deletar produto:', error);
            }
        } else {
            alert('Informe o código do produto para deletar.');
        }
setTimeout(()=>{
                   appearSpanDel.style.display = 'none';
        // document.getElementById('quantity').value = '';
eraserSoft()
                   
                },3000)
    });

               
    // Função para calcular o total das vendas
    function calcularTotal() {
        const produtos = getProductsFromLocalStorage();
        let total = 0;

        produtos.forEach(produto => {
            // Verifica se o preço é um número e soma ao total
            const precoProduto = parseFloat(produto.preco);
            if (!isNaN(precoProduto)) {
                total += precoProduto;
            }
        });

        // Garante que o total seja um número antes de chamar toFixed
        total = Number(total);

        localStorage.setItem('totalVendas', total.toFixed(2));
        displayTotal();
    }

    // Função para exibir o total das vendas
    function displayTotal() {
        const total = localStorage.getItem('totalVendas');
        const inputTotal = document.getElementById('total');
        inputTotal.value = total ? `Total: R$ ${parseFloat(total).toFixed(2).replace('.', ',')}` : 'Total: R$ 0,00';
    }

    const eraserSoft = function () {
        const nome = document.getElementById('productName');
        const quantidade = document.getElementById('quantity');
        const preco = document.getElementById('price');
        const codigoProduto = document.getElementById('codigo_Produto');
        const dataEntrada = document.getElementById('data_Entrada');

        const elementos = [nome, quantidade, preco, codigoProduto, dataEntrada];

        // Adiciona a classe 'hidden' a todos os elementos
        elementos.forEach(function (elemento) {
            elemento.classList.add('hidden');
        });

        // Espera a transição terminar antes de limpar os valores e remover a classe 'hidden'
        elementos.forEach(function (elemento) {
            elemento.addEventListener('transitionend', function () {
                elemento.value = '';
                elemento.classList.remove('hidden'); // Reseta para futuras transições
            }, { once: true });
        });
    }

    function showSpan() {
        const span = document.getElementById('prodVen');
        // Inicialmente, mostra o span e define a opacidade como 0
        span.style.display = 'inline';
        setTimeout(() => {
            span.classList.add('visible'); // Adiciona a classe para a transição de opacidade
        }, 1000); // Pequeno atraso para garantir que a transição ocorra

        // Esconde o span após 3 segundos
        setTimeout(() => {
            span.classList.remove('visible');
            window.location.reload();

            // Esconde o span após a transição de desvanecimento
            span.addEventListener('transitionend', function () {
                span.style.display = 'none';
            }, { once: true });
        }, 3000); // Exibe por 2 segundos
    }

    calcularTotal();
});
=======

document.addEventListener("DOMContentLoaded", function () {
    const productList = document.getElementById('product-list');

    // Função para obter os produtos do localStorage
    function getProductsFromLocalStorage() {
        return JSON.parse(localStorage.getItem('produtos')) || [];
    }

    // Função para salvar produto no localStorage
    function saveProduct(produto) {
        let produtos = getProductsFromLocalStorage();
        produtos.push(produto);
        localStorage.setItem('produtos', JSON.stringify(produtos));
        calcularTotal();
    }

    // Função para remover produto do localStorage
    function removeProductFromLocalStorage(codigoProduto) {
        let produtos = getProductsFromLocalStorage();
        produtos = produtos.filter(produto => produto.codigoProduto !== parseInt(codigoProduto));
        localStorage.setItem('produtos', JSON.stringify(produtos));
        calcularTotal();
    }

    // Função para exibir produto na lista
    function ProdutoVendido(produto) {
        const listItem = document.createElement('li');
        listItem.setAttribute('data-codigo', produto.codigoProduto);
        const dataEntrada = moment(produto.dataEntrada, 'YYYY-MM-DD');
        const dataEntradaFormatada = dataEntrada.isValid() ? dataEntrada.format('DD/MM/YYYY') : '';

        listItem.textContent = `Produto: ${produto.nome}, Quantidade: ${produto.quantidade}, Preço: ${produto.preco.toFixed(2)}, Código: ${produto.codigoProduto}; Data de Entrada: ${dataEntradaFormatada}`;
        document.getElementById('product-list').appendChild(listItem);
    }

    // Evento de adicionar produto
    const botao = document.getElementById('addProduct');

    botao.addEventListener('click', (event) => {
        event.preventDefault();
        const nome = document.getElementById('productName').value;
        const preco = parseFloat(document.getElementById('price').value);
        const quantidade = parseInt(document.getElementById('quantity').value);
        const dataEntradaValue = document.getElementById('data_Entrada').value;
        const codigoProduto = parseInt(document.getElementById('codigo_Produto').value);
        const dataEntrada = moment(dataEntradaValue, 'YYYY-MM-DD');

        if (dataEntrada.isValid()) {
            if ( codigoProduto > 0) {
                const produto = {
                    nome,
                    quantidade,
                    preco,
                    dataEntrada: dataEntradaValue,
                    codigoProduto
                };

                ProdutoVendido(produto);
                saveProduct(produto);
                eraserSoft();
                showSpan();
            } else {
                alert('Preencha todos os campos obrigatórios.');
            }
        } else {
            alert('Formato de data inválido.');
        }
    });

    // Evento de deletar produto
    document.getElementById('deleteProduct').addEventListener('click', async (event) => {
        event.preventDefault();
        const codigoProduto = parseInt(document.getElementById('codigo_Produto').value);
        const quantidade = parseInt(document.getElementById('quantity').value);
        const appearSpanDel = document.getElementById("prodDel");

        if (quantidade) {
            try {
                const response = await fetch(`http://localhost:3000/produtos/${codigoProduto}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ quantidade })
                });

                if (!response.ok) {
                    throw new Error(`Erro na solicitação: ${response.status} - ${response.statusText}`);
                }

                removeProductFromLocalStorage(codigoProduto);
                console.log('Produto deletado com sucesso.');
                appearSpanDel.style.display = 'inline';
            } catch (error) {
                console.error('Erro ao deletar produto:', error);
            }
        } else {
            alert('Informe o código do produto para deletar.');
        }
    });


    // Função para calcular o total das vendas
    function calcularTotal() {
        const produtos = getProductsFromLocalStorage();
        let total = 0;

        produtos.forEach(produto => {
            total += produto.preco;
          
        });
        localStorage.setItem('totalVendas', total.toFixed(2));
        displayTotal();
          //appearBag()
    }

    // Função para exibir o total das vendas
    function displayTotal() {
        const total = localStorage.getItem('totalVendas');
        const inputTotal = document.getElementById('total');
        inputTotal.value = total ? parseFloat(total).toFixed(2) : '0.00';
      

    }

    const eraserSoft = function () {
        const nome = document.getElementById('productName');
        const quantidade = document.getElementById('quantity');
        const preco = document.getElementById('price');
        const codigoProduto = document.getElementById('codigo_Produto');
        const dataEntrada = document.getElementById('data_Entrada');

        const elementos = [nome, quantidade, preco, codigoProduto, dataEntrada];

        // Adiciona a classe 'hidden' a todos os elementos
        elementos.forEach(function (elemento) {
            elemento.classList.add('hidden');
        });

        // Espera a transição terminar antes de limpar os valores e remover a classe 'hidden'
        elementos.forEach(function (elemento) {
            elemento.addEventListener('transitionend', function () {
                elemento.value = '';
                elemento.classList.remove('hidden'); // Reseta para futuras transições
            }, { once: true });
        });
    }

    function showSpan() {
        const span = document.getElementById('prodVen');
        // Inicialmente, mostra o span e define a opacidade como 0
        span.style.display = 'inline';
        setTimeout(() => {
            span.classList.add('visible'); // Adiciona a classe para a transição de opacidade
        }, 10); // Pequeno atraso para garantir que a transição ocorra

        // Esconde o span após 3 segundos
        setTimeout(() => {
            span.classList.remove('visible');
            window.location.reload();

            // Esconde o span após a transição de desvanecimento
            span.addEventListener('transitionend', function () {
                span.style.display = 'none';
            }, { once: true });
        }, 2000); // Exibe por 2 segundos
    }

    calcularTotal();
    
   
     
            });
        
        
        
      
    
    
>>>>>>> 3a09742c83726163b3c3382ca49eedd986442bee
