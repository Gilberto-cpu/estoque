document.addEventListener("DOMContentLoaded", function() {
    const botao = document.getElementById('submitButton');
    const nomeInput = document.getElementById('ProductName');
    const precoInput = document.getElementById('price');
    const quantidadeInput = document.getElementById('quantity');
    const dataEntradaInput = document.getElementById('data_Entrada');
    const dataValidadeInput = document.getElementById('data_Validade');
    const codigoProdutoInput = document.getElementById('codigo_Produto');
    const message = document.getElementById('error-message')
    botao.addEventListener('click', async function(event) {
        event.preventDefault();

        // Capturar valores dos inputs
        const nome = nomeInput.value.trim();
        const precoInputValue = parseFloat(precoInput.value.replace(',', '.')) || null;
        const quantidade = parseInt(quantidadeInput.value) || null;
        const dataEntradaValue = dataEntradaInput.value || null;
        const dataValidadeValue = dataValidadeInput.value || null;
        const codigoProduto = parseInt(codigoProdutoInput.value);

        // Verificação de múltiplos envios
        if (botao.disabled) {
            return;
        }

        botao.disabled = true;

        // Verificação das entradas
        if (codigoProduto > 0) {
            try {
                // Verifica se o produto existe
                const checkResponse = await fetch(`http://localhost:3000/produtos/${codigoProduto}`);

                if (checkResponse.ok) {
                    const produtoExiste = await checkResponse.json();

                    // Verifica se o nome é diferente
                    if (nome && nome !== produtoExiste.nome) {
                      setTimeout(()=>{
                        message.display = 'inline'
                        message.style.display = 'none'
                        
                      },5000)
                       

                    }

                    // Atualiza o produto existente
                    const updateResponse = await fetch(`http://localhost:3000/produtos/${codigoProduto}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            nome: nome || produtoExiste.nome, // Mantém o nome atual se não for fornecido
                            quantidade: quantidade,
                            preco: precoInputValue || produtoExiste.preco,
                            dataEntrada: dataEntradaValue || produtoExiste.dataEntrada,
                            dataValidade: dataValidadeValue || produtoExiste.dataValidade
                        })
                    });

                    if (updateResponse.ok) {
                        showToast('Produto atualizado com sucesso!');
                        clearInputs();
                    } else {
                       
                        const text = await updateResponse.text();
                       
                              message.style.display = 'inline'
                     
                     
                       // showError(message)
                        
                       // throw new Error('Código de produto já existente com um nome diferente. Não é permitido atualizar o nome.');
                    }
                } else if (checkResponse.status === 404) {
                    // Insere um novo produto
                    const insertResponse = await fetch(`http://localhost:3000/produtos/${codigoProduto}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            nome,
                            quantidade,
                            preco: precoInputValue,
                            dataEntrada: dataEntradaValue,
                            dataValidade: dataValidadeValue
                        })
                    });

                    if (insertResponse.ok) {
                        showToast('Produto adicionado com sucesso!');
                        clearInputs();
                    } else {
                        const text = await insertResponse.text();
                        throw new Error('Erro na adição: ' + insertResponse.status + ' ' + text);
                    }
                } else {
                    const text = await checkResponse.text();
                    throw new Error('Erro ao verificar o produto: ' + checkResponse.status + ' ' + text);
                }
            } catch (error) {
                showToast('Erro: ' + error.message);
            } finally {
                botao.disabled = false; // Reativa o botão
            }
        } else {
            alert("Preencha todos os campos obrigatórios corretamente.");
            botao.disabled = false; // Reativa o botão
        }
    });

    function showToast(message) {
        var toast = document.getElementById("toast");
        var toastMessage = document.getElementById("toastMessage");
        toastMessage.textContent = message;
        toast.className = "toast show";
        setTimeout(function(){
            toast.className = toast.className.replace("show", "");
        }, 3000); // Exibe o toast por 3 segundos
    }

    function clearInputs() {
        nomeInput.value = '';
        codigoProdutoInput.value = '';
        dataValidadeInput.value = '';
        quantidadeInput.value = '';
        precoInput.value = '';
    }
    setTimeout(()=>{
        showError('Código de produto já existente com um nome diferente. Não é permitido atualizar o nome.');

    },5000)


    function showError(message) {
        const errorMessageDiv = document.getElementById('error-message');
        errorMessageDiv.textContent = message;
        errorMessageDiv.className = 'error-message';
        setTimeout(function() {
            errorMessageDiv.className = 'error-message';
            message.style.display = 'block'
        }, 5000); // Exibe a mensagem por 5 segundos
    }
});
