--------------------------------------------------------------------------------------------------Python---------------------------------------------------------------------------------------------------------------
Comando usado para pedir o código:
'Gere o código de uma classe Pilha em Python. É proibido usar listas nativas []; o armazenamento interno deve ser obrigatoriamente uma instância do módulo array da biblioteca padrão. Implemente as exceções PilhaCheiaErro, PilhaVaziaErro e TipoErro, e garanta que o método empilha(dado)(empilha um dado no topo da pilha. Se a pilha estiver cheia, deve levantar a exceção “PilhaCheiaErro”. Se o dado não for do tipo básico armazenado pela Pilha, deve levantar a exceção “TipoErro”). 
Inclua os métodos:
 desempilha(-> dado : desempilha o dado do topo da pilha, retornando-o. Se a pilha estiver vazia deve levantar a exceção “PilhaVaziaErro”);
pilha_esta_vazia(retorna True se a pilha estiver vazia);
pilha_esta_cheia(retorna True se a pilha estiver cheia);
troca(troca o dado do topo da pilha com o dado imediatamente abaixo) e
tamanho(retorna o número de dados empilhados).'

Código bruto:
import array

# ==========================================
# DEFINIÇÃO DAS EXCEÇÕES PERSONALIZADAS
# ==========================================
class PilhaCheiaErro(Exception):
    """Exceção levantada quando a pilha atinge sua capacidade máxima."""
    pass

class PilhaVaziaErro(Exception):
    """Exceção levantada quando tenta-se desempilhar de uma pilha vazia."""
    pass

class TipoErro(Exception):
    """Exceção levantada quando o dado inserido não corresponde ao tipo da pilha."""
    pass


# ==========================================
# IMPLEMENTAÇÃO DA CLASSE PILHA (TAD)
# ==========================================
class Pilha:
    def __init__(self, tipo_codigo: str, capacidade: int):
        """
        Inicializa a pilha.
        :param tipo_codigo: Código de tipo do módulo array ('i' inteiro, 'f' float, 'u' caractere).
        :param capacidade: Tamanho máximo da pilha.
        """
        self._capacidade = capacidade
        self._tipo_codigo = tipo_codigo
        
        # O armazenamento interno é obrigatoriamente uma instância de array
        self._dados = array.array(tipo_codigo)
        
        # Mapeamento interno para validar o tipo do dado no Python
        if tipo_codigo in ('i', 'l', 'q', 'b', 'h'):
            self._tipo_esperado = int
        elif tipo_codigo in ('f', 'd'):
            self._tipo_esperado = float
        elif tipo_codigo == 'u':
            self._tipo_esperado = str
        else:
            self._tipo_esperado = type(None)

    def pilha_esta_vazia(self) -> bool:
        """Retorna True se a pilha estiver vazia."""
        return len(self._dados) == 0

    def pilha_esta_cheia(self) -> bool:
        """Retorna True se a pilha estiver cheia."""
        return len(self._dados) >= self._capacidade

    def tamanho(self) -> int:
        """Retorna o número de dados empilhados."""
        return len(self._dados)

    def empilha(self, dado):
        """Empilha um dado no topo da pilha."""
        if self.pilha_esta_cheia():
            raise PilhaCheiaErro("Operação falhou: A pilha está cheia.")
        
        if not isinstance(dado, self._tipo_esperado):
            raise TipoErro(f"Operação falhou: Tipo incorreto. A pilha espera dados do tipo {self._tipo_esperado.__name__}.")
        
        self._dados.append(dado)

    def desempilha(self):
        """Desempilha o dado do topo da pilha, retornando-o."""
        if self.pilha_esta_vazia():
            raise PilhaVaziaErro("Operação falhou: A pilha está vazia.")
        
        return self._dados.pop()

    def troca(self):
        """Troca o dado do topo da pilha com o dado imediatamente abaixo."""
        if self.tamanho() < 2:
            raise ValueError("Não há elementos suficientes na pilha para realizar a troca.")
        
        # Remove os dois elementos do topo
        topo = self._dados.pop()
        abaixo = self._dados.pop()
        
        # Reinsere na ordem invertida (o que estava abaixo agora fica no topo)
        self._dados.append(topo)
        self._dados.append(abaixo)


