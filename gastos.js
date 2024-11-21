const fs = require('fs');

function registrarGasto(descricao, valor, tipo) {
  const arquivo = 'gastos.json';
  let gastos = [];

  // Lê os gastos existentes
  if (fs.existsSync(arquivo)) {
    gastos = JSON.parse(fs.readFileSync(arquivo));
  }

  // Adiciona o novo gasto
  gastos.push({ descricao, valor, tipo });

  // Salva no arquivo
  fs.writeFileSync(arquivo, JSON.stringify(gastos, null, 2));
  console.log('Gasto registrado com sucesso!');
}

function listarGastos() {
  const arquivo = 'gastos.json';

  if (!fs.existsSync(arquivo)) {
    console.log('Nenhum gasto registrado ainda.');
    return;
  }

  const gastos = JSON.parse(fs.readFileSync(arquivo));
  console.log('=== Seus Gastos ===');
  gastos.forEach((gasto, index) => {
    console.log(
      `${index + 1}. ${gasto.descricao} - R$ ${gasto.valor.toFixed(2)} (${
        gasto.tipo
      })`,
    );
  });
}

// Menu interativo
const [, , comando, descricao, valor, tipo] = process.argv;

if (comando === 'registrar') {
  registrarGasto(descricao, parseFloat(valor), tipo);
} else if (comando === 'listar') {
  listarGastos();
} else {
  console.log(
    'Uso: node gastos.js [registrar <descricao> <valor> <tipo>|listar]',
  );
}
