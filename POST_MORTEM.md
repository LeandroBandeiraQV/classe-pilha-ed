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

Erros e ineficiências da IA e Refatoração:
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