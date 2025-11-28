import { Service } from '../types/index.js';

export class ServiceModel implements Service {
  constructor(
    public id: number,
    public category: 'Food' | 'Health' | 'Shelter' | 'Protection' | 'Livelihoods',
    public organization: string,
    public services: string,
    public location: string,
    public contact_phone?: string,
    public contact_email?: string,
    public notes?: string,
    public created_at: string = new Date().toISOString(),
    public updated_at: string = new Date().toISOString()
  ) {}

  public static fromRow(row: any): ServiceModel {
    return new ServiceModel(
      row.id,
      row.category,
      row.organization,
      row.services,
      row.location,
      row.contact_phone,
      row.contact_email,
      row.notes,
      row.created_at,
      row.updated_at
    );
  }

  public toJSON(): Service {
    return {
      id: this.id,
      category: this.category,
      organization: this.organization,
      services: this.services,
      location: this.location,
      contact_phone: this.contact_phone,
      contact_email: this.contact_email,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}