import { Injectable } from '@nestjs/common';

@Injectable()
export class OrgsService {
  getHealth(): string {
    return 'orgs-ok';
  }
}
