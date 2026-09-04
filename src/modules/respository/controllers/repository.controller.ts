import type { Request, Response } from "express";
import { RepositoryImporterService } from "../services/repository-importer.service.js";

const importerService = new RepositoryImporterService();

export const importRepository = async (
    req: Request,
    res: Response
) => {

    try {

        const result = await importerService.importRepository(req.body);

        console.log("\n========== IMPORT RESULT ==========");
        console.log(result);
        console.log("====================================\n");

        res.status(200).json(result);

    } catch (error) {

        const message =
            error instanceof Error
                ? error.message
                : "Repository import failed";

        console.error("Import failed:", message);

        res.status(400).json({
            status: "failed",
            message
        });
    }
};