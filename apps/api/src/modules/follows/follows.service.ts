import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";

import { CandidatesService } from "../candidates/candidates.service";
import type { FollowWithCandidate } from "./follows.repository";
import { FollowsRepository } from "./follows.repository";

@Injectable()
export class FollowsService {
  constructor(
    private readonly followsRepository: FollowsRepository,
    private readonly candidatesService: CandidatesService,
  ) {}

  getMyFollows(userId: string): Promise<FollowWithCandidate[]> {
    return this.followsRepository.findByUser(userId);
  }

  async follow(userId: string, candidateId: string): Promise<FollowWithCandidate> {
    await this.candidatesService.findByIdOrThrow(candidateId);

    const existing = await this.followsRepository.findByUserAndCandidate(userId, candidateId);
    if (existing) throw new ConflictException("Já está seguindo este candidato");

    return this.followsRepository.create(userId, candidateId);
  }

  async unfollow(userId: string, candidateId: string): Promise<void> {
    const existing = await this.followsRepository.findByUserAndCandidate(userId, candidateId);
    if (!existing) throw new NotFoundException("Não está seguindo este candidato");
    await this.followsRepository.delete(userId, candidateId);
  }

  isFollowing(userId: string, candidateId: string): Promise<boolean> {
    return this.followsRepository.isFollowing(userId, candidateId);
  }
}
