import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogService {
  getHealth(): string {
    return 'catalog-ok';
  }
}
