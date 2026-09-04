export type RepositorySourceType = "git" | "zip" | "local";

export interface RepositoryImportRequest {
    sourceType: RepositorySourceType;
    source: string;
}

export interface RepositoryImportResult {
    projectId: string;
    projectName: string;
    sourceType: RepositorySourceType;
    status: "imported" | "failed";
    workspacePath: string;
    importedAt: string;
    message: string;
}