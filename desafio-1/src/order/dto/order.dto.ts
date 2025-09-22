// src/packaging/dto/create-packaging.dto.ts

import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';

class DimensoesDto {
  @IsInt()
  altura: number;

  @IsInt()
  largura: number;

  @IsInt()
  comprimento: number;
}

export class ProdutoDto {
  @IsString()
  @IsNotEmpty()
  produto_id: string;

  @IsObject()
  @ValidateNested()
  @Type(() => DimensoesDto)
  dimensoes: DimensoesDto;
}

export class PedidoDto {
  @IsInt()
  pedido_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProdutoDto)
  produtos: ProdutoDto[];
}

export class CreatePackagingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PedidoDto)
  pedidos: PedidoDto[];
}
