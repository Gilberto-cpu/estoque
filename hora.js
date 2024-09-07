window.onload = function() {
    // Obtendo a data atual
    var dataAtual = new Date();

    // Formatando a data para YYYY-MM-DD
    var dia = ("0" + dataAtual.getDate()).slice(-2);
    var mes = ("0" + (dataAtual.getMonth() + 1)).slice(-2);
    var ano = dataAtual.getFullYear();

    var dataFormatada = `${dia}/${mes}/${ano}`;
   

    // Definindo o valor do input de data
    document.getElementById('data_Entrada').value = dataFormatada;
   
}
