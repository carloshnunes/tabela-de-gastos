const API_URL = 'http://localhost:3000/gastos';

// Função para registrar um gasto
async function registrarGasto() {
  const descricao = document.getElementById('descricao').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const parcelas = parseInt(document.getElementById('parcelas').value) || 1;
  const pagarPara = document.getElementById('pagarPara').value;

  if (!descricao || isNaN(valor) || !pagarPara || parcelas <= 0) {
    alert('Preencha todos os campos corretamente!');
    return;
  }

  const novoGasto = { descricao, valor, parcelas, pagarPara };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoGasto),
    });

    if (response.ok) {
      alert('Gasto registrado com sucesso!');
      listarGastos();
    } else {
      alert('Erro ao registrar gasto.');
    }
  } catch (error) {
    console.error('Erro ao registrar gasto:', error);
  }
}

// Função para listar os gastos
async function listarGastos() {
  try {
    const response = await fetch(API_URL);
    const gastos = await response.json();

    const tabela = document.getElementById('tabela-gastos');
    tabela.innerHTML = ''; // Limpa a tabela

    gastos.forEach((gasto, index) => {
      const valorTotal = (gasto.valor * gasto.parcelas).toFixed(2);
      const row = tabela.insertRow();
      row.innerHTML = `
        <td>${gasto.descricao}</td>
        <td>R$ ${valorTotal}</td>
        <td>${gasto.parcelas}</td>
        <td>${gasto.pagarPara}</td>
        <td>
          <button onclick="pagarParcela(${index})">Pagar uma Parcela</button>
          <button onclick="excluirGasto(${index})">Excluir</button>
        </td>
      `;
    });
  } catch (error) {
    console.error('Erro ao listar gastos:', error);
  }
}

// Função para pagar uma parcela
async function pagarParcela(index) {
  try {
    const response = await fetch(`${API_URL}/parcelas/${index}`, {
      method: 'PATCH',
    });

    if (response.ok) {
      alert('Parcela paga com sucesso!');
      listarGastos();
    } else {
      alert('Erro ao pagar parcela.');
    }
  } catch (error) {
    console.error('Erro ao pagar parcela:', error);
  }
}

// Função para excluir um gasto
async function excluirGasto(index) {
  try {
    const response = await fetch(`${API_URL}/${index}`, { method: 'DELETE' });

    if (response.ok) {
      alert('Gasto excluído com sucesso!');
      listarGastos();
    } else {
      alert('Erro ao excluir gasto.');
    }
  } catch (error) {
    console.error('Erro ao excluir gasto:', error);
  }
}

// Atualiza a lista ao carregar a página
window.onload = listarGastos;
