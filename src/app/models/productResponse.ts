import { Product } from "./product";

export interface productResponse {
  total: number;
  items: productDto[];
}

export interface productDto
{
  barCode: string;
  name: string;
  presentation: string;
}
