import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import unzipper from "unzipper";

export interface ZipExtractionResult {
    zipPath: string;
    extractionPath: string;
    fileCount: number;
    directoryCount: number;
}

export class ZipExtractorService {

    async extractZip(
        zipPath: string,
        extractionPath: string
    ): Promise<ZipExtractionResult> {

        console.log("\n=================================");
        console.log("ZIP EXTRACTOR");
        console.log("=================================");

        console.log(`ZIP File       : ${zipPath}`);
        console.log(`Extraction Path: ${extractionPath}`);

        // ----------------------------------------
        // 1. Check ZIP file exists
        // ----------------------------------------

        try {

            await fsp.access(zipPath);

        } catch {

            throw new Error(
                "ZIP file does not exist or cannot be accessed"
            );
        }


        // ----------------------------------------
        // 2. Check extension
        // ----------------------------------------

        if (
            path.extname(zipPath).toLowerCase() !== ".zip"
        ) {

            throw new Error(
                "Invalid archive format. Only ZIP files are supported."
            );
        }


        // ----------------------------------------
        // 3. Create extraction directory
        // ----------------------------------------

        await fsp.mkdir(
            extractionPath,
            {
                recursive: true
            }
        );


        let fileCount = 0;
        let directoryCount = 0;


        try {

            // ----------------------------------------
            // 4. Open ZIP
            // ----------------------------------------

            const directory =
                await unzipper.Open.file(zipPath);


            console.log(
                `ZIP entries found: ${directory.files.length}`
            );


            // ----------------------------------------
            // 5. Process every ZIP entry
            // ----------------------------------------

            for (const entry of directory.files) {

                const entryPath = entry.path;

                // ------------------------------------
                // Security check
                // ------------------------------------

                const destinationPath =
                    path.resolve(
                        extractionPath,
                        entryPath
                    );

                const normalizedExtractionPath =
                    path.resolve(
                        extractionPath
                    ) + path.sep;


                if (
                    !destinationPath.startsWith(
                        normalizedExtractionPath
                    )
                    &&
                    destinationPath !==
                    path.resolve(extractionPath)
                ) {

                    throw new Error(
                        `Unsafe ZIP entry detected: ${entryPath}`
                    );
                }


                // ------------------------------------
                // Directory
                // ------------------------------------

                if (
                    entry.type === "Directory" ||
                    entryPath.endsWith("/")
                ) {

                    await fsp.mkdir(
                        destinationPath,
                        {
                            recursive: true
                        }
                    );

                    directoryCount++;

                    continue;
                }


                // ------------------------------------
                // File
                // ------------------------------------

                await fsp.mkdir(
                    path.dirname(destinationPath),
                    {
                        recursive: true
                    }
                );


                const content =
                    await entry.buffer();


                await fsp.writeFile(
                    destinationPath,
                    content
                );


                fileCount++;
            }


            console.log(
                "ZIP extracted successfully."
            );

            console.log(
                `Files       : ${fileCount}`
            );

            console.log(
                `Directories : ${directoryCount}`
            );

            console.log("=================================\n");


            return {

                zipPath,

                extractionPath,

                fileCount,

                directoryCount
            };


        } catch (error) {

            console.error(
                "\nZIP extraction failed."
            );


            const message =
                error instanceof Error
                    ? error.message
                    : "Unknown ZIP extraction error";


            console.error(
                `Reason: ${message}`
            );


            // ----------------------------------------
            // Cleanup incomplete extraction
            // ----------------------------------------

            try {

                await fsp.rm(
                    extractionPath,
                    {
                        recursive: true,
                        force: true
                    }
                );

                console.log(
                    "Incomplete extraction cleaned up."
                );

            } catch {

                console.error(
                    "Unable to clean incomplete extraction."
                );
            }


            throw new Error(
                `ZIP extraction failed: ${message}`
            );
        }
    }
}