# ==========================================
# TESTE DE EXECUÇÃO
# ==========================================
if __name__ == "__main__":
    # Cria uma pilha de inteiros (código 'i') com capacidade para 3 elementos
    minha_pilha = Pilha('i', 3)

    minha_pilha.empilha(10)
    minha_pilha.empilha(20)
    
    print(f"Tamanho atual: {minha_pilha.tamanho()}") # Retorna 2
    
    # Testando o método troca
    minha_pilha.troca()
    print(f"Desempilhando após troca (esperado 10): {minha_pilha.desempilha()}") 
    
    # Testando as Exceções
    try:
        minha_pilha.empilha(3.14) # Tentando colocar float numa pilha de inteiros
    except TipoErro as e:
        print(e)

Code Review: Erros e ineficiências da IA e Refatoração:
1. A IA usava apenas isinstance(dado, int). Em Python, a classe bool é uma subclasse de int. Se você tentasse empilhar True numa pilha de inteiros, o código bruto aceitaria, tratando como 1.
solução --> adicionar 'and not isinstance(dado, bool)'
2. O módulo array do Python mapeia os dados diretamente para tipos primitivos do C (como unsigned int). Se você tentar colocar um número muito grande num array de bytes ('b'), o Python estoura um OverflowError. A IA não tratava isso.
solução --> envolver o append em um bloco try...except OverflowError e o converter para o TipoErro.
3. A IA fazia dois pop() seguidos de dois append(). Isso consome processamento desnecessário.
solução --> utilizar 'self._dados[-1], self._dados[-2] = self._dados[-2], self._dados[-1])'. Isso inverte os elementos diretamente na memória com complexidade O(1) sem alterar o tamanho do array no processo.
4. Antes aceitava uma string inteira ("texto") quando deveria aceitar apenas um único caractere.
solução --> verificar se len(dado) == 1
5. _MAPA_TIPOS agora cobre todos os typecodes numéricos (com e sem sinal) num único dicionário, então Pilha('I', 2) e afins funcionam.
6. __init__ valida tipo_codigo e capacidade na hora, em vez de deixar a pilha nascer quebrada.

Testes de Estresse(feitos pela IA):
Comando: 'Faz um relatório simples dos testes de estresse executados, demonstrando que o código refatorado supera o código ingênuo gerado inicialmente.'
Resposta: 
| # | Cenário | Original | Revisada |
|---|---|---|---|
| 1 | Typecode sem sinal (`'I'`) aceita um valor válido (`5`) | **FALHOU** — `TipoErro: ... tipo NoneType` (bug: qualquer valor é rejeitado) | **PASSOU** — empilha normalmente |
| 2 | `bool` é rejeitado em pilha de inteiros | **FALHOU** — aceita `True` sem exceção | **PASSOU** — `TipoErro` explícito |
| 3 | String de 2+ caracteres em pilha `'u'` gera erro da própria classe | **FALHOU** — vaza `TypeError` cru do módulo `array` | **PASSOU** — `TipoErro` limpo, antes de tocar o `array` |
| 4 | Valor fora do intervalo (`300` numa pilha `'b'`) gera erro da própria classe | **FALHOU** — vaza `OverflowError` cru do módulo `array` | **PASSOU** — `TipoErro` limpo |
| 5 | Capacidade inválida (`0`) é rejeitada na construção | **FALHOU** — constrói pilha que nasce sempre "cheia", sem aviso | **PASSOU** — `ValueError` claro no `__init__` |
| 6 | `troca()` com menos de 2 elementos usa exceção do próprio contrato da classe | **FALHOU** — levanta `ValueError` genérico (fora do padrão `PilhaCheiaErro`/`PilhaVaziaErro`/`TipoErro`) | **PASSOU** — levanta `PilhaVaziaErro` |
| 7 | Sequência funcional básica (empilha → troca → desempilha) continua correta | PASSOU | PASSOU |
**Placar de correção: Original 1/7 · Revisada 7/7.** O único teste que a versão original passa é o de regressão funcional básica — ou seja, a base do algoritmo já estava certa; os problemas estavam todos nas bordas (tipos, validação, contrato de exceções).

