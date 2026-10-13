import {randomUUID} from "node:crypto";

export function uniqueSuffix(): string {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}

export function uniqueEmail(prefix = "automation"): string {
  return `${prefix}.${uniqueSuffix()}@example.com`;
}

export function uniqueUsername(prefix = "automation"): string {
  return `${prefix}_${uniqueSuffix()}`.replaceAll("-", "_");
}


