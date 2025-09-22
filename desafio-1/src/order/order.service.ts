import { Injectable } from '@nestjs/common';
import { CreatePackagingDto, PedidoDto, ProdutoDto } from './dto/order.dto';

type Dimensoes = { altura: number; largura: number; comprimento: number };
type Ponto = { x: number; y: number; z: number };
type CaixaDisponivel = { id: string; dimensoes: Dimensoes; volume: number };

type ProdutoColocado = {
  produto: ProdutoDto;
  dimensoes: Dimensoes;
  posicao: Ponto;
};

type CaixaEmUso = {
  id: string;
  tipoId: string;
  dimensoes: Dimensoes;
  produtos: ProdutoColocado[];
  pontosDeInsercao: Ponto[];
};

type ResultadoCaixa = { caixa_id: string; produtos: string[] };
type ResultadoPedido = {
  pedido_id: number;
  caixas: (
    | ResultadoCaixa
    | { caixa_id: null; produtos: string[]; observacao: string }
  )[];
};

@Injectable()
export class OrderService {
  private readonly CAIXAS: CaixaDisponivel[] = [
    {
      id: 'Caixa 1',
      dimensoes: { altura: 30, largura: 40, comprimento: 80 },
      volume: 96000,
    },
    {
      id: 'Caixa 2',
      dimensoes: { altura: 50, largura: 50, comprimento: 40 },
      volume: 100000,
    },
    {
      id: 'Caixa 3',
      dimensoes: { altura: 50, largura: 80, comprimento: 60 },
      volume: 240000,
    },
  ].sort((a, b) => a.volume - b.volume);

  public processarPedidos(createPackagingDto: CreatePackagingDto): {
    pedidos: ResultadoPedido[];
  } {
    const resultados = createPackagingDto.pedidos.map((pedido) =>
      this._empacotarPedidoFinal(pedido),
    );
    return { pedidos: resultados };
  }

  private _empacotarPedidoFinal(pedido: PedidoDto): ResultadoPedido {
    const { produtosRestantes, produtosImpossiveis } =
      this._filtrarEOrdenarProdutos(pedido);

    const caixasEmUso: CaixaEmUso[] = [];
    let contadorCaixas = 0;

    for (const produto of produtosRestantes) {
      let melhorFitEmCaixaExistente = {
        score: Infinity,
        caixaIndex: -1,
        ponto: null as Ponto | null,
        orientacao: null as Dimensoes | null,
      };

      // Procurar o melhor lugar em caixas existentes
      for (let i = 0; i < caixasEmUso.length; i++) {
        const caixa = caixasEmUso[i];
        for (const ponto of caixa.pontosDeInsercao) {
          for (const orientacao of this._getTodasOrientacoes(
            produto.dimensoes,
          )) {
            if (this._cabeNoPonto(orientacao, ponto, caixa)) {
              // Score baseado na profundidade do ponto (z, y, x)
              const score = ponto.z * 1e9 + ponto.y * 1e6 + ponto.x;
              if (score < melhorFitEmCaixaExistente.score) {
                melhorFitEmCaixaExistente = {
                  score,
                  caixaIndex: i,
                  ponto,
                  orientacao,
                };
              }
            }
          }
        }
      }

      // Se encontrou um bom lugar em uma caixa existente, usa-o.
      if (
        melhorFitEmCaixaExistente.ponto &&
        melhorFitEmCaixaExistente.orientacao
      ) {
        const { caixaIndex, ponto, orientacao } = melhorFitEmCaixaExistente;
        this._colocarProdutoNaCaixa(
          produto,
          caixasEmUso[caixaIndex],
          orientacao,
          ponto,
        );
        continue; // Próximo produto
      }

      // Se não coube em nenhuma caixa existente, encontra a melhor caixa nova para abrir.
      let melhorFitEmCaixaNova = {
        score: Infinity,
        tipoCaixaIndex: -1,
        orientacao: null as Dimensoes | null,
      };

      for (let i = 0; i < this.CAIXAS.length; i++) {
        const tipoCaixa = this.CAIXAS[i];
        for (const orientacao of this._getTodasOrientacoes(produto.dimensoes)) {
          if (
            orientacao.largura <= tipoCaixa.dimensoes.largura &&
            orientacao.altura <= tipoCaixa.dimensoes.altura &&
            orientacao.comprimento <= tipoCaixa.dimensoes.comprimento
          ) {
            const score = tipoCaixa.volume;
            if (score < melhorFitEmCaixaNova.score) {
              melhorFitEmCaixaNova = { score, tipoCaixaIndex: i, orientacao };
            }
          }
        }
      }

      // Abre a melhor caixa nova encontrada
      if (melhorFitEmCaixaNova.orientacao) {
        const tipoCaixa = this.CAIXAS[melhorFitEmCaixaNova.tipoCaixaIndex];
        contadorCaixas++;
        const novaCaixa: CaixaEmUso = {
          id: `${tipoCaixa.id} #${contadorCaixas}`,
          tipoId: tipoCaixa.id,
          dimensoes: tipoCaixa.dimensoes,
          produtos: [],
          pontosDeInsercao: [{ x: 0, y: 0, z: 0 }], // Toda caixa começa com a origem (0,0,0) como ponto de inserção
        };
        caixasEmUso.push(novaCaixa);
        this._colocarProdutoNaCaixa(
          produto,
          novaCaixa,
          melhorFitEmCaixaNova.orientacao,
          { x: 0, y: 0, z: 0 },
        );
      } else {
        produtosImpossiveis.push(produto);
      }
    }

    return this._formatarResultado(
      pedido.pedido_id,
      caixasEmUso,
      produtosImpossiveis,
    );
  }

