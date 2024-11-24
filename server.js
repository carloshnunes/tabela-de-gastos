const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const arquivoGastos = 'gastos.json';
const arquivoCategorias = 'categorias.json';

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/static', express.static(path.join(__dirname, 'public')));

// Inicialização dos arquivos JSON
if (!fs.existsSync(arquivoGastos)) {
  fs.writeFileSync(arquivoGastos, JSON.stringify([]));
}
if (!fs.existsSync(arquivoCategorias)) {
  const categoriasIniciais = [
    'Alimentação',
    'Transporte',
    'Lazer',
    'Saúde',
    'Roupas',
    'Estudo',
    'Jogos',
  ];
  fs.writeFileSync(
    arquivoCategorias,
    JSON.stringify(categoriasIniciais, null, 2),
  );
}

// Rota para a página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para obter todos os gastos
app.get('/gastos', (req, res) => {
  const dados = fs.readFileSync(arquivoGastos);
  res.json(JSON.parse(dados));
});

// Rota para obter todas as categorias
app.get('/categorias', (req, res) => {
  const dados = fs.readFileSync(arquivoCategorias);
  res.json(JSON.parse(dados));
});

// Rota para adicionar uma nova categoria
app.post('/categorias', (req, res) => {
  const { novaCategoria } = req.body;

  if (!novaCategoria || typeof novaCategoria !== 'string') {
    return res.status(400).json({ error: 'Nome da categoria inválido.' });
  }

  const categorias = JSON.parse(fs.readFileSync(arquivoCategorias));

  if (categorias.includes(novaCategoria)) {
    return res.status(400).json({ error: 'Categoria já existe.' });
  }

  categorias.push(novaCategoria);
  fs.writeFileSync(arquivoCategorias, JSON.stringify(categorias, null, 2));

  res.status(201).json({ message: 'Categoria adicionada com sucesso!' });
});

// Rota para adicionar um novo gasto
app.post('/gastos', (req, res) => {
  const { descricao, valor, parcelas, pagarPara, tipo, categoria } = req.body;

  if (
    !descricao ||
    !valor ||
    !pagarPara ||
    !categoria ||
    (tipo === 'parcelado' && !parcelas)
  ) {
    return res
      .status(400)
      .json({ error: 'Preencha todos os campos corretamente!' });
  }

  const dados = JSON.parse(fs.readFileSync(arquivoGastos));
  const novoGasto = { descricao, valor, pagarPara, tipo, categoria };

  if (tipo === 'parcelado') novoGasto.parcelas = parcelas;

  dados.push(novoGasto);
  fs.writeFileSync(arquivoGastos, JSON.stringify(dados, null, 2));

  res.status(201).json({ message: 'Gasto registrado com sucesso!' });
});

// Rota para excluir um gasto
app.delete('/gastos/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const dados = JSON.parse(fs.readFileSync(arquivoGastos));

  if (index < 0 || index >= dados.length) {
    return res.status(404).json({ error: 'Gasto não encontrado.' });
  }

  dados.splice(index, 1);
  fs.writeFileSync(arquivoGastos, JSON.stringify(dados, null, 2));

  res.status(200).json({ message: 'Gasto excluído com sucesso!' });
});

// Rota para tratar páginas inexistentes
app.use((req, res) => {
  res.redirect('/');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
