import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckDto {
  @ApiProperty({ example: 'ok' })
  status: string;

  @ApiProperty({ example: '2025-01-15T10:30:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: '1.0.0' })
  version: string;

  @ApiProperty({ example: 'development' })
  environment: string;

  @ApiProperty({ 
    example: { 
      database: 'connected', 
      redis: 'connected' 
    } 
  })
  services?: Record<string, string>;
}