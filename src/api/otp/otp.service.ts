import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Otp } from "./schema/otp.schema";
import { Model } from "mongoose";

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private model: Model<Otp>) {}

  async issue(employeeCode: string, token, ttlSeconds = 300) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    await this.model.deleteMany({ employeeCode }); // keep latest only
    await this.model.create({ employeeCode, otp, token, expiresAt });
    return otp;
  }

  async verify(employeeCode: string, otp: string, token: string) {
    const doc = await this.model.findOne({ employeeCode });
    if (!doc) return false;
    if (doc.expiresAt.getTime() < Date.now()) return false;
    if (doc.token !== token) return false;
    return doc.otp === otp;
  }

  async consume(employeeCode: string) {
    await this.model.deleteMany({ employeeCode });
  }

  async verifyOtpToken(employeeCode: string, tempToken: string) {
    const doc = await this.model.findOne({ employeeCode });
    if (!doc) return false;
    return doc.token === tempToken;
  }
}
