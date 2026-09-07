#include <iostream>
#include <exception>
#include <typeinfo>
#include <stdexcept>
#include <utility>

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
    int* _dados;
    int _capacidade;
    int _topo;

public:
    // Construtor: valida a capacidade e aloca o array dinamicamente.
    explicit Pilha(int capacidade)
        : _dados(nullptr), _capacidade(capacidade), _topo(-1) {
        if (capacidade <= 0) {
            throw std::invalid_argument("Capacidade deve ser um inteiro positivo.");
        }
        _dados = new int[capacidade];
    }

    // Destrutor: libera a memória alocada.
    ~Pilha() {
        delete[] _dados;
    }

    // Construtor de cópia: cópia PROFUNDA (aloca um array novo e copia os dados),
    // em vez da cópia rasa que o compilador geraria por padrão.
    Pilha(const Pilha& outra)
        : _dados(new int[outra._capacidade]), _capacidade(outra._capacidade), _topo(outra._topo) {
        for (int i = 0; i <= _topo; ++i) {
            _dados[i] = outra._dados[i];
        }
    }

    // Operador de atribuição por cópia: mesma ideia, cuidando de auto-atribuição
    // e liberando a memória antiga antes de assumir a nova.
    Pilha& operator=(const Pilha& outra) {
        if (this == &outra) {
            return *this;
        }
        int* novo_dados = new int[outra._capacidade];
        for (int i = 0; i <= outra._topo; ++i) {
            novo_dados[i] = outra._dados[i];
        }
        delete[] _dados;
        _dados = novo_dados;
        _capacidade = outra._capacidade;
        _topo = outra._topo;
        return *this;
    }

    // Construtor de movimento: "rouba" o ponteiro da origem em vez de copiar
    // (mais eficiente quando a pilha de origem é um temporário/não é mais usada).
    Pilha(Pilha&& outra) noexcept
        : _dados(outra._dados), _capacidade(outra._capacidade), _topo(outra._topo) {
        outra._dados = nullptr;
        outra._capacidade = 0;
        outra._topo = -1;
    }

    // Operador de atribuição por movimento.
    Pilha& operator=(Pilha&& outra) noexcept {
        if (this == &outra) {
            return *this;
        }
        delete[] _dados;
        _dados = outra._dados;
        _capacidade = outra._capacidade;
        _topo = outra._topo;
        outra._dados = nullptr;
        outra._capacidade = 0;
        outra._topo = -1;
        return *this;
    }

    bool pilha_esta_vazia() const {
        return _topo == -1;
    }

    bool pilha_esta_cheia() const {
        return _topo == _capacidade - 1;
    }

    int tamanho() const {
        return _topo + 1;
    }

    // Template usado para capturar o tipo original do argumento antes de qualquer
    // conversao implicita. IMPORTANTE: chame sempre SEM especificar <T> manualmente
    // (ex.: empilha(10), nunca empilha<int>(10)) -- especificar <T> a forca permite
    // contornar a checagem de tipo.
    template <typename T>
    void empilha(T dado) {
        if (pilha_esta_cheia()) {
            throw PilhaCheiaErro();
        }
        if (typeid(T) != typeid(int)) {
            throw TipoErro();
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
        std::swap(_dados[_topo], _dados[_topo - 1]);
    }
};

// ==========================================
// TESTE DE EXECUÇÃO
// ==========================================
int main() {
    Pilha minha_pilha(3);
    minha_pilha.empilha(10);
    minha_pilha.empilha(20);

    std::cout << "Tamanho atual: " << minha_pilha.tamanho() << "\n";

    minha_pilha.troca();
    std::cout << "Desempilhando apos troca (esperado 10): " << minha_pilha.desempilha() << "\n";

    try {
        minha_pilha.empilha(3.14); // double -> TipoErro (chamada sem <T> explicito)
    } catch (const TipoErro& e) {
        std::cout << "Excecao capturada: " << e.what() << "\n";
    }

    try {
        Pilha cheia(1);
        cheia.empilha(1);
        cheia.empilha(2); // pilha cheia -> PilhaCheiaErro
    } catch (const PilhaCheiaErro& e) {
        std::cout << "Excecao capturada: " << e.what() << "\n";
    }

    try {
        Pilha capacidade_invalida(-3); // -> std::invalid_argument
    } catch (const std::invalid_argument& e) {
        std::cout << "Excecao capturada (capacidade invalida): " << e.what() << "\n";
    }

    // Agora e seguro copiar: cada Pilha tem seu proprio array internamente.
    Pilha copia = minha_pilha;
    copia.empilha(99);
    std::cout << "Tamanho da copia: " << copia.tamanho()
              << " | Tamanho do original (nao deve mudar): " << minha_pilha.tamanho() << "\n";

    return 0;
}