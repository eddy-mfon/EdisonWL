import { trpc } from "@/lib/trpc";

/**
 * Returns the current authenticated user, a loading flag, and a logout helper.
 *
 * - `loading` is true until the server has responded at least once.
 * - `user` is null when unauthenticated or when the request is in-flight.
 * - `logout` calls the auth.logout mutation and then refreshes the page so all
 *   in-memory state is cleared consistently.
 */
export function useAuth() {
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    staleTime: 60_000,
  });
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess() {
      window.location.reload();
    },
  });

  return {
    user: meQuery.data ?? null,
    loading: meQuery.isLoading,
    logout: () => logoutMutation.mutate(),
  };
}
