document.addEventListener("DOMContentLoaded", function() {
    fetch('http://localhost:3000/produtos')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                throw new Error("Data is not an array");
            }

            const productList = document.getElementById("product-list");
            data.forEach(row => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>${row.id}</td>
                    <td>${row.nome}</td>
                    <td>${row.quantidade}</td>
                    <td>${row.preco.toFixed(2).replace('.', ',')}</td>
                    <td>${row.dataEntrada}</td>
                    <td>${row.codigoProduto}</td>
                    <td>${row.dataValidade}</td>
                `;
                productList.appendChild(tr);
            });
        })
        .catch(error => console.error('Erro ao buscar produtos:', error));

        
});
