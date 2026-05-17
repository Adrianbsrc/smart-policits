"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client";
import { followsService } from "@/lib/api/services/follows.service";

export const FOLLOWS_KEY = ["follows"] as const;

function redirectToLogin() {
  window.location.href = "/login";
}

export function useFollows() {
  return useQuery({
    queryKey: FOLLOWS_KEY,
    queryFn: () => followsService.getMyFollows(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: false,
  });
}

export function useFollowStatus(candidateId: string, enabled = true) {
  return useQuery({
    queryKey: [...FOLLOWS_KEY, candidateId, "status"],
    queryFn: () => followsService.checkStatus(candidateId),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    enabled: enabled && Boolean(candidateId),
    retry: false,
  });
}

export function useFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (candidateId: string) => followsService.follow(candidateId),
    onSuccess: (_data, candidateId) => {
      void queryClient.invalidateQueries({ queryKey: FOLLOWS_KEY });
      queryClient.setQueryData(
        [...FOLLOWS_KEY, candidateId, "status"],
        { following: true },
      );
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        redirectToLogin();
      }
    },
  });
}

export function useUnfollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (candidateId: string) => followsService.unfollow(candidateId),
    onSuccess: (_data, candidateId) => {
      void queryClient.invalidateQueries({ queryKey: FOLLOWS_KEY });
      queryClient.setQueryData(
        [...FOLLOWS_KEY, candidateId, "status"],
        { following: false },
      );
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 401) {
        redirectToLogin();
      }
    },
  });
}
