import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtWithRefreshAuthGuard extends AuthGuard("jwt-with-refresh") {}
