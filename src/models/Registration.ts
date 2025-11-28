import { RegistrationStep, RequiredDocument } from '../types/index.js';

export class RegistrationStepModel implements RegistrationStep {
  constructor(
    public id: number,
    public step_number: number,
    public title: string,
    public description: string,
    public location?: string,
    public contact_reference?: string,
    public created_at: string = new Date().toISOString(),
    public updated_at: string = new Date().toISOString()
  ) {}

  public static fromRow(row: any): RegistrationStepModel {
    return new RegistrationStepModel(
      row.id,
      row.step_number,
      row.title,
      row.description,
      row.location,
      row.contact_reference,
      row.created_at,
      row.updated_at
    );
  }

  public toJSON(): RegistrationStep {
    return {
      id: this.id,
      step_number: this.step_number,
      title: this.title,
      description: this.description,
      location: this.location,
      contact_reference: this.contact_reference,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

export class RequiredDocumentModel implements RequiredDocument {
  constructor(
    public id: number,
    public document_name: string,
    public is_essential: boolean,
    public description?: string,
    public created_at: string = new Date().toISOString()
  ) {}

  public static fromRow(row: any): RequiredDocumentModel {
    return new RequiredDocumentModel(
      row.id,
      row.document_name,
      Boolean(row.is_essential),
      row.description,
      row.created_at
    );
  }

  public toJSON(): RequiredDocument {
    return {
      id: this.id,
      document_name: this.document_name,
      is_essential: this.is_essential,
      description: this.description,
      created_at: this.created_at
    };
  }
}