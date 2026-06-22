import { Produto } from '../models/Produto.js';
import produtoRepository from '../repositories/produtoRepository.js';
import fs from 'fs';
import path from 'path';

const produtoController = {

    criar: async (req, res) => {
        try {
            const { idCategoria, nome, descricao, preco, quantidadeEstoque } = req.body;

            // ✅ caminho correto: só o nome do arquivo
            const imagem = req.file ? req.file.filename : null;

            if (!idCategoria || !nome || !preco) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Preencha todos os campos obrigatórios: idCategoria, nome e preco'
                });
            }

            if (quantidadeEstoque !== undefined && Number(quantidadeEstoque) < 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Quantidade em estoque não pode ser negativa'
                });
            }

            const produto = Produto.criar(
                { idCategoria, nome, descricao, preco, quantidadeEstoque },
                imagem
            );

            const result = await produtoRepository.criar(produto);

            res.status(201).json({
                sucesso: true,
                mensagem: 'Produto criado com sucesso',
                dados: result
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao criar produto',
                errorMessage: error.message
            });
        }
    },

    selecionar: async (req, res) => {
        try {
            const result = await produtoRepository.selecionar();
            res.status(200).json({ sucesso: true, dados: result });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao listar produtos',
                errorMessage: error.message
            });
        }
    },

    selecionarPorId: async (req, res) => {
        try {
            const id = Number(req.params.id);
            const result = await produtoRepository.selecionarPorId(id);

            if (!result) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Produto não encontrado'
                });
            }

            res.status(200).json({ sucesso: true, dados: result });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao buscar produto',
                errorMessage: error.message
            });
        }
    },

    atualizar: async (req, res) => {
        try {
            const id = Number(req.params.id);
            const { idCategoria, nome, descricao, preco, quantidadeEstoque } = req.body;

            // ✅ nova imagem (se veio upload)
            const novaImagem = req.file ? req.file.filename : null;

            if (!id || id <= 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'ID inválido'
                });
            }

            if (quantidadeEstoque !== undefined && Number(quantidadeEstoque) < 0) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: 'Quantidade em estoque não pode ser negativa'
                });
            }

            // 🔎 buscar produto atual
            const produtoAtual = await produtoRepository.selecionarPorId(id);
            const imagemAntiga = produtoAtual ? produtoAtual.caminhoImagem : null;

            // 🧹 apagar imagem antiga se veio nova
            if (novaImagem && imagemAntiga) {
                const caminhoImagemAntiga = path.join(
                    process.cwd(),
                    'uploads',
                    imagemAntiga
                );

                fs.unlink(caminhoImagemAntiga, (err) => {
                    if (err) {
                        console.error('Erro ao apagar imagem antiga:', err);
                    }
                });
            }

            const produto = Produto.editar(
                { idCategoria, nome, descricao, preco, quantidadeEstoque },
                novaImagem,
                id
            );

            const result = await produtoRepository.atualizar(produto);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Produto atualizado com sucesso',
                dados: result
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao atualizar produto',
                errorMessage: error.message
            });
        }
    },

    deletar: async (req, res) => {
        try {
            const id = Number(req.params.id);
            const result = await produtoRepository.deletar(id);

            res.status(200).json({
                sucesso: true,
                mensagem: 'Produto deletado com sucesso',
                dados: result
            });

        } catch (error) {
            console.log(error);
            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao deletar produto',
                errorMessage: error.message
            });
        }
    }
};

export default produtoController;