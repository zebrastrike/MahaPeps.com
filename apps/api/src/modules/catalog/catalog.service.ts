import { Injectable } from '@nestjs/common';

@Injectable()
export class CatalogService {
  create(data: { name: string; description: string }) {
    return { ...data };
  }

  getHealth(): string {
    return 'catalog-ok';
  }
}
