import { Controller, Post, Body } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreatePackagingDto } from './dto/order.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('order')
@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({
    summary: 'Criar pedido',
    description: 'Processa um pedido e calcula a embalagem necessária',
  })
  @ApiBody({
    type: CreatePackagingDto,
    examples: {
      example1: {
        summary: 'Exemplo de pedido com PS5 e Volante',
        value: {
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
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Pedido processado com sucesso',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @Post()
  createOrder(@Body() createPackagingDto: CreatePackagingDto) {
    const resultados = this.orderService.processarPedidos(createPackagingDto);
    return { success: true, data: resultados };
  }
}
