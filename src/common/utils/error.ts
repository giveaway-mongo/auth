import { Error, FieldError } from '@protogen/common/common';

const defaultFieldErrors = [];
const defaultNonFieldErrors = [];

export const getFieldErrors = (
  newFieldError: FieldError,
  fieldErrors: FieldError[] = defaultFieldErrors,
) => {
  return [...fieldErrors, newFieldError];
};

export const getNonFieldErrors = (
  newNonFieldError: string,
  nonFieldErrors: string[] = defaultNonFieldErrors,
) => {
  return [...nonFieldErrors, newNonFieldError];
};

export const getErrors = (
  fieldErrors: FieldError[] = defaultFieldErrors,
  nonFieldErrors: string[] = defaultNonFieldErrors,
): Error => {
  return { fieldErrors, nonFieldErrors };
};
