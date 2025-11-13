export const todoCategoryKeys = {
  all: ["todo", "categories"] as const,
  list: () => [...todoCategoryKeys.all, "list"] as const,
  detail: (id: string) => [...todoCategoryKeys.all, "detail", id] as const,
};

