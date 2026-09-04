import crypto from "crypto";
import path from "path";

import type {
    RepositoryImportRequest,
    RepositoryImportResult
} from "../types/repository.types.js";

import { WorkspaceManagerService } from "./workspace-manager.service.js";
import { GitClonerService } from "./git-cloner.service.js";


export class RepositoryImporterService {

    private workspaceManager: WorkspaceManagerService;

    private gitCloner: GitClonerService;


    constructor() {

        this.workspaceManager =
            new WorkspaceManagerService();

        this.gitCloner =
            new GitClonerService();
    }


    async importRepository(
        request: RepositoryImportRequest
    ): Promise<RepositoryImportResult> {

        console.log("\n=================================");
        console.log("STARTING REPOSITORY IMPORT");
        console.log("=================================");


        // ----------------------------------------
        // 1. Validate request
        // ----------------------------------------

        if (!request.sourceType) {

            throw new Error(
                "Repository source type is required"
            );
        }


        if (!request.source) {

            throw new Error(
                "Repository source is required"
            );
        }


        // ----------------------------------------
        // 2. Generate Project ID
        // ----------------------------------------

        const projectId =
            this.generateProjectId();

        console.log(
            `Generated Project ID: ${projectId}`
        );


        // ----------------------------------------
        // 3. Determine Project Name
        // ----------------------------------------

        const projectName =
            this.getProjectName(request.source);

        console.log(
            `Project Name: ${projectName}`
        );


        // ----------------------------------------
        // 4. Create Workspace
        // ----------------------------------------

        const workspace =
            await this.workspaceManager.createWorkspace(
                projectId
            );

        console.log(
            `Workspace created for ${projectId}`
        );


        // ----------------------------------------
        // 5. Import Repository
        // ----------------------------------------

        try {

            switch (request.sourceType) {

                // ==================================
                // GIT
                // ==================================

                case "git":

                    console.log(
                        "\nRouting to Git Repository Cloner..."
                    );


                    await this.gitCloner.cloneRepository(

                        request.source,

                        workspace.repositoryPath,

                        {
                            branch: request.branch,
                            tag: request.tag,
                            commit: request.commit,
                            shallow: request.shallow
                        }
                    );

                    break;


                // ==================================
                // ZIP
                // ==================================

                case "zip":

                    console.log(
                        "ZIP Extractor will be implemented next."
                    );

                    break;


                // ==================================
                // LOCAL
                // ==================================

                case "local":

                    console.log(
                        "Local Directory Importer will be implemented next."
                    );

                    break;


                // ==================================
                // INVALID TYPE
                // ==================================

                default:

                    throw new Error(
                        "Unsupported repository source type"
                    );
            }


            // ----------------------------------------
            // 6. Successful result
            // ----------------------------------------

            const result: RepositoryImportResult = {

                projectId,

                projectName,

                sourceType: request.sourceType,

                status: "imported",

                workspacePath:
                    workspace.workspacePath,

                repositoryPath:
                    workspace.repositoryPath,

                importedAt:
                    new Date().toISOString(),

                message:
                    "Repository imported successfully"
            };


            return result;


        } catch (error) {

            console.error(
                "\nRepository import failed."
            );


            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown import error";


            console.error(
                `Reason: ${message}`
            );


            throw new Error(
                `Repository import failed: ${message}`
            );
        }
    }


    // ----------------------------------------
    // Generate Project ID
    // ----------------------------------------

    private generateProjectId(): string {

        const randomId =
            crypto
                .randomBytes(3)
                .toString("hex")
                .toUpperCase();


        return `PRJ-${randomId}`;
    }


    // ----------------------------------------
    // Extract Project Name
    // ----------------------------------------

    private getProjectName(
        source: string
    ): string {

        const cleanSource =
            source
                .replace(/\\/g, "/")
                .replace(/\/$/, "");


        const name =
            path.basename(cleanSource);


        return name.replace(
            /\.git$/,
            ""
        );
    }
}