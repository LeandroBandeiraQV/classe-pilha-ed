/**
 * Exceção lançada quando se tenta empilhar um dado em uma pilha que já
 * atingiu sua capacidade máxima.
 */
class PilhaCheiaErro extends Error {
  constructor(mensagem = "Não é possível empilhar: a pilha está cheia.") {
    super(mensagem);
    this.name = "PilhaCheiaErro";
  }
}

/**
 * Exceção lançada quando se tenta desempilhar (ou operar sobre) uma pilha
 * que não possui nenhum dado empilhado.
 */
class PilhaVaziaErro extends Error {
  constructor(mensagem = "Não é possível realizar a operação: a pilha está vazia.") {
    super(mensagem);
    this.name = "PilhaVaziaErro";
  }
}

/**
 * Exceção lançada quando o dado fornecido não é compatível com o tipo
 * básico armazenado pela pilha (número inteiro representável em 32 bits).
 */
class TipoErro extends Error {
  constructor(mensagem = "Tipo de dado inválido para esta pilha.") {
    super(mensagem);
    this.name = "TipoErro";
  }
}

/**
 * Pilha (estrutura LIFO) de números inteiros.
 *
 * O armazenamento interno é obrigatoriamente um TypedArray (Int32Array)
 * de tamanho fixo, alocado uma única vez no construtor — nenhum Array
 * nativo ([]) é utilizado para guardar os dados empilhados.
 */
class Pilha {
  #dados;
  #topo;

  /**
   * @param {number} capacidade Tamanho fixo (máximo de elementos) da pilha.
   * @throws {RangeError} Se a capacidade não for um inteiro positivo.
   *   (Usamos RangeError — e não TipoErro — porque TipoErro é reservado,
   *   pelo contrato da classe, para dados inválidos passados a empilha();
   *   um argumento de construtor inválido é um problema de faixa de valor,
   *   equivalente ao ValueError usado na versão Python.)
   */
  constructor(capacidade) {
    if (!Number.isInteger(capacidade) || capacidade <= 0) {
      throw new RangeError(
        "A capacidade da pilha deve ser um número inteiro positivo."
      );
    }

    // Armazenamento interno fixo: Int32Array, nunca um Array nativo.
    this.#dados = new Int32Array(capacidade);

    // -1 indica pilha vazia; #topo é sempre o índice do último dado empilhado.
    this.#topo = -1;
  }

  /**
   * Verifica se um valor é um inteiro representável em um Int32Array
   * (o "tipo básico" armazenado pela pilha). Rejeita float, NaN, Infinity,
   * boolean, string e qualquer valor fora do intervalo de 32 bits com
   * sinal — evitando o wraparound silencioso que o Int32Array faria por
   * conta própria se o valor fosse escrito sem essa checagem.
   * @param {*} dado
   * @returns {boolean}
   */
  #ehInteiroValido(dado) {
    return (
      typeof dado === "number" &&
      Number.isInteger(dado) &&
      dado >= -2147483648 &&
      dado <= 2147483647
    );
  }

  /**
   * Empilha um dado no topo da pilha.
   *
   * A capacidade é checada antes do tipo: se a pilha já estiver cheia,
   * PilhaCheiaErro prevalece mesmo que o dado também seja inválido. Essa
   * ordem foi escolhida para ficar consistente com a versão em Python
   * (a versão em C++ ainda precisa ser alinhada nesse mesmo ponto).
   *
   * @param {number} dado Número inteiro a ser empilhado.
   * @throws {PilhaCheiaErro} Se a pilha já estiver cheia.
   * @throws {TipoErro} Se o dado não for um número inteiro válido (32 bits).
   */
  empilha(dado) {
    if (this.pilhaEstaCheia()) {
      throw new PilhaCheiaErro();
    }

    if (!this.#ehInteiroValido(dado)) {
      throw new TipoErro(
        `O dado "${dado}" não é um número inteiro válido para esta pilha.`
      );
    }

    this.#topo++;
    this.#dados[this.#topo] = dado;
  }

  /**
   * Desempilha o dado do topo da pilha, removendo-o e retornando-o.
   * @returns {number} O dado que estava no topo.
   * @throws {PilhaVaziaErro} Se a pilha estiver vazia.
   */
  desempilha() {
    if (this.pilhaEstaVazia()) {
      throw new PilhaVaziaErro();
    }

    const dado = this.#dados[this.#topo];
    this.#topo--;
    return dado;
  }

  /**
   * @returns {boolean} true se a pilha não possuir nenhum dado empilhado.
   */
  pilhaEstaVazia() {
    return this.#topo === -1;
  }

  /**
   * @returns {boolean} true se a pilha tiver atingido sua capacidade máxima.
   */
  pilhaEstaCheia() {
    return this.#topo === this.#dados.length - 1;
  }

  /**
   * Troca o dado do topo da pilha com o dado imediatamente abaixo dele.
   * Implementada como troca direta (sem pop/push), O(1).
   * @throws {PilhaVaziaErro} Se houver menos de dois dados empilhados.
   */
  troca() {
    if (this.tamanho() < 2) {
      throw new PilhaVaziaErro(
        "Não é possível trocar: a pilha precisa de pelo menos dois dados empilhados."
      );
    }

    const topo = this.#topo;
    const temp = this.#dados[topo];
    this.#dados[topo] = this.#dados[topo - 1];
    this.#dados[topo - 1] = temp;
  }

  /**
   * @returns {number} A quantidade de dados atualmente empilhados.
   */
  tamanho() {
    return this.#topo + 1;
  }
}

module.exports = { Pilha, PilhaCheiaErro, PilhaVaziaErro, TipoErro };
