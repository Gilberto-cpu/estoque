const mysql = require('mysql2');

// Configurações da conexão com o MySQL
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'produtos'
});

// Criação da conexão com o banco de dados
connection.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        createTables();
    }
});

function createTables() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS produtos (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nome VARCHAR(255) ,
            quantidade INT ,
            preco DECIMAL(10, 2) ,
            dataEntrada DATE,
            codigoProduto VARCHAR(255),
            dataValidade DATE 
        )
    `;

    connection.query(createTableQuery, (err, results) => {
        if (err) {
            console.error('Erro ao criar a tabela de produtos:', err.message);
        } else {
            console.log('Tabela de produtos criada com sucesso.');
        }
    });
}

// Exporta a conexão para uso em outras partes do aplicativo
module.exports = connection;
