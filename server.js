const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const arquivo = 'gastos.json';

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use('/static', express.static(path.join(__dirname, 'public')));

// Verifica se o arquivo JSON existe, caso contrário, cria um vazio
if (!fs.existsSync(arquivo)) {
  fs.writeFileSync(arquivo, JSON.stringify([]));
}

// Rota para a página inicial (Home)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Rota para a página de Registro e Acompanhamento
app.get('/registrar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para obter todos os gastos
app.get('/gastos', (req, res) => {
  const dados = fs.readFileSync(arquivo);
  const gastos = JSON.parse(dados);
  res.json(gastos);
});

// Rota para adicionar um novo gasto
app.post('/gastos', (req, res) => {
  const { descricao, valor, parcelas, pagarPara } = req.body;

  if (!descricao || !valor || !parcelas || !pagarPara) {
    return res.status(400).json({ error: 'Preencha todos os campos!' });
  }

  const dados = fs.readFileSync(arquivo);
  const gastos = JSON.parse(dados);
  gastos.push({ descricao, valor, parcelas, pagarPara });
  fs.writeFileSync(arquivo, JSON.stringify(gastos, null, 2));

  res.status(201).json({ message: 'Gasto registrado com sucesso!' });
});

// Rota para pagar uma parcela
app.patch('/gastos/parcelas/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const dados = fs.readFileSync(arquivo);
  const gastos = JSON.parse(dados);

  if (index < 0 || index >= gastos.length || gastos[index].parcelas <= 1) {
    return res
      .status(400)
      .json({ error: 'Gasto inválido ou sem parcelas restantes.' });
  }

  gastos[index].parcelas -= 1;
  fs.writeFileSync(arquivo, JSON.stringify(gastos, null, 2));

  res.status(200).json({ message: 'Parcela paga com sucesso!' });
});

// Rota para excluir um gasto
app.delete('/gastos/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const dados = fs.readFileSync(arquivo);
  const gastos = JSON.parse(dados);

  if (index < 0 || index >= gastos.length) {
    return res.status(404).json({ error: 'Gasto não encontrado.' });
  }

  gastos.splice(index, 1);
  fs.writeFileSync(arquivo, JSON.stringify(gastos, null, 2));

  res.status(200).json({ message: 'Gasto excluído com sucesso!' });
});

// Rota para tratar páginas inexistentes (404)
app.use((req, res) => {
  res.redirect('/');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
