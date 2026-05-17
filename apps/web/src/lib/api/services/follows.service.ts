import { authedApi } from "../authed-client";
import { ENDPOINTS } from "../endpoints";
import type { FollowedCandidate, FollowStatus } from "../types";

export const followsService = {
  getMyFollows(): Promise<FollowedCandidate[]> {
    return authedApi.get<FollowedCandidate[]>(ENDPOINTS.follows.list);
  },

  follow(candidateId: string): Promise<FollowedCandidate> {
    return authedApi.post<FollowedCandidate>(ENDPOINTS.follows.follow(candidateId), {});
  },

  unfollow(candidateId: string): Promise<void> {
    return authedApi.delete<void>(ENDPOINTS.follows.unfollow(candidateId));
  },

  checkStatus(candidateId: string): Promise<FollowStatus> {
    return authedApi.get<FollowStatus>(ENDPOINTS.follows.status(candidateId));
  },
};
