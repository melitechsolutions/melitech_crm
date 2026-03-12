import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

/**
 * Hook for fetching all permissions with metadata
 */
export const usePermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: () => api.enhancedPermissions.list.query(),
  });
};

/**
 * Hook for fetching permissions by category
 */
export const usePermissionsByCategory = (category: string) => {
  return useQuery({
    queryKey: ["permissions", "category", category],
    queryFn: () => api.enhancedPermissions.getByCategory.query(category),
    enabled: !!category,
  });
};

/**
 * Hook for fetching all permission categories
 */
export const usePermissionCategories = () => {
  return useQuery({
    queryKey: ["permissions", "categories"],
    queryFn: () => api.enhancedPermissions.getCategories.query(),
  });
};

/**
 * Hook for getting permissions for a specific role
 */
export const useRolePermissions = (roleId: string | null) => {
  return useQuery({
    queryKey: ["permissions", "role", roleId],
    queryFn: () => api.enhancedPermissions.getForRole.query(roleId!),
    enabled: !!roleId,
  });
};

/**
 * Hook for assigning permission to role
 */
export const useAssignPermissionToRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      api.enhancedPermissions.assignToRole.mutate({ roleId, permissionId }),
    onSuccess: (_, { roleId }) => {
      // Invalidate role permissions and role list
      queryClient.invalidateQueries({ queryKey: ["permissions", "role", roleId] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

/**
 * Hook for removing permission from role
 */
export const useRemovePermissionFromRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, permissionId }: { roleId: string; permissionId: string }) =>
      api.enhancedPermissions.removeFromRole.mutate({ roleId, permissionId }),
    onSuccess: (_, { roleId }) => {
      // Invalidate role permissions and role list
      queryClient.invalidateQueries({ queryKey: ["permissions", "role", roleId] });
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

/**
 * Hook for fetching permission audit log
 */
export const usePermissionAuditLog = (roleId?: string, limit: number = 100, offset: number = 0) => {
  return useQuery({
    queryKey: ["permissions", "audit", roleId, limit, offset],
    queryFn: () =>
      api.enhancedPermissions.getAuditLog.query({
        roleId,
        limit,
        offset,
      }),
  });
};

/**
 * Hook for searching permissions
 */
export const useSearchPermissions = (query: string) => {
  return useQuery({
    queryKey: ["permissions", "search", query],
    queryFn: () => api.enhancedPermissions.search.query(query),
    enabled: query.length > 0,
  });
};

/**
 * Hook for getting permission detail
 */
export const usePermissionDetail = (permissionId: string | null) => {
  return useQuery({
    queryKey: ["permissions", "detail", permissionId],
    queryFn: () => api.enhancedPermissions.getDetail.query(permissionId!),
    enabled: !!permissionId,
  });
};
