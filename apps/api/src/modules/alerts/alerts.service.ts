import { Injectable, NotFoundException } from "@nestjs/common";

import { paginate } from "../../common/dto/pagination.dto";
import { AlertsRepository } from "./alerts.repository";

@Injectable()
export class AlertsService {
  constructor(private readonly alertsRepository: AlertsRepository) {}

  async listAlerts(userId: string, page: number, limit: number) {
    const [alerts, total] = await Promise.all([
      this.alertsRepository.findByUser(userId, page, limit),
      this.alertsRepository.countByUser(userId),
    ]);
    return paginate(alerts, total, page, limit);
  }

  async getUnreadCount(userId: string) {
    const count = await this.alertsRepository.countUnread(userId);
    return { count };
  }

  async markRead(id: string, userId: string) {
    try {
      return await this.alertsRepository.markRead(id, userId);
    } catch {
      throw new NotFoundException("Alerta não encontrado");
    }
  }

  async markAllRead(userId: string) {
    await this.alertsRepository.markAllRead(userId);
  }
}
