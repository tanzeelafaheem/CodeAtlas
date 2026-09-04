import fs from "fs/promises";
import path from "path";

export interface WorkspaceInfo {
    projectId: string;
    workspacePath: string;
    repositoryPath: string;
    metadataPath: string;
    analysisPath: string;
    cachePath: string;
    tempPath: string;
}

export class WorkspaceManagerService {

    private readonly baseWorkspacePath = path.resolve(
        process.cwd(),
        "storage",
        "workspaces"
    );

    /**
     * Creates an isolated workspace for a project.
     */
    async createWorkspace(projectId: string): Promise<WorkspaceInfo> {

        // Main workspace
        const workspacePath = path.join(
            this.baseWorkspacePath,
            projectId
        );

        // Subdirectories
        const repositoryPath = path.join(
            workspacePath,
            "repository"
        );

        const metadataPath = path.join(
            workspacePath,
            "metadata"
        );

        const analysisPath = path.join(
            workspacePath,
            "analysis"
        );

        const cachePath = path.join(
            workspacePath,
            "cache"
        );

        const tempPath = path.join(
            workspacePath,
            "temp"
        );

        // Create all directories
        await fs.mkdir(repositoryPath, { recursive: true });
        await fs.mkdir(metadataPath, { recursive: true });
        await fs.mkdir(analysisPath, { recursive: true });
        await fs.mkdir(cachePath, { recursive: true });
        await fs.mkdir(tempPath, { recursive: true });

        console.log("\n=================================");
        console.log("WORKSPACE CREATED");
        console.log("=================================");
        console.log(`Project ID      : ${projectId}`);
        console.log(`Workspace       : ${workspacePath}`);
        console.log(`Repository     : ${repositoryPath}`);
        console.log(`Metadata       : ${metadataPath}`);
        console.log(`Analysis       : ${analysisPath}`);
        console.log(`Cache          : ${cachePath}`);
        console.log(`Temporary      : ${tempPath}`);
        console.log("=================================\n");

        return {
            projectId,
            workspacePath,
            repositoryPath,
            metadataPath,
            analysisPath,
            cachePath,
            tempPath
        };
    }
}