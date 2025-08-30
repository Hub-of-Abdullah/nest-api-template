import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { DeviceSession } from "./schema/device-session.schema";
import { Model } from "mongoose";

@Injectable()
export class DeviceSessionsService {
  constructor(
    @InjectModel(DeviceSession.name) private model: Model<DeviceSession>,
  ) {}

  async upsertActive(payload: {
    employeeCode: string;
    deviceId: string;
    ipAddress?: string;
    userAgent?: string;
    browserFingerprint?: string;
  }) {
    return this.model.findOneAndUpdate(
      { employeeCode: payload.employeeCode, deviceId: payload.deviceId },
      { ...payload, active: true },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async removeAllByEmployeeCode(employeeCode: string) {
    return this.model.updateMany({ employeeCode }, { $set: { active: false } });
  }

  async removeByEmployeeAndDevice(employeeCode: string, deviceId: string) {
    return this.model.findOneAndUpdate(
      { employeeCode, deviceId },
      { $set: { active: false } },
    );
  }

  async findActiveByEmployeeCode(employeeCode: string) {
    return this.model.findOne({ employeeCode, active: true });
  }

  async verifyDevice(employeeCode: string, deviceId: string) {
    const doc = await this.model.findOne({
      employeeCode,
      deviceId,
      active: true,
    });
    if (!doc) return false;
    return true;
  }
}
