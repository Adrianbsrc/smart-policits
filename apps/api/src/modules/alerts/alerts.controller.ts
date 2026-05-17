import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { JwtAuthGuard } from "../auth/auth.guard";
import { CurrentUser } from "../auth/current-user.decorator";
import type { UserResult } from "../users/users.repository";
import { AlertsService } from "./alerts.service";

@ApiTags("alerts")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("alerts")
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  list(
    @CurrentUser() user: UserResult,
    @Query("page") page = "1",
    @Query("limit") limit = "20",
  ) {
    return this.alertsService.listAlerts(user.id, Number(page), Number(limit));
  }

  @Get("unread-count")
  unreadCount(@CurrentUser() user: UserResult) {
    return this.alertsService.getUnreadCount(user.id);
  }

  @Patch("read-all")
  @HttpCode(HttpStatus.NO_CONTENT)
  markAllRead(@CurrentUser() user: UserResult) {
    return this.alertsService.markAllRead(user.id);
  }

  @Patch(":id/read")
  markRead(@CurrentUser() user: UserResult, @Param("id") id: string) {
    return this.alertsService.markRead(id, user.id);
  }
}
