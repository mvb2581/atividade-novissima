import { connection } from '../configs/Database.js';

const produtoRepository = {
    criar: async (produto) => {
        const sql = `INSERT INTO produtos (idCategoria, nome, descricao, preco, caminhoImagem, quantidadeEstoque) VALUES (?, ?, ?, ?, ?, ?)`;
        const values = [produto.idCategoria, produto.nome, produto.descricao, produto.preco, produto.imagem, produto.quantidadeEstoque];
        const [rows] = await connection.execute(sql, values);
        return rows;
        
    },

    selecionar: async () => {
        const sql = `SELECT id, IdCategoria AS idCategoria, nome, Descricao AS descricao, preco, caminhoImagem, QuantidadeEstoque AS quantidadeEstoque, DataCad AS dataCad FROM produtos`;
        const [rows] = await connection.execute(sql);
        return rows;
    },

    selecionarPorId: async (id) => {
        const sql = `SELECT id, IdCategoria AS idCategoria, nome, Descricao AS descricao, preco, caminhoImagem, QuantidadeEstoque AS quantidadeEstoque, DataCad AS dataCad FROM produtos WHERE id = ?`;
        const [rows] = await connection.execute(sql, [id]);
        return rows[0] || null;
    },

    atualizar: async (produto) => {
        const sql = `UPDATE produtos SET idCategoria = ?, nome = ?, descricao = ?, preco = ?, caminhoImagem = ?, quantidadeEstoque = ? WHERE id = ?`;
        const values = [produto.idCategoria, produto.nome, produto.descricao, produto.preco, produto.imagem, produto.quantidadeEstoque, produto.id];
        console.log(values);
        
        const [rows] = await connection.execute(sql, values);
        return rows;
    },

    deletar: async (id) => {
        const sql = `DELETE FROM produtos WHERE id = ?`;
        const [rows] = await connection.execute(sql, [id]);
        return rows;
    }
};

export default produtoRepository;
