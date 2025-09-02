import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { HealthCheckDto } from '../dto/health-check.dto';
import { appConfig } from 'src/config/config';
import { ApiPublic } from 'src/decorators/http.decorators';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @ApiPublic({
    type: HealthCheckDto,
    summary: 'Health check endpoint'
  })
  @Get()
  async healthCheck(): Promise<HealthCheckDto> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: appConfig.server.nodeEnv,
      services: {
        database: 'connected', // You can add actual database health check here
      }
    };
  }
}