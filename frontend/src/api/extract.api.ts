import type { Bundle } from '../types/fhir.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export class ExtractApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ExtractApiError';
  }
}

export async function extractReport(file: File, signal?: AbortSignal): Promise<Bundle> {
  const form = new FormData();
  form.append('file', file);

  const response = await fetch(`${API_BASE_URL}/extract`, {
    method: 'POST',
    body: form,
    signal,
  });

  if (!response.ok) {
    const message = await safeParseError(response);
    throw new ExtractApiError(response.status, message);
  }

  return (await response.json()) as Bundle;
}

async function safeParseError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data?.error ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}
