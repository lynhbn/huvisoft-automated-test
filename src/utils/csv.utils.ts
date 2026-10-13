import { parse } from 'csv-parse/sync';
import { readFile } from 'node:fs/promises';

/** Đọc CSV có dòng tiêu đề và trả về từng dòng dưới dạng object. */
export async function readCsv<T extends Record<string, string>>(filePath: string): Promise<T[]> {
  const content = await readFile(filePath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as T[];
}

