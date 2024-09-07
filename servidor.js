const express = require('express');
const router = express.Router();
const { adicionarOuAtualizarProduto } = require('./FuncoesBd');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000; // Porta do servidor

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
const morgan = require('morgan');
app.use(morgan('combined'));
// Caminho para o banco de dados
const dbName = 'produtos.db';
const dbPath = path.join(__dirname, dbName);

// Conexão com o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao abrir o banco de dados:', err.message);
    } else {
        console.log('Conexão com o banco de dados estabelecida com sucesso.');
        // Inicialização das tabelas de produtos e usuários
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

            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            )`, (err) => {
                if (err) {
                    console.error('Erro ao criar a tabela de usuários:', err.message);
                } else {
                    console.log('Tabela de usuários criada com sucesso.');
                }
            });
        });
    }
});

db.run(`
    CREATE TABLE IF NOT EXISTS vendidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        preco REAL NOT NULL,
        quantidade INTEGER NOT NULL,
        codigoProduto TEXT NOT NULL UNIQUE,
        dataVenda TEXT  NULL
    )
`, (err) => {
    if (err) {
        console.error('Erro ao criar a tabela vendidos:', err.message);
    } else {
        console.log('Tabela vendidos criada com sucesso.');
    }
});

// Fecha a conexão com o banco de dados quando o processo terminar
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Erro ao fechar a conexão com o banco de dados:', err.message);
        } else {
            console.log('Conexão com o banco de dados fechada.');
        }
        process.exit(0);
    });
});
// Exemplo de inserção com data

app.post('/produtos/vendidos', (req, res) => {
    const { nome, preco, quantidade, codigoProduto, dataVenda } = req.body;

    if (!nome || !preco || !quantidade || !codigoProduto || !dataVenda) {
        return res.status(400).send('Todos os campos são obrigatórios');
    }

    db.run(`INSERT INTO vendidos (nome, preco, quantidade, codigoProduto, dataVenda) VALUES (?, ?, ?, ?, ?)`, [nome, preco, quantidade, codigoProduto, dataVenda], (err) => {
        if (err) {
            console.error('Erro ao inserir produto:', err.message);
            res.status(500).send('Erro ao inserir produto');
        } else {
            res.status(201).send('Produto inserido com sucesso');
        }
    });
});


// Rotas
app.get('/produtos', (req, res) => {
    db.all('SELECT * FROM produtos', (err, rows) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao obter produtos do banco de dados.' });
        } else {
            res.json(rows);
        }
    });
});

app.get('/produtos/:codigoProduto', (req, res) => {
    const codigoProduto = parseInt(req.params.codigoProduto);

    const query = 'SELECT * FROM produtos WHERE codigoProduto = ?';
    db.get(query, [codigoProduto], (err, row) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao buscar o produto no banco de dados.' });
        } else if (row) {
            res.json(row); // Retorna o produto encontrado
        } else {
            res.status(404).json({ error: 'Produto não encontrado.' });
        }
    });
});

// Endpoint para login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    db.get("SELECT password FROM users WHERE username = ?", [username], (err, row) => {
        if (err) {
            console.error('Erro ao consultar banco de dados:', err.message);
            return res.status(500).json({ error: 'Internal server error.' });
        }

        if (!row) {
            return res.status(401).json({ error: 'User not found.' });
        }

        bcrypt.compare(password, row.password, (err, result) => {
            if (err) {
                console.error('Erro ao comparar senha:', err.message);
                return res.status(500).json({ error: 'Internal server error.' });
            }

            if (result) {
                res.status(200).json({ message: 'Login successful!' });
            } else {
                res.status(401).json({ error: 'Incorrect password.' });
            }
        });
    });
});

// Rota para adicionar um novo produto
app.put('/produtos/:codigoProduto', async (req, res) => {
    try {
        const { nome, quantidade, preco, dataEntrada, dataValidade } = req.body;
        const { codigoProduto } = req.params;

        const result = await adicionarOuAtualizarProduto(codigoProduto, nome, quantidade, dataEntrada, dataValidade, preco);
        res.json({ message: result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/*
app.post('/produtos/:codigoProduto', async (req, res) => {
    const { nome, quantidade, codigoProduto, dataEntrada, dataValidade, preco } = req.body;

    try {
        const message = await adicionarOuAtualizarProduto(nome, quantidade, codigoProduto, dataEntrada, dataValidade, preco);
        res.json({ message });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
*/

app.post('/produtos/:codigoProduto', (req, res) => {
    const codigoProduto = parseInt(req.params.codigoProduto);
    const { nome, quantidade, dataEntrada, dataValidade, preco } = req.body;

    // Definir a query de inserção
    const insertQuery = `
        INSERT INTO produtos (codigoProduto, nome, quantidade, dataEntrada, dataValidade, preco) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Executar a query de inserção
    db.run(insertQuery, [codigoProduto, nome, quantidade, dataEntrada, dataValidade, preco], function (err) {
        if (err) {
            res.status(500).json({ error: 'Erro ao adicionar o produto no banco de dados.' });
        } else {
            res.status(201).json({ message: 'Produto adicionado com sucesso.', id: this.lastID });
        }
    });
});
// Rota para deletar ou atualizar a quantidade de um produto pelo código

