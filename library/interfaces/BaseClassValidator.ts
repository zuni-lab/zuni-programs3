import { validateSync, ValidationError } from 'class-validator';

export class ClassPropertyValidationError extends Error {
  constructor(errors: ValidationError[]) {
    const errorMessage = errors
      .map((error) => Object.values(error.constraints ?? {}).join('; '))
      .join('; ');
    super(errorMessage);
    this.name = 'ClassPropertyValidationError';
  }
}
export class BaseClassValidator {
  constructor(data: any) {
    Object.assign(this, data);
    this.validateTypeSync();
  }

  protected validateTypeSync() {
    const errors: ValidationError[] = validateSync(this);
    if (errors.length > 0) {
      throw new ClassPropertyValidationError(errors);
    }
  }
}