## Teste de carga (desempenho)
600.000 operações no total (300.000 `empilha` + 300.000 `desempilha`) numa pilha de inteiros:
| Versão | Tempo |
|---|---|
| Original | 0,0776 s |
| Revisada | 0,0948 s |
| **Overhead** | **+22,1%** |
## Conclusão
A versão revisada é estritamente superior em corretude: fecha todas as brechas testadas (tipos sem sinal, `bool`, strings multi-caractere, overflow numérico, capacidade inválida, inconsistência de exceções) sem alterar o comportamento correto já existente (teste 7). O custo é um overhead de desempenho de ~22% no teste de carga, decorrente das validações extras (checagem de `bool`, checagem de tamanho para `'u'`, `try/except` em cada `empilha`). Em termos absolutos isso ainda é ínfimo (0,09 s para 600 mil operações), então a troca de ~0,02 s de desempenho por eliminar 6 falhas de robustez é favorável para este caso de uso.

-------------------------------------------------------------------------------------------------- C++ ----------------------------------------------------------------------------------------------------------------
Comando usado para pedir o codigo: 
Gere o código de uma classe Pilha em C++. O armazenamento interno deve ser obrigatoriamente um ponteiro para um array alocado dinamicamente em memória, configurado no construtor. A pilha deve ser focada em um único tipo básico (como int). Crie as exceções personalizadas PilhaCheiaErro, PilhaVaziaErro e TipoErro herdando de std::exception. Inclua os métodos: empilha(dado) que levante exceção se cheia ou de tipo incorreto; desempilha(); pilha_esta_vazia(); pilha_esta_cheia(); troca() para inverter os dois elementos do topo; e tamanho(). Garanta a correta liberação de memória no destrutor.

Código bruto:
#include <iostream>
#include <exception>
#include <typeinfo>

// ==========================================
// EXCEÇÕES PERSONALIZADAS
// ==========================================
class PilhaCheiaErro : public std::exception {
public:
    const char* what() const noexcept override {
        return "Operacao falhou: a pilha esta cheia.";
    }
};

class PilhaVaziaErro : public std::exception {
public:
    const char* what() const noexcept override {
        return "Operacao falhou: a pilha esta vazia.";
    }
};

class TipoErro : public std::exception {
public:
    const char* what() const noexcept override {
        return "Operacao falhou: tipo incorreto para esta pilha.";
    }
};

// ==========================================
// IMPLEMENTAÇÃO DA CLASSE PILHA (C++)
// ==========================================
class Pilha {
private:
    int* _dados;        // Ponteiro para o array em memória
    int _capacidade;
    int _topo;

public:
    // Construtor: Alocação dinâmica na memória primária
    Pilha(int capacidade) {
        _capacidade = capacidade;
        _topo = -1;
        _dados = new int[capacidade]; 
    }

    // Destrutor: Liberação de memória para evitar vazamentos (Memory Leaks)
    ~Pilha() {
        delete[] _dados;
    }

    bool pilha_esta_vazia() {
        return _topo == -1;
    }

    bool pilha_esta_cheia() {
        return _topo == _capacidade - 1;
    }

    int tamanho() {
        return _topo + 1;
    }

