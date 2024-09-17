document.addEventListener("DOMContentLoaded", function() {
    // Função para formatar datas no formato dd/mm/yyyy
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

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
                    <td>${row.preco}</td>
                    <td>${formatDate(row.dataEntrada)}</td>
                    <td>${row.codigoProduto}</td>
                    <td>${formatDate(row.dataValidade)}</td>
                `;
                productList.appendChild(tr);
            });
        })
        .catch(error => console.error('Erro ao buscar produtos:', error));
});
