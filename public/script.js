const API_URL = 'http://localhost:3000/gastos';
const CATEGORIAS_URL = 'http://localhost:3000/categorias';

// Função para registrar um gasto
async function registrarGasto() {
  const descricao = document.getElementById('descricao').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const parcelas = parseInt(document.getElementById('parcelas').value) || null;
  const pagarPara = document.getElementById('pagarPara').value;
  const tipo = document.getElementById('tipo').value;
  const categoria = document.getElementById('categoria').value;

  if (!descricao || isNaN(valor) || !pagarPara || !categoria) {
    alert('Preencha todos os campos corretamente!');
    return;
  }

  const novoGasto = { descricao, valor, pagarPara, tipo, categoria };
  if (tipo === 'parcelado') novoGasto.parcelas = parcelas;

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
      const erro = await response.json();
      alert(erro.error || 'Erro ao registrar gasto.');
    }
  } catch (error) {
    console.error('Erro ao registrar gasto:', error);
  }
}

// Função para carregar categorias
async function carregarCategorias() {
  try {
    const response = await fetch(CATEGORIAS_URL);
    const categorias = await response.json();

    const selectCategoria = document.getElementById('categoria');
    selectCategoria.innerHTML = '';

    categorias.forEach((categoria) => {
      const option = document.createElement('option');
      option.value = categoria;
      option.textContent = categoria;
      selectCategoria.appendChild(option);
    });
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
}

// Função para adicionar nova categoria
async function adicionarCategoria() {
  const novaCategoria = document.getElementById('novaCategoria').value.trim();

  if (!novaCategoria) {
    alert('Digite um nome para a nova categoria.');
    return;
  }

  try {
    const response = await fetch(CATEGORIAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ novaCategoria }),
    });

    if (response.ok) {
      alert('Categoria adicionada com sucesso!');
      carregarCategorias();
      document.getElementById('novaCategoria').value = '';
    } else {
      const erro = await response.json();
      alert(erro.error || 'Erro ao adicionar categoria.');
    }
  } catch (error) {
    console.error('Erro ao adicionar categoria:', error);
  }
}

// Função para listar os gastos
async function listarGastos() {
  try {
    const response = await fetch(API_URL);
    const gastos = await response.json();

    const tabelaParcelados = document
      .getElementById('tabela-gastos-parcelados')
      .querySelector('tbody');
    const tabelaContinuos = document
      .getElementById('tabela-gastos-continuos')
      .querySelector('tbody');
    const totalParcelados = document.getElementById('total-parcelados');
    const totalContinuos = document.getElementById('total-continuos');

    tabelaParcelados.innerHTML = '';
    tabelaContinuos.innerHTML = '';
    let somaParcelados = 0;
    let somaContinuos = 0;

    gastos.forEach((gasto, index) => {
      const valorTotal =
        gasto.tipo === 'parcelado' ? gasto.valor * gasto.parcelas : gasto.valor;
      let rowHTML;

      if (gasto.tipo === 'parcelado') {
        rowHTML = `
          <td>${gasto.descricao}</td>
          <td>R$ ${valorTotal.toFixed(2)}</td>
          <td>${gasto.parcelas}</td>
          <td>${gasto.pagarPara}</td>
          <td>${gasto.categoria}</td>
          <td>
            <button onclick="pagarParcela(${index})">Pagar Parcela</button>
            <button onclick="excluirGasto(${index})">Excluir</button>
          </td>
        `;
        const row = document.createElement('tr');
        row.innerHTML = rowHTML;
        tabelaParcelados.appendChild(row);
        somaParcelados += valorTotal;
      } else if (gasto.tipo === 'contínuo') {
        rowHTML = `
          <td>${gasto.descricao}</td>
          <td>R$ ${valorTotal.toFixed(2)}</td>
          <td>${gasto.pagarPara}</td>
          <td>${gasto.categoria}</td>
          <td>
            <button onclick="excluirGasto(${index})">Excluir</button>
          </td>
        `;
        const row = document.createElement('tr');
        row.innerHTML = rowHTML;
        tabelaContinuos.appendChild(row);
        somaContinuos += valorTotal;
      }
    });

    totalParcelados.textContent = `Total: R$ ${somaParcelados.toFixed(2)}`;
    totalContinuos.textContent = `Total: R$ ${somaContinuos.toFixed(2)}`;
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
      const erro = await response.json();
      alert(erro.error || 'Erro ao pagar parcela.');
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

function toggleParcelasInput() {
  const tipo = document.getElementById('tipo').value;
  const parcelasInput = document.getElementById('parcelas');

  // Habilita ou desabilita o campo de parcelas baseado no tipo
  parcelasInput.disabled = tipo === 'contínuo';

  // Limpa o campo se contínuo for selecionado
  if (tipo === 'contínuo') {
    parcelasInput.value = '';
  }
}

// Certifica-se de que a função seja chamada assim que a página carregar
window.onload = () => {
  carregarCategorias();
  listarGastos();
  toggleParcelasInput(); // Ajusta o estado inicial do campo de parcelas
};
