import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Connection } from "mongoose";
import { InjectConnection } from "@nestjs/mongoose";
import { DatabaseConnectionGuard } from "../common/guards/database-connection.guard";

@ApiTags("Health")
@Controller("health")
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({ status: 200, description: "Application is healthy" })
  @ApiResponse({ status: 503, description: "Application is unhealthy" })
  async check() {
    const dbStatus =
      this.connection.readyState === 1 ? "connected" : "disconnected";

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: {
        status: dbStatus,
        readyState: this.connection.readyState,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      },
    };
  }

  @Get("ready")
  @UseGuards(DatabaseConnectionGuard)
  @ApiOperation({ summary: "Readiness check endpoint" })
  @ApiResponse({
    status: 200,
    description: "Application is ready to serve requests",
  })
  @ApiResponse({ status: 503, description: "Application is not ready" })
  async ready() {
    return {
      status: "ready",
      timestamp: new Date().toISOString(),
    };
  }
}
