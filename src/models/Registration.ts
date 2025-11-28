import { RegistrationStep, RequiredDocument } from '../types/index.js';

// Extend the interface locally
interface ExtendedRegistrationStep extends RegistrationStep {
  location: string | null;
  contact_reference: string | null;
}

export class RegistrationStepModel implements ExtendedRegistrationStep {
  constructor(
    public id: number,
    public step_number: number,
    public title: string,
    public description: string,
    public requirements: string | null = null,
    public estimated_duration: string | null = null,
    public location: string | null = null,
    public contact_reference: string | null = null,
    public created_at: string = new Date().toISOString(),
    public updated_at: string = new Date().toISOString()
  ) {}

  public static fromRow(row: any): RegistrationStepModel {
    return new RegistrationStepModel(
      row.id,
      row.step_number,
      row.title,
      row.description,
      row.requirements ?? null,
      row.estimated_duration ?? null,
      row.location ?? null,
      row.contact_reference ?? null,
      row.created_at,
      row.updated_at
    );
  }

  public toJSON(): ExtendedRegistrationStep {
    return {
      id: this.id,
      step_number: this.step_number,
      title: this.title,
      description: this.description,
      requirements: this.requirements,
      estimated_duration: this.estimated_duration,
      location: this.location,
      contact_reference: this.contact_reference,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

// Similarly for RequiredDocument
interface ExtendedRequiredDocument extends RequiredDocument {
  notes: string | null;
}

export class RequiredDocumentModel implements ExtendedRequiredDocument {
  constructor(
    public id: number,
    public document_name: string,
    public is_essential: boolean,
    public description: string | null = null,
    public notes: string | null = null,
    public created_at: string = new Date().toISOString(),
    public updated_at: string = new Date().toISOString()
  ) {}

  public static fromRow(row: any): RequiredDocumentModel {
    return new RequiredDocumentModel(
      row.id,
      row.document_name,
      Boolean(row.is_essential),
      row.description ?? null,
      row.notes ?? null,
      row.created_at,
      row.updated_at
    );
  }

  public toJSON(): ExtendedRequiredDocument {
    return {
      id: this.id,
      document_name: this.document_name,
      is_essential: this.is_essential,
      description: this.description,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}