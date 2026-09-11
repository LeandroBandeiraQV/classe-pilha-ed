const { Pilha, PilhaCheiaErro, PilhaVaziaErro, TipoErro } = require("./pilha.js");

let passou = 0;
let falhou = 0;

function testar(descricao, fn) {
  try {
    fn();
    console.log(`PASSOU - ${descricao}`);
    passou++;
  } catch (e) {
    console.log(`FALHOU - ${descricao} :: ${e.constructor.name}: ${e.message}`);
    falhou++;
  }
}

function esperaErro(fn, ClasseEsperada, descricao) {
  try {
    fn();
    throw new Error(`nenhum erro lançado (esperava ${ClasseEsperada.name})`);
  } catch (e) {
    if (e instanceof ClasseEsperada) {
      console.log(`PASSOU - ${descricao} (lançou ${e.constructor.name})`);
      passou++;
    } else {
      console.log(`FALHOU - ${descricao} :: lançou ${e.constructor.name}, esperava ${ClasseEsperada.name}`);
      falhou++;
    }
  }
}

console.log("=== Testes funcionais e de robustez ===");

testar("Sequência funcional básica (empilha -> troca -> desempilha)", () => {
  const p = new Pilha(3);
  p.empilha(10);
  p.empilha(20);
  if (p.tamanho() !== 2) throw new Error(`tamanho esperado 2, veio ${p.tamanho()}`);
  p.troca();
  const topo = p.desempilha();
  if (topo !== 10) throw new Error(`esperava 10 apos troca, veio ${topo}`);
});

esperaErro(() => new Pilha(3).empilha(3.14), TipoErro, "Float numa pilha de inteiros");
esperaErro(() => new Pilha(3).empilha(true), TipoErro, "Boolean numa pilha de inteiros");
esperaErro(() => new Pilha(3).empilha("10"), TipoErro, "String numérica numa pilha de inteiros");
esperaErro(() => new Pilha(3).empilha(NaN), TipoErro, "NaN numa pilha de inteiros");
esperaErro(() => new Pilha(3).empilha(Infinity), TipoErro, "Infinity numa pilha de inteiros");
esperaErro(() => new Pilha(3).empilha(2147483648), TipoErro, "Valor acima do limite Int32 (sem wraparound)");
esperaErro(() => new Pilha(3).empilha(-2147483649), TipoErro, "Valor abaixo do limite Int32 (sem wraparound)");

testar("Valor no limite exato do Int32 é aceito (2147483647)", () => {
  const p = new Pilha(1);
  p.empilha(2147483647);
  if (p.desempilha() !== 2147483647) throw new Error("valor não preservado corretamente");
});

esperaErro(() => new Pilha(0), RangeError, "Capacidade 0 rejeitada no construtor");
esperaErro(() => new Pilha(-1), RangeError, "Capacidade negativa rejeitada no construtor");
esperaErro(() => new Pilha(2.5), RangeError, "Capacidade não-inteira rejeitada no construtor");

esperaErro(() => {
  const p = new Pilha(1);
  p.empilha(1);
  p.empilha(2);
}, PilhaCheiaErro, "Empilhar além da capacidade");

esperaErro(() => new Pilha(1).desempilha(), PilhaVaziaErro, "Desempilhar pilha vazia");
esperaErro(() => new Pilha(3).troca(), PilhaVaziaErro, "Troca com menos de 2 elementos");

esperaErro(() => {
  const p = new Pilha(1);
  p.empilha(1); // pilha fica cheia
  p.empilha(3.14); // cheia E tipo inválido ao mesmo tempo
}, PilhaCheiaErro, "Pilha cheia prevalece sobre tipo inválido (ordem de checagem)");

console.log(`\nResultado: ${passou} passaram, ${falhou} falharam (${passou + falhou} testes)\n`);

console.log("=== Teste de carga: 300.000 empilha + 300.000 desempilha ===");
const N = 300000;
const pilhaCarga = new Pilha(N);
const inicio = process.hrtime.bigint();
for (let i = 0; i < N; i++) {
  pilhaCarga.empilha(i);
}
for (let i = 0; i < N; i++) {
  pilhaCarga.desempilha();
}
const fim = process.hrtime.bigint();
const segundos = Number(fim - inicio) / 1e9;
console.log(`Tempo total: ${segundos.toFixed(4)} s para ${N * 2} operações`);
