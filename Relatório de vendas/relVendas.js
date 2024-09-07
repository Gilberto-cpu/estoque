// Função para obter a data atual no formato YYYY-MM-DD
function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Meses começam do 0
    const day = String(today.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
}

// Função para formatar a data recebida ou retornar a data atual se estiver inválida
function formatDate(dateString) {
    console.log('Data recebida:', dateString); // Adicione esta linha para depuração

    if (!dateString) return getCurrentDate(); // Usa a data atual se não houver data

    // Verifica se a data está no formato dd/mm/yyyy
    const parts = dateString.split('/');
    if (parts.length !== 3) return getCurrentDate(); // Usa a data atual se o formato estiver errado

    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    // Verifica se o ano, mês e dia são válidos
    if (!day || !month || !year || isNaN(day) || isNaN(month) || isNaN(year)) {
        return getCurrentDate(); // Usa a data atual se a data for inválida
    }

    // Cria uma nova data no formato YYYY-MM-DD
    const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

    // Verifica se a data criada é válida
    const date = new Date(formattedDate);
    if (isNaN(date.getTime())) return getCurrentDate(); // Usa a data atual se a data for inválida

    return formattedDate;
}

document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/vendidos')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#product-list');
            console.log('Dados recebidos:', data);

            // Função para agrupar produtos por data
            function groupByDate(produtos) {
                return produtos.reduce((acc, produto) => {
                    const dataVenda = formatDate(produto.dataVenda); // Formata a data corretamente
                    console.log(`Produto: ${produto.nome}, Data formatada: ${dataVenda}`); // Verifica a data formatada
                    if (!acc[dataVenda]) {
                        acc[dataVenda] = [];
                    }
                    acc[dataVenda].push(produto);
                    return acc;
                }, {});
            }

            const groupedData = groupByDate(data);
            tableBody.innerHTML = ''; // Limpa a tabela antes de recriar

            // Exibe os produtos agrupados por dia
            for (const [dataVenda, produtos] of Object.entries(groupedData)) {
                const dateHeader = document.createElement('h3');
                dateHeader.textContent = `Data de Venda: ${dataVenda}`;
                tableBody.appendChild(dateHeader);

                produtos.forEach(produto => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${produto.nome}</td>
                        <td>R$ ${produto.preco.toFixed(2).replace('.', ',')}</td>
                        <td>1</td>
                        <td>${produto.codigoProduto}</td>
                        <td>${formatDate(produto.dataVenda)}</td> <!-- Exibe a data formatada -->
                        <td><button class="delete-btn" data-id="${produto.codigoProduto}">🗑️</button></td>
                    `;
                    tableBody.appendChild(row);
                });
            }

            // Atualiza os totais
            const totalQuantity = data.length; // Total de produtos
            const totalValue = data.reduce((sum, produto) => sum + produto.preco, 0);

            document.getElementById('totalQuantity').textContent = `Quantidade Total: ${totalQuantity}`;
            document.getElementById('totalValue').textContent = `Valor Total: R$ ${totalValue.toFixed(2).replace('.', ',')}`;

            // Adiciona o listener de eventos para os botões de deletar
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const produtoId = event.target.getAttribute('data-id');
                    if (confirm('Você realmente deseja excluir este produto?')) {
                        deleteProductFromDB(produtoId)
                            .then(() => {
                                // Remove a linha da tabela
                                event.target.parentElement.parentElement.remove();
                                console.log('Produto removido com sucesso do banco de dados.');
                            })
                            .catch(error => console.error('Erro ao remover produto do banco de dados:', error));
                    }
                });
            });
        })
        .catch(error => console.error('Erro ao buscar produtos deletados:', error));
});

// Função para deletar produto do banco de dados
async function deleteProductFromDB(codigoProduto) {
    try {
        const response = await fetch(`http://localhost:3000/vendidos/${codigoProduto}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // Verifica se a resposta é bem-sucedida
        if (!response.ok) {
            const errorText = await response.text(); // Use text() ao invés de json()
            throw new Error(`Erro ao deletar produto do banco de dados: ${errorText}`);
        }

        // Altere aqui para text() se o servidor não retornar um JSON
        const result = await response.text(); // Use text() aqui também
        console.log('Produto removido com sucesso do banco de dados:', result);
    } catch (error) {
        console.error('Erro ao remover produto do banco de dados:', error);
        throw error; // Rejeita a Promise para que o erro seja tratado no click event
    }
}

