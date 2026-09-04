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
