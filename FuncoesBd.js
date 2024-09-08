const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

// Caminho para o banco de dados
const dbName = 'produtos.db';
const dbPath = path.join(__dirname, dbName);

// Conexão com o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        // Inicialização da tabela de produtos
        db.run(`CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            quantidade INTEGER NOT NULL,
            preco REAL NOT NULL,
            dataEntrada TEXT NOT NULL,
            codigoProduto INTEGER NOT NULL,
            dataValidade TEXT NOT NULL
        )`, (err) => {
            if (err) {
                console.error('Erro ao criar a tabela de produtos:', err.message);
            } else {
                console.log('Tabela de produtos criada com sucesso.');
            }
        });

        // Inicialização da tabela de usuários
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`, (err) => {
            if (err) {
                console.error('Erro ao criar a tabela de usuários:', err.message);
            } else {
                console.log('Tabela de usuários criada com sucesso.');
            }
        });
    }
});

// Promisify db operations
function runAsync(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve(this);
            }
        });
    });
}

function getAsync(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function allAsync(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

async function adicionarOuAtualizarProduto(codigoProduto, nome, quantidade, dataEntrada, dataValidade, preco) {
    if (!codigoProduto) {
        throw new Error('O código do produto é obrigatório.');
    }

    // Converter campos vazios para null
    nome = nome !== '' ? nome : null;
    quantidade = quantidade !== '' ? quantidade : null;
    dataEntrada = dataEntrada !== '' ? dataEntrada : null;
    dataValidade = dataValidade !== '' ? dataValidade : null;
    preco = preco !== '' ? preco : null;

    return new Promise((resolve, reject) => {
        const selectQuery = 'SELECT * FROM produtos WHERE codigoProduto = ?';

        db.get(selectQuery, [codigoProduto], (err, row) => {
            if (err) {
                return reject(new Error('Erro ao verificar o produto no banco de dados.'));
            }
            if (row) {
                // Produto existe, verifica se o nome é o mesmo
                if (nome !== null && nome !== row.nome) {
                    return reject(new Error('Código de produto já existente com um nome diferente. Não é permitido atualizar o nome.'));
                }
            }
            if (row) {
                // Atualizar os campos fornecidos e somar a quantidade
                const updatedQuantidade = quantidade !== null ? quantidade + row.quantidade : row.quantidade;
                const updateQuery = `
                    UPDATE produtos 
                    SET 
                        nome = COALESCE(?, nome), 
                        quantidade = ?, 
                        dataEntrada = COALESCE(?, dataEntrada), 
                        dataValidade = COALESCE(?, dataValidade), 
                        preco = COALESCE(?, preco)
                    WHERE codigoProduto = ?
                `;
                db.run(updateQuery, [nome, updatedQuantidade, dataEntrada, dataValidade, preco, codigoProduto], function (err) {
                    if (err) {
                        return reject(new Error('Erro ao atualizar o produto no banco de dados.'));
                    }
                    resolve('Produto atualizado com sucesso.');
                });
            } else {
                // Produto não existe, inserir um novo registro
                db.run(insertQuery, [codigoProduto, nome, quantidade, dataEntrada, dataValidade, preco], function (err) {
                    if (err) {
                        console.error('Erro SQL:', err.message);
                        return reject(new Error('Erro ao adicionar o produto no banco de dados.'));
                    }
                    resolve('Produto adicionado com sucesso.');
                });
                
            }
        });
    });
}

async function deleteProductFromDb(codigoProduto, quantidade) {
    try {
        const row = await getAsync('SELECT quantidade FROM produtos WHERE codigoProduto = ?', [codigoProduto]);

        if (!row) {
            console.error(`Produto não encontrado: codigoProduto=${codigoProduto}`);
            throw new Error('Produto não encontrado.');
        }
        if (row.quantidade < quantidade) {
            console.error(`Quantidade insuficiente: codigoProduto=${codigoProduto}, quantidade=${quantidade}`);
            throw new Error('Quantidade insuficiente.');
        }
        if (row.quantidade === quantidade) {
            await runAsync('DELETE FROM produtos WHERE codigoProduto = ?', [codigoProduto]);
            console.log(`Produto deletado com sucesso: codigoProduto=${codigoProduto}`);
        } else {
            await runAsync('UPDATE produtos SET quantidade = quantidade - ? WHERE codigoProduto = ?', [quantidade, codigoProduto]);
            console.log(`Produto atualizado com sucesso: codigoProduto=${codigoProduto}, novaQuantidade=${row.quantidade - quantidade}`);
        }
        return { message: 'Operação realizada com sucesso.', codigoProduto, quantidade };
    } catch (err) {
        console.error(`Erro ao deletar produto: codigoProduto=${codigoProduto}, quantidade=${quantidade}, error=${err.message}`);
        throw err;
    }
}



// Função para obter todos os produtos do banco de dados
async function getAllProducts() {
    try {
        const rows = await allAsync('SELECT * FROM produtos');
        return rows;
    } catch (err) {
        console.error('Erro ao obter produtos:', err.message);
        throw err;
    }
}

// Função para adicionar ou atualizar usuário
async function adicionarUsuario(username, password) {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const existingUser = await getAsync('SELECT id FROM users WHERE username = ?', [username]);

        if (existingUser) {
            await runAsync('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, username]);
            console.log(`Senha do usuário ${username} atualizada.`);
        } else {
            await runAsync('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
            console.log(`Usuário ${username} adicionado com sucesso.`);
        }
    } catch (err) {
        console.error('Erro ao adicionar/atualizar usuário:', err.message);
    }
}

// Função para fechar o banco de dados
function closeDb() {
    db.close((err) => {
        if (err) {
            console.error('Erro ao fechar o banco de dados:', err.message);
        } else {
            console.log('Banco de dados fechado com sucesso.');
        }
    });
}

// Exporta as funções para serem utilizadas em outros módulos
module.exports = {
    deleteProductFromDb,
    getAllProducts,
    closeDb,
    adicionarUsuario,
    adicionarOuAtualizarProduto
};
