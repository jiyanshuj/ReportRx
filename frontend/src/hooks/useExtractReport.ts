import { useCallback, useState } from 'react';
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

  const submit = useCallback(async (file: File) => {
    setState({ status: 'loading', bundle: null, error: null });
    try {
      const bundle = await extractReport(file);
      setState({ status: 'success', bundle, error: null });
    } catch (err) {
      const message =
        err instanceof ExtractApiError
          ? err.message
          : 'Could not reach the extraction service. Check that the backend is running.';
      setState({ status: 'error', bundle: null, error: message });
    }
  }, []);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return { ...state, submit, reset };
}
