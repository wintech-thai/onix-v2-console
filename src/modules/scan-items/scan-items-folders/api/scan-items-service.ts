import { createQueryService, createMutationService } from "@/lib/api-factory";
import type { ScanItemsFolderSchemaType } from "../schema/scan-items-folders.schema";

export interface IScanItemsFolder {
  id: string;
  orgId: string;
  folderName: string;
  description: string;
  scanItemActionId: string;
  productId: string;
  tags: string;
  scanItemCount: number;
  createdDate: string;
  scanItemActionName: string;
  productCode: string;
  productDesc: string;
}

export interface FetchScanItemFolderRequest {
  offset: number;
  fromDate: string;
  toDate: string;
  limit: number;
  fullTextSearch: string;
}

export interface FetchScanItemFolderParams {
  orgId: string;
}

export interface ScanItemsFolderResponse {
  status: string;
  description: string;
}

export const getScanItemFolders = createQueryService<
  IScanItemsFolder[],
  FetchScanItemFolderRequest,
  FetchScanItemFolderParams
>({
  key: ["scan-item-folders"],
  url: (params) =>
    `/api/ScanItemFolder/org/${params.orgId}/action/GetScanItemFolders`,
  method: "post",
});

export const getScanItemFolderCount = createQueryService<
  number,
  FetchScanItemFolderRequest,
  FetchScanItemFolderParams
>({
  key: ["scan-item-folders-count"],
  url: (params) =>
    `/api/ScanItemFolder/org/${params.orgId}/action/GetScanItemFolderCount`,
  method: "post",
});

export interface GetScanItemFolderByIdParams {
  orgId: string;
  folderId: string;
}

export interface GetScanItemFolderResponse {
  status: string;
  description: string;
  scanItemFolder: IScanItemsFolder;
}

export const getScanItemFolderById = createQueryService<
  GetScanItemFolderResponse,
  void,
  GetScanItemFolderByIdParams
>({
  key: ["scan-item-folder-by-id"],
  url: (params) =>
    `/api/ScanItemFolder/org/${params.orgId}/action/GetScanItemFolderById/${params.folderId}`,
  method: "get",
});

export interface DeleteScanItemFolderParams {
  orgId: string;
  scanItemActionId: string;
}

export const deleteScanItemFolder = createMutationService<
  ScanItemsFolderResponse,
  void,
  DeleteScanItemFolderParams
>({
  apiName: "deleteScanItemFolder",
  url: (params) =>
    `/api/ScanItemFolder/org/${params.orgId}/action/DeleteScanItemFolderById/${params.scanItemActionId}`,
  method: "delete",
});

export interface AttachFolderToActionParams {
  orgId: string;
  folderId: string;
  actionId: string;
}

export const attachScanItemFolderToAction = createMutationService<
  ScanItemsFolderResponse,
  void,
  AttachFolderToActionParams
>({
  apiName: "attachScanItemFolderToAction",
  url: (params) =>
    `/api/ScanItemFolder/org/${params.orgId}/action/AttachScanItemFolderToAction/${params.folderId}/${params.actionId}`,
  method: "post",
});

export interface AttachFolderToProductParams {
  orgId: string;
  folderId: string;
  productId: string;
}

export const attachScanItemFolderToProduct = createMutationService<
  ScanItemsFolderResponse,
  void,
  AttachFolderToProductParams
>({
  apiName: "attachScanItemFolderToProduct",
  url: (params) =>
    `/api/ScanItemFolder/org/${params.orgId}/action/AttachScanItemFolderToProduct/${params.folderId}/${params.productId}`,
  method: "post",
});

export interface AddScanItemFolderParams {
  orgId: string;
}

export const addScanItemFolder = createMutationService<
  ScanItemsFolderResponse,
  ScanItemsFolderSchemaType,
  AddScanItemFolderParams
>({
  apiName: "addScanItemFolder",
  url: (params) =>
    `/api/ScanItemFolder/org/${params.orgId}/action/AddScanItemFolder`,
  method: "post",
});

export interface UpdateScanItemFolderParams {
  orgId: string;
  folderId: string;
}

export const updateScanItemFolder = createMutationService<
  ScanItemsFolderResponse,
  ScanItemsFolderSchemaType,
  UpdateScanItemFolderParams
>({
  apiName: "updateScanItemFolder",
  url: (params) =>
    `/api/ScanItemFolder/org/${params.orgId}/action/UpdateScanItemFolderById/${params.folderId}`,
  method: "post",
});
