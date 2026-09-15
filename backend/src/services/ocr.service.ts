import { env } from '../config/env';
import { UpstreamOcrError } from '../utils/errors';
import type { MarkerSubmitResponse, MarkerPollResponse } from '../types/ocr.types';

/**
 * Submits a file to the Datalab Marker API and polls until the
 * conversion completes, returning the extracted markdown text.
 */
export async function extractTextFromFile(
  fileBuffer: Buffer,
  filename: string,
  mimetype: string
): Promise<string> {
  const checkUrl = await submit(fileBuffer, filename, mimetype);
  return poll(checkUrl);
}

async function submit(
  fileBuffer: Buffer,
  filename: string,
  mimetype: string
): Promise<string> {
  const form = new FormData();
  form.append('file', new Blob([fileBuffer], { type: mimetype }), filename);
  form.append('output_format', 'markdown');

  let response: Response;
  try {
    response = await fetch(env.markerApiBaseUrl, {
      method: 'POST',
      headers: { 'X-Api-Key': env.datalabApiKey },
      body: form,
    });
  } catch (err) {
    throw new UpstreamOcrError(`Failed to reach OCR service: ${(err as Error).message}`);
  }

  if (!response.ok) {
    throw new UpstreamOcrError(`OCR submission failed with status ${response.status}`);
  }

  const data = (await response.json()) as MarkerSubmitResponse;
  if (!data.success || !data.request_check_url) {
    throw new UpstreamOcrError('OCR service did not return a valid request_check_url');
  }
  return data.request_check_url;
}

async function poll(checkUrl: string): Promise<string> {
  const start = Date.now();

  while (Date.now() - start < env.pollTimeoutMs) {
    let response: Response;
    try {
      response = await fetch(checkUrl, {
        headers: { 'X-Api-Key': env.datalabApiKey },
      });
    } catch (err) {
      throw new UpstreamOcrError(`Failed to poll OCR service: ${(err as Error).message}`);
    }

    if (!response.ok) {
      throw new UpstreamOcrError(`OCR polling failed with status ${response.status}`);
    }

    const data = (await response.json()) as MarkerPollResponse;

    if (data.status === 'complete') {
      if (!data.success || !data.markdown) {
        throw new UpstreamOcrError(data.error ?? 'OCR completed without usable output');
      }
      return data.markdown;
    }

    if (data.status === 'failed') {
      throw new UpstreamOcrError(data.error ?? 'OCR processing failed');
    }

    await sleep(env.pollIntervalMs);
  }

  throw new UpstreamOcrError('OCR processing timed out');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
