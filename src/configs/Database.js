import mysql from 'mysql2/promise';
import 'dotenv/config';

class Database {
    static #instance = null;
    #pool = null;

    #createPool() {
        this.#pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: Number(process.env.DB_PORT),
            waitForConnections: true,
            connectionLimit: 3400,
            queueLimit: 0,
            ssl: { rejectUnauthorized: false }
        });
    }

    static getInstance() {
        if (!Database.#instance) {
            Database.#instance = new Database();
            Database.#instance.#createPool();
        }
        return Database.#instance;
    }

    getPool() {
        return this.#pool;
    }
}

export const connection = Database.getInstance().getPool();

export async function initializeDatabase() {
    console.log("Inicializando o banco de dados e tabelas...");
    try {
          const tempConnection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: Number(process.env.DB_PORT),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            ssl: { rejectUnauthorized: false }
        });

        const dbName = process.env.DB_DATABASE || 'deploy';

        await tempConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
        await tempConnection.query(`USE \`${dbName}\`;`)

            await tempConnection.query(`CREATE TABLE IF NOT EXISTS clientes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(150) NOT NULL,
                cpf CHAR(11) NOT NULL UNIQUE,
                dataCad DATETIME NULL DEFAULT CURRENT_TIMESTAMP
            );`);
            await tempConnection.query(`CREATE TABLE IF NOT EXISTS categorias (
                Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                Nome VARCHAR(45) NOT NULL,
                Descricao VARCHAR(255) NULL,
                DataCad DATETIME NULL DEFAULT CURRENT_TIMESTAMP

            );`);
                await tempConnection.query(`CREATE TABLE IF NOT EXISTS produtos (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                IdCategoria INT NOT NULL,
                nome VARCHAR(150) NOT NULL,
                Descricao VARCHAR(255) NULL,
                preco DECIMAL(10,2) NOT NULL,
                caminhoImagem VARCHAR(255) NULL,
                QuantidadeEstoque INT NOT NULL DEFAULT 0,
                DataCad DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (IdCategoria) REFERENCES categorias(id)
            );`);

        const [colunas] = await tempConnection.query(`SHOW COLUMNS FROM produtos LIKE 'caminhoImagem'`);
        if (colunas.length === 0) {
            await tempConnection.query(`ALTER TABLE produtos ADD COLUMN caminhoImagem VARCHAR(255) NULL`);
            console.log("Coluna 'caminhoImagem' adicionada à tabela produtos.");
        }

        const [colunaPreco] = await tempConnection.query(`SHOW COLUMNS FROM produtos LIKE 'preco'`);
        if (colunaPreco.length === 0) {
            const [colunaPrecoAntiga] = await tempConnection.query(`SHOW COLUMNS FROM produtos LIKE 'Preco'`);
            if (colunaPrecoAntiga.length > 0) {
                await tempConnection.query(`ALTER TABLE produtos CHANGE Preco preco DECIMAL(10,2) NOT NULL`);
                console.log("Coluna 'Preco' renomeada para 'preco' na tabela produtos.");
            } else {
                await tempConnection.query(`ALTER TABLE produtos ADD COLUMN preco DECIMAL(10,2) NOT NULL DEFAULT 0`);
                console.log("Coluna 'preco' adicionada à tabela produtos.");
            }
        }

            await tempConnection.query(`CREATE TABLE IF NOT EXISTS pedidos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                IdCliente INT NOT NULL,
                ValorTotal DECIMAL(10,2) NOT NULL,
                StatusPedido VARCHAR(45) NULL,
                DataPedido DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (IdCliente) REFERENCES clientes(id)
            );`);

             await tempConnection.query(`CREATE TABLE IF NOT EXISTS itens_pedido (
                id INT AUTO_INCREMENT PRIMARY KEY,
                IdPedido INT NOT NULL,
                IdProduto INT NOT NULL,
                Quantidade INT NOT NULL,
                ValorUnitario DECIMAL(10,2) NOT NULL,
                Subtotal DECIMAL(10,2) GENERATED ALWAYS AS (Quantidade * ValorUnitario) STORED,
                Valor DECIMAL(10,2) NOT NULL,
                FOREIGN KEY (IdPedido) REFERENCES pedidos(id),
                FOREIGN KEY (IdProduto) REFERENCES produtos(id)
            );`);
                    

        await tempConnection.end();
        console.log("Banco de dados e tabelas verificados/criados com sucesso.");
    } catch (error) {
        console.error("Erro ao criar o banco ou as tabelas:", error);
        throw error;
    }
}
