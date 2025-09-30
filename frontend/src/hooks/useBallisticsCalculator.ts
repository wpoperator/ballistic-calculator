'use client';

import { useCallback, useState } from "react";
import {
  BallisticsError,
  CalculationRequest,
  CalculationResponse,
  ValidationResult,
  ballisticsCalculator,
} from "@/lib/ballistics";

interface UseBallisticsCalculator {
  calculate: (request: CalculationRequest) => Promise<CalculationResponse>;
  validate: (request: CalculationRequest) => ValidationResult;
  loading: boolean;
  error: string | null;
  resetError: () => void;
}

export function useBallisticsCalculator(): UseBallisticsCalculator {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = useCallback((request: CalculationRequest) => {
    return ballisticsCalculator.validate(request);
  }, []);

  const calculate = useCallback(async (request: CalculationRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = ballisticsCalculator.calculate(request);
      return response;
    } catch (err) {
      let message = "An unexpected error occurred";
      if (err instanceof BallisticsError) {
        message = err.message;
      } else if (err instanceof Error && err.message) {
        message = err.message;
      }
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetError = useCallback(() => setError(null), []);

  return {
    calculate,
    validate,
    loading,
    error,
    resetError,
  };
}
