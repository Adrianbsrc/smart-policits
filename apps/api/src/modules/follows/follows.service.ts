import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { PoliticiansService } from "../politicians/politicians.service";
import type { FollowWithPolitician } from "./follows.repository";
import { FollowsRepository } from "./follows.repository";

@Injectable()
export class FollowsService {
  constructor(
    private readonly followsRepository: FollowsRepository,
    private readonly politiciansService: PoliticiansService,
  ) {}

  getMyFollows(userId: string): Promise<FollowWithPolitician[]> {
    return this.followsRepository.findByUser(userId);
  }

  async follow(userId: string, politicianId: string): Promise<FollowWithPolitician> {
    await this.politiciansService.findByIdOrThrow(politicianId);

    const existing = await this.followsRepository.findByUserAndPolitician(userId, politicianId);
    if (existing) throw new ConflictException("Já está seguindo este político");

    return this.followsRepository.create(userId, politicianId);
  }

  async unfollow(userId: string, politicianId: string): Promise<void> {
    const existing = await this.followsRepository.findByUserAndPolitician(userId, politicianId);
    if (!existing) throw new NotFoundException("Não está seguindo este político");
    await this.followsRepository.delete(userId, politicianId);
  }

  isFollowing(userId: string, politicianId: string): Promise<boolean> {
    return this.followsRepository.isFollowing(userId, politicianId);
  }
}
