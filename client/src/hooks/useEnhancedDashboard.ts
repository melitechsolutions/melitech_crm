import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

/**
 * Hook for fetching user's default dashboard layout
 */
export const useDefaultDashboardLayout = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ["dashboard", "layout", "default"],
    queryFn: () => api.enhancedDashboard.getDefault.query(),
    enabled,
  });
};

/**
 * Hook for fetching specific dashboard layout
 */
export const useDashboardLayout = (layoutId: string | null, enabled: boolean = true) => {
  return useQuery({
    queryKey: ["dashboard", "layout", layoutId],
    queryFn: () => api.enhancedDashboard.getLayout.query(layoutId!),
    enabled: enabled && !!layoutId,
  });
};

/**
 * Hook for listing all user's dashboard layouts
 */
export const useDashboardLayouts = () => {
  return useQuery({
    queryKey: ["dashboard", "layouts"],
    queryFn: () => api.enhancedDashboard.listLayouts.query(),
  });
};

/**
 * Hook for creating new dashboard layout
 */
export const useCreateDashboardLayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (layout) => api.enhancedDashboard.createLayout.mutate(layout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layout", "default"] });
    },
  });
};

/**
 * Hook for updating dashboard layout
 */
export const useUpdateDashboardLayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (layout) => api.enhancedDashboard.updateLayout.mutate(layout),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layout", id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layout", "default"] });
    },
  });
};

/**
 * Hook for deleting dashboard layout
 */
export const useDeleteDashboardLayout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (layoutId: string) => api.enhancedDashboard.deleteLayout.mutate(layoutId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layouts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layout", "default"] });
    },
  });
};

/**
 * Hook for adding widget to layout
 */
export const useAddWidget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { layoutId: string; widget: any }) =>
      api.enhancedDashboard.addWidget.mutate(data),
    onSuccess: (_, { layoutId }) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layout", layoutId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layouts"] });
    },
  });
};

/**
 * Hook for removing widget from layout
 */
export const useRemoveWidget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (widgetId: string) => api.enhancedDashboard.removeWidget.mutate(widgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layouts"] });
    },
  });
};

/**
 * Hook for updating widget (position, size, config)
 */
export const useUpdateWidget = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: string;
      rowIndex?: number;
      colIndex?: number;
      widgetSize?: string;
      config?: any;
    }) => api.enhancedDashboard.updateWidget.mutate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard", "layouts"] });
    },
  });
};

/**
 * Hook for caching widget data
 */
export const useCacheWidgetData = () => {
  return useMutation({
    mutationFn: (data: {
      widgetId: string;
      dataKey: string;
      dataValue: any;
      expiresIn?: number;
    }) => api.enhancedDashboard.cacheWidgetData.mutate(data),
  });
};

/**
 * Hook for getting cached widget data
 */
export const useCachedWidgetData = (
  widgetId: string | null,
  dataKey?: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["dashboard", "widget", "cache", widgetId, dataKey],
    queryFn: () =>
      api.enhancedDashboard.getCachedData.query({
        widgetId: widgetId!,
        dataKey,
      }),
    enabled: enabled && !!widgetId,
  });
};
