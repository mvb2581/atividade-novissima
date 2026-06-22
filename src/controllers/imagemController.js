import fs from 'fs';
import path from 'path';

const imagemController = {
    obterImagem: (req, res) => {
        try {
            const { nomeArquivo } = req.params;

            // Sanitizar o nome do arquivo
            const arquivoSeguro = path.basename(nomeArquivo);

            // Caminho relativo
            const caminhoImagem = path.join('uploads', 'images', arquivoSeguro);

            console.log(`Caminho da imagem solicitado: ${caminhoImagem}`);

            // Verifica se o arquivo existe
            if (!fs.existsSync(caminhoImagem)) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: 'Imagem não encontrada'
                });
            }

            // Envia o arquivo usando root
            res.sendFile(arquivoSeguro, {
                root: path.join(process.cwd(), 'uploads', 'images')
            });

        } catch (error) {
            console.error('Erro ao buscar imagem:', error);

            res.status(500).json({
                sucesso: false,
                mensagem: 'Erro ao buscar imagem',
                errorMessage: error.message
            });
        }
    }
};

export default imagemController;