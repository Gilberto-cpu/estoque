const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
const mysql = require('mysql2/promise');
const morgan = require('morgan');
const { adicionarOuAtualizarProduto } = require('./FuncoesBd'); // Importação externa

const app = express();
const PORT = 3000;

// Configuração do banco de dados MySQL
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'produtos'
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('combined'));

// Conexão com o banco de dados
let pool;
(async function initializeDatabase() {
    try {
        pool = mysql.createPool(dbConfig);
        const connection = await pool.getConnection();
        console.log('Conexão com o banco de dados estabelecida com sucesso.');

        // Criar tabelas se não existirem
        await connection.query(`
            CREATE TABLE IF NOT EXISTS produtos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) ,
                quantidade INT ,
                preco DECIMAL(10,2),
                dataEntrada DATE,
                codigoProduto VARCHAR(255),
                dataValidade DATE
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS vendidos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                preco DECIMAL(10, 2) NOT NULL,
                quantidade INT NOT NULL,
                codigoProduto INT NOT NULL UNIQUE,
                dataVenda DATE NULL
            )
        `);

        connection.release();
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error.message);
    }
})();

// Rotas
app.post('/produtos/vendidos', async (req, res) => {
    const { nome, preco, quantidade, codigoProduto, dataVenda } = req.body;

    if (!nome || !preco || !quantidade || !codigoProduto || !dataVenda) {
        return res.status(400).send('Todos os campos são obrigatórios');
    }

    try {
        const connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO vendidos (nome, preco, quantidade, codigoProduto, dataVenda) VALUES (?, ?, ?, ?, ?)',
            [nome, preco, quantidade, codigoProduto, dataVenda]
        );
        connection.release();
        res.status(201).send('Produto inserido com sucesso');
    } catch (err) {
        console.error('Erro ao inserir produto:', err.message);
        res.status(500).send('Erro ao inserir produto');
    }
});

app.get('/produtos', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM produtos');
        connection.release();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao obter produtos do banco de dados.' });
    }
});

app.get('/vendidos', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM vendidos');
        connection.release();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao obter produtos do banco de dados.' });
    }
});



app.get('/produtos/:codigoProduto', async (req, res) => {
    const codigoProduto = parseInt(req.params.codigoProduto);

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT * FROM produtos WHERE codigoProduto = ?', [codigoProduto]);
        connection.release();
        if (rows.length) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Produto não encontrado.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar o produto no banco de dados.' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username e password são obrigatórios.' });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT password FROM users WHERE username = ?', [username]);
        connection.release();

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Usuário não encontrado.' });
        }

        const hash = rows[0].password;
        const result = await bcrypt.compare(password, hash);

        if (result) {
            res.status(200).json({ message: 'Login bem-sucedido!' });
        } else {
            res.status(401).json({ error: 'Senha incorreta.' });
        }
    } catch (err) {
        console.error('Erro ao consultar banco de dados:', err.message);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

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

app.post('/produtos/:codigoProduto', async (req, res) => {
    const codigoProduto = parseInt(req.params.codigoProduto);
    const { nome, quantidade, dataEntrada, dataValidade, preco } = req.body;

    try {
        const connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO produtos (codigoProduto, nome, quantidade, dataEntrada, dataValidade, preco) VALUES (?, ?, ?, ?, ?, ?)',
            [codigoProduto, nome, quantidade, dataEntrada, dataValidade, preco]
        );
        connection.release();
        res.status(201).json({ message: 'Produto adicionado com sucesso.' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao adicionar o produto no banco de dados.' });
    }
});

app.delete('/produtos/:codigoProduto', async (req, res) => {
    const { codigoProduto } = req.params;
    const { quantidade } = req.body;

    if (!quantidade || isNaN(quantidade)) {
        return res.status(400).json({ error: 'Quantidade é obrigatória e deve ser um número.' });
    }

    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.query('SELECT quantidade FROM produtos WHERE codigoProduto = ?', [codigoProduto]);

        if (rows.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        const novaQuantidade = rows[0].quantidade - quantidade;
        if (novaQuantidade < 0) {
            connection.release();
            return res.status(400).json({ error: 'Quantidade insuficiente para deletar.' });
        }

        if (novaQuantidade === 0) {
            await connection.query('DELETE FROM produtos WHERE codigoProduto = ?', [codigoProduto]);
        } else {
            await connection.query('UPDATE produtos SET quantidade = ? WHERE codigoProduto = ?', [novaQuantidade, codigoProduto]);
        }

        connection.release();
        res.json({ message: 'Produto atualizado ou deletado com sucesso.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/vendidos/:codigoProduto', async (req, res) => {
    const codigoProduto = req.params.codigoProduto;

    try {
        // Obtém uma conexão do pool
        const connection = await pool.getConnection();

        try {
            // Consulta SQL para deletar o produto
            const deleteQuery = 'DELETE FROM vendidos WHERE codigoProduto = ?';

            // Executa a consulta
            const [result] = await connection.query(deleteQuery, [codigoProduto]);

            // Libera a conexão de volta para o pool
            connection.release();

            if (result.affectedRows === 0) {
                // Nenhum produto foi deletado (código não encontrado)
                res.status(404).send('Produto não encontrado');
            } else {
                // Produto deletado com sucesso
                res.send(`Produto com código ${codigoProduto} deletado com sucesso.`);
            }
        } catch (queryErr) {
            // Erro ao executar a consulta
            console.error('Erro ao deletar o produto:', queryErr);
            res.status(500).send('Erro ao deletar o produto');
        }
    } catch (connErr) {
        // Erro ao obter a conexão do pool
        console.error('Erro ao obter a conexão:', connErr);
        res.status(500).send('Erro ao conectar com o banco de dados');
    }
});


app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
