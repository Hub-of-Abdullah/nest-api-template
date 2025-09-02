import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Otp } from "./schema/otp.schema";
import { Model } from "mongoose";
import { hash, compare } from "bcryptjs";

@Injectable()
export class OtpService {
  constructor(@InjectModel(Otp.name) private otpModel: Model<Otp>) {}

  async issue(employeeCode: string, token: string, ttlSeconds = 300) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    const hashedToken = await hash(token, 10); // hash token
    await this.otpModel.deleteMany({ employeeCode });
    await this.otpModel.create({
      employeeCode,
      otp,
      token: hashedToken,
      expiresAt,
    });
    return otp;
  }

  async verifyOtp(employeeCode: string, otp: string, token: string) {
    const doc = await this.otpModel.findOne({ employeeCode });
    if (!doc) return false;
    if (doc.expiresAt.getTime() < Date.now()) return false;
    const compared = await compare(token, doc.token);
    if (!compared) return false;
    return doc.otp === otp;
  }

  async consume(employeeCode: string) {
    await this.otpModel.deleteMany({ employeeCode });
  }

  async verifyOtpToken(employeeCode: string, tempToken: string) {
    const doc = await this.otpModel.findOne({ employeeCode });
    if (!doc) return false;
    return await compare(tempToken, doc.token);
  }
}
