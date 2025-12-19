import {
  createQueryHook,
  createMutationHook
} from "@/lib/hooks-factory";
import {
  getScanItemFolders,
  getScanItemFolderCount,
  getScanItemFolderById,
  deleteScanItemFolder,
  attachScanItemFolderToAction,
  attachScanItemFolderToProduct,
  addScanItemFolder,
  updateScanItemFolder,
  moveScanItemToFolder,
} from "../api/scan-items-service";

export const useGetScanItemFolders = createQueryHook(getScanItemFolders);

export const useGetScanItemFolderCount = createQueryHook(getScanItemFolderCount);

export const useGetScanItemFolderById = createQueryHook(getScanItemFolderById);

export const useDeleteScanItemFolder = createMutationHook(
  deleteScanItemFolder,
  {
    invalidates: [
      { queryKey: getScanItemFolders.key },
    ],
  }
);

export const useAttachScanItemFolderToAction = createMutationHook(
  attachScanItemFolderToAction,
  {
    invalidates: [
      { queryKey: getScanItemFolders.key },
    ],
  }
);

export const useAttachScanItemFolderToProduct = createMutationHook(
  attachScanItemFolderToProduct,
  {
    invalidates: [
      { queryKey: getScanItemFolders.key },
    ],
  }
);

export const useAddScanItemFolder = createMutationHook(
  addScanItemFolder,
  {
    invalidates: [
      { queryKey: getScanItemFolders.key },
    ],
  }
);

export const useUpdateScanItemFolder = createMutationHook(
  updateScanItemFolder,
  {
    invalidates: [
      { queryKey: getScanItemFolders.key },
    ],
  }
);

export const useMoveScanItemToFolder = createMutationHook(
  moveScanItemToFolder,
);