app.delete('/produtos/:codigoProduto', (req, res) => {
    const { codigoProduto } = req.params;
    const { quantidade } = req.body;

    if (!quantidade || isNaN(quantidade)) {
        return res.status(400).json({ error: 'Quantidade é obrigatória e deve ser um número.' });
    }

    db.get('SELECT quantidade FROM produtos WHERE codigoProduto = ?', [codigoProduto], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        const novaQuantidade = row.quantidade - quantidade;
        if (novaQuantidade < 0) {
            return res.status(400).json({ error: 'Quantidade insuficiente para remover' });
        } else if (novaQuantidade === 0) {
            db.run('DELETE FROM produtos WHERE codigoProduto = ?', [codigoProduto], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(200).json();
            });
        } else {
            db.run('UPDATE produtos SET quantidade = ? WHERE codigoProduto = ?', [novaQuantidade, codigoProduto], function (err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.status(200).json();
            });
        }
    });
});


app.get('/produtos/:codigoProduto/quantidade', (req, res) => {
    const codigoProduto = parseInt(req.params.codigoProduto);

    db.get('SELECT nome, quantidade FROM produtos WHERE codigoProduto = ?', [codigoProduto], (err, produto) => {
        if (err) {
            console.error('Erro ao obter quantidade do produto do banco de dados:', err);
            return res.status(500).send('Erro ao obter quantidade do produto do banco de dados');
        }

        if (!produto) {
            return res.status(404).send('Produto não encontrado');
        }

        res.json({ nome: produto.nome, quantidade: produto.quantidade });
    });
});
function getProduto(codigoProduto, callback) {
    const query = `SELECT codigoProduto , nome, preco , quantidade,dataValidade,dataEntrada FROM produtos WHERE codigoProduto = ?`;
    db.get(query, [codigoProduto], (err, row) => {
        if (err) {
            callback(err, null);
            return;
        }
        callback(null, row);
    });
}

// Rota para obter produto por código
app.get('/produtos/:codigoProduto', (req, res) => {
    const codigoProduto = req.params.codigoProduto;

    getProduto(codigoProduto, (err, produto) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!produto) {
            res.status(404).json({ message: 'Produto não encontrado' });
            return;
        }
        res.json(produto);
    });
});




app.delete('/produtos/:codigoProduto', (req, res) => {
    const codigoProduto = req.params.codigoProduto;
    const quantidade = parseInt(req.body.quantidade);

    if (isNaN(quantidade) || quantidade <= 0) {
        return res.status(400).json({ message: 'Quantidade inválida' });
    }

    // Primeiro, obter o produto atual para verificar a quantidade
    const querySelect = `SELECT quantidade FROM produtos WHERE codigoProduto = ?`;
    db.get(querySelect, [codigoProduto], (err, produto) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao obter o produto do banco de dados' });
        }

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        // Verificar se a quantidade a ser removida é maior ou igual à quantidade atual
        if (produto.quantidade <= quantidade) {
            // Se for igual ou maior, deletar o produto completamente
            const queryDelete = `DELETE FROM produtos WHERE codigoProduto = ?`;
            db.run(queryDelete, [codigoProduto], function (err) {
                if (err) {
                    return res.status(500).json({ message: 'Erro ao deletar o produto do banco de dados' });
                }
                res.json();
            });
        } else {
            // Caso contrário, apenas diminuir a quantidade
            const queryUpdate = `UPDATE produtos SET quantidade = quantidade - ? WHERE codigoProduto = ?`;
            db.run(queryUpdate, [quantidade, codigoProduto], function (err) {
                if (err) {
                    return res.status(500).json({ message: 'Erro ao atualizar a quantidade do produto' });
                }
                res.json();
            });
        }
    });
});

// Rota para buscar todos os produtos vendidos
app.get('/vendidos', async (req, res) => {
    const query = `
        SELECT nome, preco, quantidade, codigoProduto, dataVenda 
        FROM vendidos
        ORDER BY dataVenda DESC
    `;

    try {
        const rows = await new Promise((resolve, reject) => {
            db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });

        // Log the rows to inspect the output
        console.log('Rows returned from query:', rows);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/vendidos/:codigoProduto', (req, res) => {
    const codigoProduto = req.params.codigoProduto;
    db.run('DELETE FROM vendidos WHERE codigoProduto = ?', [codigoProduto], function(err) {
        if (err) {
            console.error('Erro ao deletar produto:', err.message);
            return res.status(500).json({ error: 'Erro ao deletar produto' }); // Retorna JSON em caso de erro
        }
        if (this.changes === 0) {
            return res.status(404).json({ message: 'Produto não encontrado' }); // Retorna um JSON 404
        }
        return res.status(200).json({ message: 'Produto deletado com sucesso' }); // Retorna um JSON de sucesso
    });
});


// Inicia o servidor










// Middleware para rotas de produtos
app.use('/produtos', router); // Usando o router para rotas de produtos

// Middleware para rotas não encontradas
app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada.' });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor Express iniciado na porta ${PORT}`);
}).on('error', (err) => {
    console.error('Erro ao iniciar o servidor:', err.message);
});
