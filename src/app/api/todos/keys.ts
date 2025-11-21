export const todoKeys = {
  all: ["todos"] as const,
  today: () => [...todoKeys.all, "today"] as const,
  my: () => [...todoKeys.all, "my"] as const,
  detail: (todoId: string) => [...todoKeys.all, "detail", todoId] as const,
};

