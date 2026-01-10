import { SetMetadata } from '@nestjs/common';

export const JwtOptional = () => SetMetadata('jwt-optional', true);
