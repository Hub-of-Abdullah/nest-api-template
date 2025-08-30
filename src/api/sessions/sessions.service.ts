import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { AuthSession } from "./schema/auth-session.schema";
import { Model } from "mongoose";

@Injectable()
export class SessionsService {
  constructor(
    @InjectModel(AuthSession.name) private model: Model<AuthSession>,
  ) {}

  async createOrReplaceForEmployee(
    employeeCode: string,
    refreshToken: string,
    ttlDays = 7,
    deviceId?: string,
  ) {
    await this.model.deleteMany({ employeeCode }); // single active auth session per employeeCode
    const expiresAt = new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000);
    return this.model.create({
      employeeCode,
      refreshToken,
      expiresAt,
      deviceId,
    });
  }

  async findValid(employeeCode: string, refreshToken: string) {
    return this.model.findOne({
      employeeCode,
      refreshToken,
      expiresAt: { $gt: new Date() },
    });
  }

  async revokeAll(employeeCode: string) {
    return this.model.deleteMany({ employeeCode });
  }
}
