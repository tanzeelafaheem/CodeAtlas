import crypto from "crypto";
import path from "path";

import type {
    RepositoryImportRequest,
    RepositoryImportResult
} from "../types/repository.types.js";

export class RepositoryImporterService {

    async importRepository(
        request: RepositoryImportRequest
    ): Promise<RepositoryImportResult> {

        console.log("Starting repository import...");

        // 1. Validate request
        if (!request.sourceType) {
            throw new Error("Repository source type is required");
        }

        if (!request.source) {
            throw new Error("Repository source is required");
        }

        // 2. Generate unique project ID
        const projectId = this.generateProjectId();

        // 3. Determine project name
        const projectName = this.getProjectName(request.source);

        // 4. Create expected workspace path
        const workspacePath = path.join(
            "storage",
            "workspaces",
            projectId
        );

        // 5. Route according to source type
        switch (request.sourceType) {

            case "git":
                console.log("Routing request to Git Repository Cloner...");
                break;

            case "zip":
                console.log("Routing request to ZIP Extractor...");
                break;

            case "local":
                console.log("Routing request to Local Directory Importer...");
                break;

            default:
                throw new Error("Unsupported repository source type");
        }

        // 6. Temporary result
        const result: RepositoryImportResult = {
            projectId,
            projectName,
            sourceType: request.sourceType,
            status: "imported",
            workspacePath,
            importedAt: new Date().toISOString(),
            message: "Repository import request processed successfully"
        };

        return result;
    }

    private generateProjectId(): string {

        const randomId = crypto
            .randomBytes(3)
            .toString("hex")
            .toUpperCase();

        return `PRJ-${randomId}`;
    }

    private getProjectName(source: string): string {

        const cleanSource = source
            .replace(/\\/g, "/")
            .replace(/\/$/, "");

        const name = path.basename(cleanSource);

        return name.replace(/\.git$/, "");
    }
}