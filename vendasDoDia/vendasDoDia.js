document.addEventListener('DOMContentLoaded', () => {
    // Função para recarregar a página
   
    function reloadPage() {
      window.location.reload();
    }
/*
    // Função que será chamada quando a visibilidade da página mudar
    function handleVisibilityChange() {
        if (!document.hidden) {
            reloadPage(); // Adiciona um pequeno delay para garantir que o check seja visível
        }
    }

   
    // Verifica se a página precisa ser recarregada ao iniciar
    if (document.hidden) {
        reloadPage();
    }
*/
 // Adiciona o evento de mudança de visibilidade do documento
    document.addEventListener('visibilitychange', handleVisibilityChange);

let reloadTimeout;

function handleVisibilityChange() {
    if (!document.hidden) {
        clearTimeout(reloadTimeout);
        reloadTimeout = setTimeout(reloadPage, 500); // 500ms delay
    }
}

    // Inicialização das referências ao modal de quantidade mínima
    const minQuantityModal = document.getElementById('minQuantityModal');
    const closeModalBtn = document.querySelector('#minQuantityModal .close');
    const okButton = document.getElementById('okButton');

    // Função para exibir o modal
    function showMinQuantityModal(message) {
        const messageElement = document.getElementById('minQuantityMessage');
        messageElement.textContent = message;
        minQuantityModal.style.display = 'block';
    }

    // Fecha o modal ao clicar no "X" ou no botão "OK"
    closeModalBtn.onclick = function() {
        minQuantityModal.style.display = 'none';
    };

    okButton.onclick = function() {
        minQuantityModal.style.display = 'none';
    };

    // Fecha o modal ao clicar fora dele
    window.onclick = function(event) {
        if (event.target === minQuantityModal) {
            minQuantityModal.style.display = 'none';
        }
    };

    // Função para verificar se o produto está com a quantidade mínima e mostrar o modal
    function checkMinQuantityBeforeDelete(produto) {
        const minQuantity = 3; // Defina a quantidade mínima que você deseja verificar
        if (produto.quantidade <= minQuantity) {
            const message = `O produto ${produto.nome} está com a quantidade mínima. Quantidade atual: ${produto.quantidade}.`;
            showMinQuantityModal(message);
            return true;
        }
        return false;
    }

    // Função para verificar se a função de verificação foi executada hoje
    function checkMinQuantityOncePerDay() {
        const lastCheckDate = localStorage.getItem('lastCheckDate');
        const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

        if (lastCheckDate !== today) {
            // Atualiza a data da última verificação
            localStorage.setItem('lastCheckDate', today);

            // Executa a verificação
            const produtos = getProductsFromLocalStorage();
            produtos.forEach(produto => {
                checkMinQuantityBeforeDelete(produto);
            });
        }
    }

    // Função para obter produtos do localStorage
    function getProductsFromLocalStorage() {
        const produtos = localStorage.getItem('produtos');
        return produtos ? JSON.parse(produtos) : [];
    }

    // Função para agrupar produtos por dia
    function groupProductsByDay(produtos) {
        if (!Array.isArray(produtos)) {
            console.error('A variável "produtos" não é uma lista válida.');
            return {};
        }

        return produtos.reduce((acc, produto) => {
            if (produto.dataEntrada) {
                const dataEntrada = moment(produto.dataEntrada, 'DD/MM/YYYY', true).format('DD/MM/YYYY');
                if (!acc[dataEntrada]) {
                    acc[dataEntrada] = [];
                }
                acc[dataEntrada].push(produto);
            } else {
                console.warn('Produto não tem dataEntrada:', produto);
            }
            return acc;
        }, {});
    }

    // Função para exibir produtos agrupados por dia
    function displayProductsByDay() {
        const productList = document.getElementById('product-list');
        const message = document.getElementById('message');
        if (!productList || !message) {
            console.error('Elemento(s) com ID(s) não encontrado(s)');
            return;
        }

        productList.innerHTML = ''; // Limpa a lista antes de recriar
        message.style.display = 'none'; // Oculta a mensagem

        const produtos = getProductsFromLocalStorage();
        const produtosPorDia = groupProductsByDay(produtos);

        if (produtos.length === 0) {
            message.style.display = 'block'; // Exibe a mensagem se não houver produtos
            return;
        }

        for (const [dataVenda, produtos] of Object.entries(produtosPorDia)) {
            const dateHeader = document.createElement('h3');
            dateHeader.textContent = `Data de Venda: ${dataVenda}`;
            productList.appendChild(dateHeader);

            produtos.forEach((produto, index) => {
                const li = document.createElement('li');

                const deleteButton = document.createElement('button');
                const trashIcon = document.createElement('img');
                trashIcon.src = 'lixeira (2).png'; // Verifique o caminho do ícone
                trashIcon.alt = 'Delete';
                deleteButton.appendChild(trashIcon);

                deleteButton.addEventListener('click', () => {
                    openDeleteModal(index); // Abre o modal de confirmação
                });

                li.textContent = `NomeProduto: ${produto.nome} - Preço: ${produto.preco} - Quantidade: 1 - CódigoProduto: ${produto.codigoProduto} - Data de Entrada: ${produto.dataEntrada || 'Não disponível'}`;
                li.appendChild(deleteButton);
                productList.appendChild(li);
            });
        }
    }

    // Função para salvar o produto deletado no banco de dados e removê-lo da tabela de produtos
    async function saveDeletedProductToDB(produto) {
        produto.dataVenda = moment().format('DD-MM-YYYY'); // Adiciona a data da venda

        try {
            // Salva o produto na tabela de produtos vendidos
            const response = await fetch(`http://localhost:3000/produtos/vendidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(produto),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Erro ao salvar o produto no banco de dados:', errorText);
                return;
            }

            // Remove o produto da tabela de produtos
            const deleteResponse = await fetch(`http://localhost:3000/produtos/${produto.codigoProduto}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantidade: 1 }) 
            });

            if (!deleteResponse.ok) {
                const errorText = await deleteResponse.text();
                console.error('Erro ao deletar o produto do banco de dados:', errorText);
                return;
            }

            console.log('Produto deletado com sucesso do banco de dados.');
        } catch (error) {
            console.error('Erro ao salvar produto deletado no banco de dados:', error);
            throw error; // Rejeita a Promise para que o erro seja tratado no confirmBtn.onclick
        }
    }

    // Função para deletar produto do localStorage
    function deleteProduct(index) {
        let produtos = getProductsFromLocalStorage();
        const produto = produtos[index];

        if (!produto) {
            console.error('Produto não encontrado ou código do produto ausente.');
            return;
        }

        checkMinQuantityBeforeDelete(produto)

        // Remova um item do localStorage
        produtos.splice(index, 1);
        localStorage.setItem('produtos', JSON.stringify(produtos));

        // Atualize a quantidade do produto no banco de dados após um pequeno delay
        setTimeout(() => {
            saveDeletedProductToDB(produto)
                .then(() => {
                    displayProductsByDay(); // Atualiza a lista de produtos exibida
                    console.log('Produto removido com sucesso do localStorage e quantidade atualizada no banco de dados.');
                })
                .catch((error) => {
                    console.error('Erro ao atualizar quantidade do produto no banco de dados:', error);
                });
        }, 3000);

        console.log('Produto removido com sucesso do localStorage.');
    }

    // Modal de confirmação para deletar produto
    const modal = document.getElementById("confirmationModal");
    const closeBtn = document.querySelector(".close-btn");
    const confirmBtn = document.getElementById("confirmBtn");
    const cancelBtn = document.getElementById("cancelBtn");

    let productToDeleteIndex = null; // Armazena o índice do produto a ser deletado

    // Abre o modal quando o botão "Deletar" é clicado
    function openDeleteModal(index) {
        productToDeleteIndex = index;
        modal.style.display = "block";
    }

    // Fecha o modal ao clicar no "X" ou no botão "Não"
    closeBtn.onclick = function() {
        modal.style.display = "none";
    };

    // Confirma a exclusão do produto
    confirmBtn.onclick = function() {
        deleteProduct(productToDeleteIndex);
        modal.style.display = "none";
    };

    // Cancela a exclusão do produto
    cancelBtn.onclick = function() {
        modal.style.display = "none";
    };

    // Inicializa a página
    checkMinQuantityOncePerDay(); // Verifica a quantidade mínima apenas uma vez por dia
    displayProductsByDay(); // Exibe produtos agrupados por dia
});
