import array

# ==========================================
# EXCEÇÕES PERSONALIZADAS
# ==========================================
class PilhaCheiaErro(Exception):
    """Exceção levantada quando a pilha atinge sua capacidade máxima."""
    pass


class PilhaVaziaErro(Exception):
    """Exceção levantada quando se tenta desempilhar, ou trocar com menos
    de 2 elementos, em uma pilha vazia/insuficiente."""
    pass


class TipoErro(Exception):
    """Exceção levantada quando o dado inserido não corresponde ao tipo da pilha."""
    pass


# ==========================================
# IMPLEMENTAÇÃO DA CLASSE PILHA (TAD)
# ==========================================
class Pilha:
    """Pilha (TAD) cujo armazenamento interno é obrigatoriamente um array.array."""

    # Mapeia cada código de tipo do módulo array para o tipo Python correspondente.
    # Cobre todos os typecodes numéricos (com e sem sinal) e o typecode de caractere.
    _MAPA_TIPOS = {
        **{codigo: int for codigo in "bBhHiIlLqQ"},
        **{codigo: float for codigo in "fd"},
        'u': str,
    }

    def __init__(self, tipo_codigo: str, capacidade: int):
        """
        Inicializa a pilha.
        :param tipo_codigo: Código de tipo do módulo array (ex.: 'i' inteiro, 'f' float, 'u' caractere).
        :param capacidade: Tamanho máximo da pilha (deve ser um inteiro positivo).
        :raises ValueError: se tipo_codigo não for suportado ou capacidade não for positiva.
        """
        if tipo_codigo not in self._MAPA_TIPOS:
            raise ValueError(f"Código de tipo '{tipo_codigo}' não suportado pela Pilha.")
        if capacidade <= 0:
            raise ValueError("A capacidade deve ser um inteiro positivo.")

        self._capacidade = capacidade
        self._tipo_codigo = tipo_codigo
        self._tipo_esperado = self._MAPA_TIPOS[tipo_codigo]

        # Armazenamento interno obrigatoriamente via array
        self._dados = array.array(tipo_codigo)

    def pilha_esta_vazia(self) -> bool:
        """Retorna True se a pilha estiver vazia."""
        return len(self._dados) == 0

    def pilha_esta_cheia(self) -> bool:
        """Retorna True se a pilha estiver cheia."""
        return len(self._dados) >= self._capacidade

    def tamanho(self) -> int:
        """Retorna o número de dados empilhados."""
        return len(self._dados)

    def _tipo_valido(self, dado) -> bool:
        """Verifica se `dado` é compatível com o tipo desta pilha."""
        if self._tipo_esperado is int:
            # bool é subclasse de int em Python; excluímos explicitamente.
            return isinstance(dado, int) and not isinstance(dado, bool)
        if self._tipo_codigo == 'u':
            # 'u' exige um único caractere, não uma string qualquer.
            return isinstance(dado, str) and len(dado) == 1
        return isinstance(dado, self._tipo_esperado)

    def empilha(self, dado) -> None:
        """
        Empilha um dado no topo da pilha.
        :raises PilhaCheiaErro: se a pilha estiver cheia.
        :raises TipoErro: se o dado não for do tipo armazenado pela pilha.
        """
        if self.pilha_esta_cheia():
            raise PilhaCheiaErro("Operação falhou: a pilha está cheia.")

        if not self._tipo_valido(dado):
            raise TipoErro(
                f"Operação falhou: tipo incorreto. A pilha espera dados do tipo "
                f"{self._tipo_esperado.__name__} (código '{self._tipo_codigo}')."
            )

        try:
            self._dados.append(dado)
        except OverflowError as e:
            raise TipoErro(
                f"Operação falhou: valor fora do intervalo suportado pelo tipo '{self._tipo_codigo}'."
            ) from e

    def desempilha(self):
        """
        Desempilha o dado do topo da pilha, retornando-o.
        :raises PilhaVaziaErro: se a pilha estiver vazia.
        """
        if self.pilha_esta_vazia():
            raise PilhaVaziaErro("Operação falhou: a pilha está vazia.")
        return self._dados.pop()

    def troca(self) -> None:
        """
        Troca o dado do topo da pilha com o dado imediatamente abaixo.
        :raises PilhaVaziaErro: se houver menos de 2 elementos na pilha.
        """
        if self.tamanho() < 2:
            raise PilhaVaziaErro(
                "Operação falhou: são necessários ao menos 2 elementos para trocar."
            )
        self._dados[-1], self._dados[-2] = self._dados[-2], self._dados[-1]


# ==========================================
# TESTE DE EXECUÇÃO
# ==========================================
if __name__ == "__main__":
    minha_pilha = Pilha('i', 3)
    minha_pilha.empilha(10)
    minha_pilha.empilha(20)

    print(f"Tamanho atual: {minha_pilha.tamanho()}")  # 2

    minha_pilha.troca()
    print(f"Desempilhando após troca (esperado 10): {minha_pilha.desempilha()}")

    try:
        minha_pilha.empilha(3.14)  # float numa pilha de inteiros
    except TipoErro as e:
        print(e)

    try:
        minha_pilha.empilha(True)  # bool numa pilha de inteiros -> agora barrado
    except TipoErro as e:
        print(e)

    # Antes, um typecode sem sinal (ex.: 'I') quebrava a pilha silenciosamente.
    pilha_unsigned = Pilha('I', 2)
    pilha_unsigned.empilha(5)
    print(f"Pilha unsigned funcionando: {pilha_unsigned.desempilha()}")

    try:
        pilha_caracteres = Pilha('u', 2)
        pilha_caracteres.empilha("ab")  # string com mais de 1 caractere -> deve falhar
    except TipoErro as e:
        print(e)