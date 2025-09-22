import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CreatePackagingDto } from './dto/order.dto';

describe('OrderController', () => {
  let controller: OrderController;
  let service: OrderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [OrderService],
    }).compile();

    controller = module.get<OrderController>(OrderController);
    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createOrder', () => {
    it('should process a single order successfully', () => {
      const createPackagingDto: CreatePackagingDto = {
        pedidos: [
          {
            pedido_id: 1,
            produtos: [
              {
                produto_id: 'Produto A',
                dimensoes: { altura: 10, largura: 10, comprimento: 10 },
              },
            ],
          },
        ],
      };

      const expectedResult = {
        pedidos: [
          {
            pedido_id: 1,
            caixas: [
              {
                caixa_id: 'Caixa 1',
                produtos: ['Produto A'],
              },
            ],
          },
        ],
      };

      const serviceSpy = jest
        .spyOn(service, 'processarPedidos')
        .mockReturnValue(expectedResult);

      const result = controller.createOrder(createPackagingDto);

      expect(result).toEqual({
        success: true,
        data: expectedResult,
      });
      expect(serviceSpy).toHaveBeenCalledWith(createPackagingDto);
    });

    it('should process multiple orders successfully', () => {
      const createPackagingDto: CreatePackagingDto = {
        pedidos: [
          {
            pedido_id: 1,
            produtos: [
              {
                produto_id: 'Produto A',
                dimensoes: { altura: 10, largura: 10, comprimento: 10 },
              },
            ],
          },
          {
            pedido_id: 2,
            produtos: [
              {
                produto_id: 'Produto B',
                dimensoes: { altura: 20, largura: 20, comprimento: 20 },
              },
            ],
          },
        ],
      };

      const expectedResult = {
        pedidos: [
          {
            pedido_id: 1,
            caixas: [
              {
                caixa_id: 'Caixa 1',
                produtos: ['Produto A'],
              },
            ],
          },
          {
            pedido_id: 2,
            caixas: [
              {
                caixa_id: 'Caixa 1',
                produtos: ['Produto B'],
              },
            ],
          },
        ],
      };

      const serviceSpy = jest
        .spyOn(service, 'processarPedidos')
        .mockReturnValue(expectedResult);

      const result = controller.createOrder(createPackagingDto);

      expect(result).toEqual({
        success: true,
        data: expectedResult,
      });
      expect(serviceSpy).toHaveBeenCalledWith(createPackagingDto);
    });

    it('should handle order with multiple products', () => {
      const createPackagingDto: CreatePackagingDto = {
        pedidos: [
          {
            pedido_id: 1,
            produtos: [
              {
                produto_id: 'PS5',
                dimensoes: { altura: 40, largura: 10, comprimento: 25 },
              },
              {
                produto_id: 'Volante',
                dimensoes: { altura: 40, largura: 30, comprimento: 30 },
              },
            ],
          },
        ],
      };

      const expectedResult = {
        pedidos: [
          {
            pedido_id: 1,
            caixas: [
              {
                caixa_id: 'Caixa 2',
                produtos: ['PS5', 'Volante'],
              },
            ],
          },
        ],
      };

      const serviceSpy = jest
        .spyOn(service, 'processarPedidos')
        .mockReturnValue(expectedResult);

      const result = controller.createOrder(createPackagingDto);

      expect(result).toEqual({
        success: true,
        data: expectedResult,
      });
      expect(serviceSpy).toHaveBeenCalledWith(createPackagingDto);
    });

    it('should handle products that do not fit in any box', () => {
      const createPackagingDto: CreatePackagingDto = {
        pedidos: [
          {
            pedido_id: 1,
            produtos: [
              {
                produto_id: 'Produto Gigante',
                dimensoes: { altura: 100, largura: 100, comprimento: 100 },
              },
            ],
          },
        ],
      };

      const expectedResult = {
        pedidos: [
          {
            pedido_id: 1,
            caixas: [
              {
                caixa_id: null,
                produtos: ['Produto Gigante'],
                observacao: 'Produto não cabe em nenhuma caixa disponível.',
              },
            ],
          },
        ],
      };

      const serviceSpy = jest
        .spyOn(service, 'processarPedidos')
        .mockReturnValue(expectedResult);

      const result = controller.createOrder(createPackagingDto);

      expect(result).toEqual({
        success: true,
        data: expectedResult,
      });
      expect(serviceSpy).toHaveBeenCalledWith(createPackagingDto);
    });

    it('should call service.processarPedidos with correct parameters', () => {
      const createPackagingDto: CreatePackagingDto = {
        pedidos: [
          {
            pedido_id: 1,
            produtos: [
              {
                produto_id: 'Test',
                dimensoes: { altura: 5, largura: 5, comprimento: 5 },
              },
            ],
          },
        ],
      };

      const serviceSpy = jest
        .spyOn(service, 'processarPedidos')
        .mockReturnValue({
          pedidos: [],
        });

      controller.createOrder(createPackagingDto);

      expect(serviceSpy).toHaveBeenCalledTimes(1);
      expect(serviceSpy).toHaveBeenCalledWith(createPackagingDto);
    });
  });
});