    // Template utilizado para capturar o tipo original antes do casting implícito do C++
    template <typename T>
    void empilha(T dado) {
        if (typeid(T) != typeid(int)) {
            throw TipoErro();
        }
        if (pilha_esta_cheia()) {
            throw PilhaCheiaErro();
        }
        _topo++;
        _dados[_topo] = dado;
    }

    int desempilha() {
        if (pilha_esta_vazia()) {
            throw PilhaVaziaErro();
        }
        int dado = _dados[_topo];
        _topo--;
        return dado;
    }

    void troca() {
        if (tamanho() < 2) {
            throw PilhaVaziaErro();
        }
        int topo1 = desempilha();
        int topo2 = desempilha();
        
        // Template força a passar inteiros literais
        empilha<int>(topo1);
        empilha<int>(topo2);
    }
};

// ==========================================
// TESTE DE EXECUÇÃO
// ==========================================
int main() {
    Pilha minha_pilha(3);

    minha_pilha.empilha<int>(10);
    minha_pilha.empilha<int>(20);

    std::cout << "Tamanho atual: " << minha_pilha.tamanho() << "\n";

    minha_pilha.troca();
    std::cout << "Desempilhando apos troca: " << minha_pilha.desempilha() << "\n";

    try {
        minha_pilha.empilha<double>(3.14);
    } catch (const TipoErro& e) {
        std::cout << "Excecao capturada: " << e.what() << "\n";
    }

    return 0;
}

Code Review: Erros e ineficiências da IA e Refatoração:
1. Prevenção de Corrupção de Memória (Regra dos 5): A IA gerou apenas um construtor e um destrutor simples. Se o usuário fizesse uma cópia da pilha (Pilha p2 = p1), o C++ faria uma cópia rasa (shallow copy), fazendo com que ambos os objetos apontassem para o mesmo array na memória física. Ao final da execução, o destrutor tentaria liberar o mesmo bloco de memória duas vezes (double-free), causando o travamento do sistema.
2. Solução (Alocação Dinâmica): Foram implementados construtores de cópia profunda e operadores de semântica de movimento. Isso garante a manipulação segura de ponteiros e alocação dinâmica, criando arrays independentes ou transferindo a posse da memória sem gerar vazamentos.
3. Otimização por Indireção no método troca(): A IA removia e reinseria itens desnecessariamente, o que gerava chamadas de sub-rotinas extras na pilha de execução do sistema.
4. Solução (In-place): A refatoração utilizou std::swap com acesso direto aos índices do ponteiro _dados. Isso modifica os dados originais no local (in-place), eliminando a latência de cópia e resolvendo a inversão com complexidade de tempo constante O(1).
5. Segurança de Tipagem em Templates: O código bruto permitia que o usuário burlasse a checagem de tipos forçando a declaração do template (ex: empilha<int>(3.14) truncaria o float silenciosamente).
6. Solução (Typeid estrito): O uso do template foi restrito internamente, exigindo chamadas implícitas (empilha(3.14)) para que o typeid compare o tipo real do dado passado com o tipo base da pilha, levantando o TipoErro corretamente. 

