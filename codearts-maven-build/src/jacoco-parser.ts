import {parseStringPromise} from "xml2js";
import { promises as fs } from 'fs';
const { readFile, writeFile } = fs;

export interface JacocoReport {
    line: { covered: number; total: number };
    branch: { covered: number; total: number };
}

export async function parseJacocoReport(path: string): Promise<JacocoReport> {
    const content = await readFile(path, 'utf-8');
    const parsed = await parseStringPromise(content);

    const counter = (type: string) => {
        const counter = parsed.report.counter.find((c: any) => c.$.type === type);
        return {
            covered: parseInt(counter.$.covered, 10),
            total: parseInt(counter.$.missed, 10) + parseInt(counter.$.covered, 10)
        };
    };

    return {
        line: counter('LINE'),
        branch: counter('BRANCH')
    };
}
