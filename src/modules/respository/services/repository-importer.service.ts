import crypto from "crypto";
import path from "path";

import type {
    RepositoryImportRequest,
    RepositoryImportResult
} from "../types/repository.types.js";
import {
    WorkspaceManagerService
} from "./workspace-manager.service.js";



export class RepositoryImporterService {

    private workspaceManager: WorkspaceManagerService;

    constructor() {
        this.workspaceManager = new WorkspaceManagerService();
    }

    async importRepository(
        request: RepositoryImportRequest
    ): Promise<RepositoryImportResult> {

        console.log("\n=================================");
        console.log("STARTING REPOSITORY IMPORT");
        console.log("=================================");

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

         // ----------------------------------------
        // 4. Create project workspace
        // ----------------------------------------

        const workspace = await this.workspaceManager.createWorkspace(
            projectId
        );
        console.log(
            `Workspace created successfully for ${projectId}`
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

         // ----------------------------------------
        // 6. Create standardized result
        // ----------------------------------------

        const result: RepositoryImportResult = {

            projectId,

            projectName,

            sourceType: request.sourceType,

            status: "imported",

            workspacePath: workspace.workspacePath,

            importedAt: new Date().toISOString(),

            message:
                "Repository workspace created successfully"

        };

        return result;
    }
    
    // ----------------------------------------
    // Generate unique project ID
    // ----------------------------------------

    private generateProjectId(): string {

        const randomId = crypto
            .randomBytes(3)
            .toString("hex")
            .toUpperCase();

        return `PRJ-${randomId}`;
    }

    // ----------------------------------------
    // Extract project name
    // ----------------------------------------

    private getProjectName(source: string): string {

        const cleanSource = source
            .replace(/\\/g, "/")
            .replace(/\/$/, "");

        const name = path.basename(cleanSource);

        return name.replace(/\.git$/, "");
    }
}