Testes de estresse(feitos pela IA):
Comando: 'Faz um relatório simples dos testes de estresse executados, demonstrando que o código refatorado por você supera o código ingênuo gerado inicialmente.'
Resposta:
| # | Cenário | Original | Revisada |
|---|---|---|---|
| 1 | Copiar uma pilha (`Pilha p2 = p1;`) não corrompe/derruba o programa | **FALHOU** — `free(): double free detected in tcache 2`, processo aborta (exit code 134). Antes de abortar, `p1.desempilha()` já retorna um valor corrompido (`5` em vez do `20` esperado) | **PASSOU** — exit code 0; `p2` e `p1` são independentes, `p1.desempilha()` retorna `20` corretamente |
| 2 | Capacidade negativa (`-5`) gera erro claro da própria classe | **PARCIAL** — vaza `std::bad_array_new_length` (exceção genérica do C++, fora do vocabulário da classe) | **PASSOU** — `std::invalid_argument("Capacidade deve ser um inteiro positivo.")` |
| 3 | Capacidade zero não deixa a pilha num estado contraditório | **FALHOU** — `pilha_esta_cheia()` e `pilha_esta_vazia()` retornam `true` ao mesmo tempo | **PASSOU** — rejeitada na construção com a mesma exceção do teste 2 |
| 4 | Pilha cheia **e** tipo errado ao mesmo tempo: qual exceção é lançada | `TipoErro` (checa tipo antes de cheia) | `PilhaCheiaErro` (checa cheia antes de tipo) — comportamento alterado por decisão de design (ordem de checagem), não é a correção de um bug |
| 5 | Métodos de consulta (`tamanho()` etc.) chamáveis numa `const Pilha&` | **FALHOU** — nem compila: `error: passing 'const original::Pilha' as 'this' argument discards qualifiers` | **PASSOU** — compila normalmente (métodos marcados `const`) |
| 6 | Sequência funcional básica (`empilha`/`troca`/`desempilha`) permanece correta | PASSOU | PASSOU |
Nos 4 cenários que expõem uma diferença real de robustez (1, 2, 3 e 5), a revisada passa nos 4; a original falha ou tem comportamento parcial nos 4.** O cenário 4 é uma mudança de comportamento intencional (não uma correção), e o 6 confirma que nenhuma lógica correta foi quebrada no processo.

## Desempenho
Medido com `-O2`, três execuções por cenário (para checar variância):
| Cenário | Original | Revisada |
|---|---|---|
| 5.000.000 `empilha` + 5.000.000 `desempilha` | ~23–26 ms | ~21–22 ms |
| 5.000.000 chamadas de `troca()` | ~10,3–10,9 ms | ~10,4–10,9 ms |
No teste de push/pop, a revisada ficou consistentemente um pouco mais rápida (diferença pequena, possivelmente dentro da margem de ruído de medição, mas repetida nas três rodadas). No teste de `troca()`, apesar de termos trocado dois `pop`+`push` por um `std::swap` direto, o `-O2` aparentemente já otimiza os dois padrões para código equivalente — a diferença entre as versões ficou dentro do ruído, sem vencedor claro. Diferente da versão Python (onde a correção custou ~22% de overhead), em C++ a versão revisada não paga preço de desempenho pela robustez extra.

## Conclusão
A versão revisada elimina um bug de corrupção de memória real e reproduzível (double free / use-after-free por cópia rasa), fecha uma lacuna de validação na construção, e melhora a interface (`const`-correctness) — tudo isso sem custo de desempenho mensurável. A original só "ganha" no teste 6 (a lógica de pilha em si já estava certa), que é justamente a base que a revisão preservou intacta.
<br>
<br>
<br>
<br>
<br>
<br>
-------------------------------------------------------------------------------------------------- JavaScript -------------------------------------------------------------------------------------------------------
Comando usado para pedir o código:
'Gere o código de uma classe Pilha em JavaScript. É proibido usar um Array nativo ([]) como armazenamento interno; o armazenamento deve ser obrigatoriamente uma instância de um TypedArray (Int32Array) alocado com tamanho fixo no construtor, representando uma pilha de números inteiros. Implemente as exceções personalizadas PilhaCheiaErro, PilhaVaziaErro e TipoErro, cada uma estendendo a classe Error do JavaScript, e garanta que o método empilha(dado) empilhe um dado no topo da pilha. Se a pilha estiver cheia, deve lançar a exceção "PilhaCheiaErro". Se o dado não for do tipo básico armazenado pela pilha, deve lançar a exceção "TipoErro". Inclua os métodos: desempilha() -> dado (desempilha o dado do topo da pilha, retornando-o; se a pilha estiver vazia, deve lançar a exceção "PilhaVaziaErro"); pilhaEstaVazia() (retorna true se a pilha estiver vazia); pilhaEstaCheia() (retorna true se a pilha estiver cheia); troca() (troca o dado do topo da pilha com o dado imediatamente abaixo) e tamanho() (retorna o número de dados empilhados).'

