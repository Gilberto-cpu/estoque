const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho para o banco de dados
const dbPath = path.join(__dirname, 'produtos.db');

// Criação da instância do banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        createTables();
    }
});

function createTables() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            preco REAL NOT NULL,
            dataEntrada TEXT NOT NULL,
            codigoProduto INTEGER NOT NULL UNIQUE,
            dataValidade TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Erro ao criar a tabela de produtos:', err.message);
            } else {
                console.log('Tabela de produtos criada com sucesso.');
            }
        });
    });
}

module.exports = db;
