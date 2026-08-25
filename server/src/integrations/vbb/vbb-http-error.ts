export class VbbHttpError extends Error {
    readonly status: number;
    readonly statusText: string;

    constructor(status: number, statusText: string) {
        super(`VBB request failed with status ${status}: ${statusText}`);
        this.name = "VbbHttpError";
        this.status = status;
        this.statusText = statusText;
    }
}