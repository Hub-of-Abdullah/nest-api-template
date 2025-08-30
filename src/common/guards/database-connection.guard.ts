import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Connection } from "mongoose";
import { InjectConnection } from "@nestjs/mongoose";

@Injectable()
export class DatabaseConnectionGuard implements CanActivate {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async canActivate(_context: ExecutionContext): Promise<boolean> {
    const readyState = this.connection.readyState;

    // MongoDB ready states: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    if (readyState !== 1) {
      throw new ServiceUnavailableException(
        "Database connection is not available",
      );
    }

    return true;
  }
}
