import { Router } from 'express';
import multer from 'multer';
import { extractTextFromFile } from '../services/ocr.service';
import { parseObservations } from '../services/parsing.service';
import { mapToFhirObservation } from '../services/mapping.service';
import { validateObservation } from '../services/validation.service';
import { BadRequestError, UnprocessableEntityError } from '../utils/errors';
import type { Bundle, BundleEntry } from '../types/fhir.types';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

const upload = multer({ storage: multer.memoryStorage() });

export const extractRouter = Router();

extractRouter.post('/extract', upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      throw new BadRequestError('No file uploaded. Attach a file under the "file" field.');
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestError(
        `Unsupported file type "${file.mimetype}". Allowed: JPEG, PNG, WebP, PDF.`
      );
    }

    const ocrText = await extractTextFromFile(file.buffer, file.originalname, file.mimetype);
    const parsedObservations = parseObservations(ocrText);

    if (parsedObservations.length === 0) {
      throw new UnprocessableEntityError('OCR returned no extractable observations.');
    }

    const needsReview: string[] = [];
    const entries: BundleEntry[] = parsedObservations.map((parsed) => {
      const { isValid } = validateObservation(parsed);
      if (!isValid) needsReview.push(parsed.testName);
      return { resource: mapToFhirObservation(parsed) };
    });

    const bundle: Bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: entries,
      meta: {
        source: 'ocr-extraction',
        needsReview,
      },
    };

    res.status(200).json(bundle);
  } catch (err) {
    next(err);
  }
});