  private _colocarProdutoNaCaixa(
    produto: ProdutoDto,
    caixa: CaixaEmUso,
    orientacao: Dimensoes,
    ponto: Ponto,
  ): void {
    caixa.produtos.push({ produto, dimensoes: orientacao, posicao: ponto });
    // Remove o ponto que foi usado
    caixa.pontosDeInsercao = caixa.pontosDeInsercao.filter(
      (p) => !(p.x === ponto.x && p.y === ponto.y && p.z === ponto.z),
    );
    // Adiciona 3 novos pontos baseados nos cantos do produto inserido
    caixa.pontosDeInsercao.push(
      { x: ponto.x + orientacao.largura, y: ponto.y, z: ponto.z },
      { x: ponto.x, y: ponto.y + orientacao.altura, z: ponto.z },
      { x: ponto.x, y: ponto.y, z: ponto.z + orientacao.comprimento },
    );
  }

  private _cabeNoPonto(
    orientacao: Dimensoes,
    ponto: Ponto,
    caixa: CaixaEmUso,
  ): boolean {
    // Verifica se ultrapassa os limites da caixa
    if (
      ponto.x + orientacao.largura > caixa.dimensoes.largura ||
      ponto.y + orientacao.altura > caixa.dimensoes.altura ||
      ponto.z + orientacao.comprimento > caixa.dimensoes.comprimento
    ) {
      return false;
    }

    // Verifica se colide com algum produto já existente
    for (const p of caixa.produtos) {
      if (this._checarColisao(p, { orientacao, posicao: ponto })) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checa a colisão entre dois itens alinhados aos eixos (AABB Intersection).
   */
  private _checarColisao(
    p1: ProdutoColocado,
    p2: { orientacao: Dimensoes; posicao: Ponto },
  ): boolean {
    const rect1 = {
      x1: p1.posicao.x,
      y1: p1.posicao.y,
      z1: p1.posicao.z,
      x2: p1.posicao.x + p1.dimensoes.largura,
      y2: p1.posicao.y + p1.dimensoes.altura,
      z2: p1.posicao.z + p1.dimensoes.comprimento,
    };
    const rect2 = {
      x1: p2.posicao.x,
      y1: p2.posicao.y,
      z1: p2.posicao.z,
      x2: p2.posicao.x + p2.orientacao.largura,
      y2: p2.posicao.y + p2.orientacao.altura,
      z2: p2.posicao.z + p2.orientacao.comprimento,
    };
    return (
      rect1.x1 < rect2.x2 &&
      rect1.x2 > rect2.x1 &&
      rect1.y1 < rect2.y2 &&
      rect1.y2 > rect2.y1 &&
      rect1.z1 < rect2.z2 &&
      rect1.z2 > rect2.z1
    );
  }

  private _filtrarEOrdenarProdutos(pedido: PedidoDto) {
    const produtosRestantes: ProdutoDto[] = [];
    const produtosImpossiveis: ProdutoDto[] = [];
    for (const produto of pedido.produtos) {
      const cabeEmAlguma = this.CAIXAS.some((caixa) =>
        this._getOrientacaoQueCabe(produto, caixa.dimensoes),
      );
      if (cabeEmAlguma) {
        produtosRestantes.push(produto);
      } else {
        produtosImpossiveis.push(produto);
      }
    }
    produtosRestantes.sort(
      (a, b) => this._getVolume(b.dimensoes) - this._getVolume(a.dimensoes),
    );
    return { produtosRestantes, produtosImpossiveis };
  }

  private _getOrientacaoQueCabe(
    produto: ProdutoDto,
    dimensoesEspaco: Dimensoes,
  ): Dimensoes | null {
    for (const orientacao of this._getTodasOrientacoes(produto.dimensoes)) {
      if (
        orientacao.altura <= dimensoesEspaco.altura &&
        orientacao.largura <= dimensoesEspaco.largura &&
        orientacao.comprimento <= dimensoesEspaco.comprimento
      ) {
        return orientacao;
      }
    }
    return null;
  }

  private _getTodasOrientacoes(d: Dimensoes): Dimensoes[] {
    return [
      { altura: d.altura, largura: d.largura, comprimento: d.comprimento },
      { altura: d.altura, largura: d.comprimento, comprimento: d.largura },
      { altura: d.largura, largura: d.altura, comprimento: d.comprimento },
      { altura: d.largura, largura: d.comprimento, comprimento: d.altura },
      { altura: d.comprimento, largura: d.altura, comprimento: d.largura },
      { altura: d.comprimento, largura: d.largura, comprimento: d.altura },
    ];
  }

  private _getVolume(dimensoes: Dimensoes): number {
    return dimensoes.altura * dimensoes.largura * dimensoes.comprimento;
  }

  private _formatarResultado(
    pedido_id: number,
    caixasEmUso: CaixaEmUso[],
    produtosImpossiveis: ProdutoDto[],
  ): ResultadoPedido {
    const resultadoFinal: ResultadoPedido = {
      pedido_id,
      caixas: caixasEmUso.map((caixa) => ({
        caixa_id: caixa.tipoId,
        produtos: caixa.produtos.map((p) => p.produto.produto_id),
      })),
    };
    if (produtosImpossiveis.length > 0) {
      resultadoFinal.caixas.push({
        caixa_id: null,
        produtos: produtosImpossiveis.map((p) => p.produto_id),
        observacao: 'Produto não cabe em nenhuma caixa disponível.',
      });
    }
    return resultadoFinal;
  }
}
