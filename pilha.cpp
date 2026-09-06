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