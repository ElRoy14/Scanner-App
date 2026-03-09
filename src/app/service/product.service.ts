import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Product } from "../models/product";
import { productDto, productResponse } from "../models/productResponse";

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private bussUrl = 'https://migration.tryasp.net/api/v1';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<productResponse> {
    return this.http.get<productResponse>(`${this.bussUrl}/Products`);
  }

  createProduct(product: Product): Observable<Product> {
    console.log('Enviando producto al backend:', product);
    return this.http.post<Product>(`${this.bussUrl}/Products`, product);
  }
}