Código bruto:
class PilhaCheiaErro extends Error {
  constructor(mensagem = "Não é possível empilhar: a pilha está cheia.") {
    super(mensagem);
    this.name = "PilhaCheiaErro";
  }
}

class PilhaVaziaErro extends Error {
  constructor(mensagem = "Não é possível realizar a operação: a pilha está vazia.") {
    super(mensagem);
    this.name = "PilhaVaziaErro";
  }
}

class TipoErro extends Error {
  constructor(mensagem = "Tipo de dado inválido para esta pilha.") {
    super(mensagem);
    this.name = "TipoErro";
  }
}

class Pilha {
  #dados;
  #topo;

  constructor(capacidade) {
    if (!Number.isInteger(capacidade) || capacidade <= 0) {
      throw new TipoErro(
        "A capacidade da pilha deve ser um número inteiro positivo."
      );
    }
    this.#dados = new Int32Array(capacidade);
    this.#topo = -1;
  }

  #ehInteiroValido(dado) {
    return (
      typeof dado === "number" &&
      Number.isInteger(dado) &&
      dado >= -2147483648 &&
      dado <= 2147483647
    );
  }

  empilha(dado) {
    if (!this.#ehInteiroValido(dado)) {
      throw new TipoErro(
        `O dado "${dado}" não é um número inteiro válido para esta pilha.`
      );
    }
    if (this.pilhaEstaCheia()) {
      throw new PilhaCheiaErro();
    }
    this.#topo++;
    this.#dados[this.#topo] = dado;
  }

  desempilha() {
    if (this.pilhaEstaVazia()) {
      throw new PilhaVaziaErro();
    }
    const dado = this.#dados[this.#topo];
    this.#topo--;
    return dado;
  }

  pilhaEstaVazia() {
    return this.#topo === -1;
  }

  pilhaEstaCheia() {
    return this.#topo === this.#dados.length - 1;
  }

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

  tamanho() {
    return this.#topo + 1;
  }
}

module.exports = { Pilha, PilhaCheiaErro, PilhaVaziaErro, TipoErro };

Erros e ineficiências da IA e Refatoração:
1. O construtor lançava TipoErro quando a capacidade era inválida (não-inteira ou <= 0). Pelo contrato da classe, TipoErro é reservado para dados inválidos passados a empilha() — um argumento de construtor fora da faixa aceitável é semanticamente outra coisa, equivalente ao ValueError usado para o mesmo caso na versão Python.
solução --> lançar RangeError (exceção nativa do JavaScript para valor fora do intervalo permitido) no construtor, mantendo TipoErro exclusivo para empilha().
2. empilha() checava o tipo do dado antes de checar se a pilha estava cheia — ordem oposta à da versão em Python, que checa "cheia" primeiro. Isso fazia com que, ao empilhar um dado inválido numa pilha já cheia, a versão em JS lançasse TipoErro enquanto a versão em Python lança PilhaCheiaErro para o mesmo cenário: comportamento inconsistente entre as implementações do grupo.
solução --> inverter a ordem em empilha() para checar pilhaEstaCheia() primeiro, alinhando com a versão em Python. (A versão em C++ segue a mesma ordem do JS bruto e ainda precisa do mesmo ajuste quando for revisada.)

