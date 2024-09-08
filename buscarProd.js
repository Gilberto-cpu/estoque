async function filtrarProdutos() {
    // Obtém o valor do campo de pesquisa e o converte para minúsculas
    let input = document.getElementById('search').value.toLowerCase();

    // Faz uma requisição ao servidor para buscar produtos filtrados
    let response = await fetch(`http://localhost:3000/produtos?search=${encodeURIComponent(input)}`);
    let produtos = await response.json();

    // Seleciona elementos da interface relacionados à lista de produtos e mensagens de estado
    let productList01 = document.getElementById('productList');
    const fechar1 = document.getElementById("fechar");
    const productNao = document.getElementById('prodNao1');

    // Limpa a lista atual de produtos
    productList01.innerHTML = '';

    // Verifica se algum produto contém a string pesquisada
    if (produtos.some(produto => produto.nome.toLowerCase().includes(input))) {
        // Se algum produto for encontrado, ajusta o estilo da página e a visibilidade dos elementos
        document.body.style.overflow = 'auto';
        productList01.removeAttribute('hidden');
        productNao.style.display = 'none';
        fechar1.style.display = 'inline';
    } else {
        // Se nenhum produto for encontrado, ajusta o estilo da página e a visibilidade dos elementos
        document.body.style.overflow = 'hidden';
        productNao.style.display = 'inline';
    }
 
    // Exibe os produtos filtrados
    produtos.forEach(produto => {
        if (produto.nome.toLowerCase().includes(input)) {
            let div = document.createElement('div');
            div.innerHTML = `Produto: <marked>${produto.nome}</marked> - Preço: <marked>${produto.preco}</marked> - Quantidade: <marked>${produto.quantidade}</marked> - Código: <marked>${produto.codigoProduto}</marked> - Validade: <marked>${produto.dataValidade}</marked>`;
            productList01.appendChild(div);
        }
    });
}

// Evento de clique para fechar a lista de produtos
document.getElementById('fechar').addEventListener('click', () => {
    let productList = document.getElementById('productList');
    const fechar1 = document.getElementById("fechar");
    let input = document.getElementById('search');

    // Esconde a lista de produtos e reseta o campo de pesquisa
    productList.setAttribute('hidden', true);
    fechar1.style.display = 'none';
    input.value = '';
    document.body.style.overflow = 'hidden';
});
