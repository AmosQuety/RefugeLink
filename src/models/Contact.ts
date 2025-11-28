import { Contact } from '../types/index.js';

export class ContactModel implements Contact {
  constructor(
    public id: number,
    public entity: string,
    public description: string,
    public type: 'Emergency' | 'General' | 'Fraud' | 'Hospital',
    public is_urgent: boolean,
    public phone?: string,
    public email?: string,
    public notes?: string,
    public created_at: string = new Date().toISOString(),
    public updated_at: string = new Date().toISOString()
  ) {}

  public static fromRow(row: any): ContactModel {
    return new ContactModel(
      row.id,
      row.entity,
      row.description,
      row.type,
      Boolean(row.is_urgent),
      row.phone,
      row.email,
      row.notes,
      row.created_at,
      row.updated_at
    );
  }

  public toJSON(): Contact {
    return {
      id: this.id,
      entity: this.entity,
      description: this.description,
      type: this.type,
      is_urgent: this.is_urgent,
      phone: this.phone,
      email: this.email,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}