Diferente do que aconteceu nas versões em Python e C++, o código bruto já veio correto em três pontos que normalmente exigiriam correção manual: (a) validou o intervalo de 32 bits com sinal antes de escrever no Int32Array, evitando o wraparound silencioso que o TypedArray faria sozinho com um valor fora da faixa; (b) a checagem `typeof dado === "number"` já rejeita boolean automaticamente, então a armadilha do bool-é-subclasse-de-int encontrada no Python simplesmente não existe em JavaScript; (c) troca() já foi implementada como troca direta O(1) nos dois índices do array, sem os pop/push redundantes que precisaram ser eliminados na versão em C++. Também não há risco de vazamento de memória ou double free nesta implementação, já que o JavaScript usa coletor de lixo automático — o problema de gerenciamento manual de memória identificado na versão em C++ não existe aqui.

Testes de Estresse (script Node.js, pilha_stress_test.js):
| # | Cenário | Resultado |
|---|---|---|
| 1 | Sequência funcional básica (empilha → troca → desempilha) | PASSOU |
| 2 | Float (3.14) rejeitado numa pilha de inteiros | PASSOU — TipoErro |
| 3 | Boolean (true) rejeitado | PASSOU — TipoErro |
| 4 | String numérica ("10") rejeitada | PASSOU — TipoErro |
| 5 | NaN / Infinity rejeitados | PASSOU — TipoErro |
| 6 | Valor fora do intervalo Int32 (2147483648 / -2147483649) rejeitado sem wraparound | PASSOU — TipoErro |
| 7 | Valor no limite exato do Int32 (2147483647) aceito e preservado | PASSOU |
| 8 | Capacidade inválida no construtor (0, -1, 2.5) rejeitada | PASSOU — RangeError |
| 9 | Empilhar além da capacidade | PASSOU — PilhaCheiaErro |
| 10 | Desempilhar pilha vazia | PASSOU — PilhaVaziaErro |
| 11 | troca() com menos de 2 elementos | PASSOU — PilhaVaziaErro |
| 12 | Pilha cheia + dado inválido ao mesmo tempo → PilhaCheiaErro prevalece (ordem corrigida) | PASSOU |
**Placar: 16/16 testes passaram** na versão revisada.

## Teste de carga (desempenho)
600.000 operações no total (300.000 empilha + 300.000 desempilha).

Execução isolada (pilha_stress_test.js, versão revisada): 0,0501 s.

Comparação bruto vs. revisado (carga_comparacao.js, média de 5 execuções cada, para isolar o custo de compilação/JIT do V8):
| Versão | Tempo médio (5 execuções) |
|---|---|
| Bruto | 0,0130 s |
| Revisado | 0,0169 s |
| Diferença | +30,0% (revisado mais lento) |

(A execução isolada acima mede um tempo maior que a média porque é a primeira chamada do processo: o V8 ainda não compilou/otimizou as funções via JIT. A partir da 2ª execução no mesmo processo, como acontece dentro de mediaDe(), esse custo de "aquecimento" desaparece, por isso os números da tabela são mais baixos.)

## Conclusão
Ao contrário do Python e do C++, o código bruto entregue pela IA para JavaScript já veio praticamente correto: a proteção contra overflow do TypedArray, a distinção nativa entre boolean e number, e a implementação O(1) de troca() já estavam presentes sem precisar de correção manual. Os dois ajustes feitos (exceção de capacidade e ordem de checagem em empilha()) são pontuais, não alteram a complexidade de nenhuma operação e não tocam o caminho quente de empilha()/desempilha() — ambas as versões continuam O(1) por operação. Isso é coerente com o resultado medido: a versão revisada rodou 30% mais lenta que a bruta nesta bateria de testes, uma diferença pequena em termos absolutos (17ms contra 13ms para 600 mil operações) e altamente sensível a ruído de medição (aquecimento do JIT, coleta de lixo, carga da máquina no momento do teste) — não a uma mudança real de complexidade algorítmica. Diferente do Python, onde o overhead de +22% foi consequência direta e reproduzível de validações extras adicionadas ao caminho quente do código, aqui nenhuma validação nova foi inserida em empilha()/desempilha(), então não há razão estrutural para esperar uma diferença de desempenho real entre as duas versões.