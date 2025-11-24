"use client";

import { useMutation } from "@tanstack/react-query";
import { joinGroup } from "../../api/groups/api";

export const useJoinGroup = () =>
  useMutation<void, Error, string>({
    mutationFn: (groupId: string) => joinGroup(groupId),
  });

