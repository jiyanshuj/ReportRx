import { useCallback, useRef, useState } from 'react';
import { extractReport, ExtractApiError } from '../api/extract.api';
import type { Bundle } from '../types/fhir.types';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface ExtractState {
  status: Status;
  bundle: Bundle | null;
  error: string | null;
}

const INITIAL_STATE: ExtractState = { status: 'idle', bundle: null, error: null };

export function useExtractReport() {
  const [state, setState] = useState<ExtractState>(INITIAL_STATE);
  const controllerRef = useRef<AbortController | null>(null);

  const submit = useCallback(async (file: File) => {
    const controller = new AbortController();
    controllerRef.current = controller;
    setState({ status: 'loading', bundle: null, error: null });
    try {
      const bundle = await extractReport(file, controller.signal);
      setState({ status: 'success', bundle, error: null });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setState(INITIAL_STATE);
        return;
      }
      const message =
        err instanceof ExtractApiError
          ? err.message
          : 'Could not reach the extraction service. Check that the backend is running.';
      setState({ status: 'error', bundle: null, error: message });
    }
  }, []);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return { ...state, submit, reset, cancel };
}
