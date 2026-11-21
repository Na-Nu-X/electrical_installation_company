/** Types mirroring the Django REST API payloads. */

export interface CategoryBrief {
  id: number;
  name: string;
  slug: string;
  icon_name: string;
}

export interface ServiceCategory extends CategoryBrief {
  short_summary: string;
  display_order: number;
  service_count: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ElectricalService {
  id: number;
  name: string;
  slug: string;
  category: CategoryBrief;
  short_description: string;
  scope_of_work: string[];
  standards_and_certs: string[];
  typical_timeline: string;
  /** Decimal serialized as string by DRF, e.g. "4900.00". */
  starting_price_eur: string | null;
  is_featured: boolean;
}

export interface ElectricalServiceDetail extends ElectricalService {
  detailed_description: string;
  faq: FaqItem[];
  updated_at: string;
}

export type ClientType = 'rodinny_dom' | 'bytovy_dom' | 'firma_priemysel';

export interface ReferenceProject {
  id: number;
  title: string;
  slug: string;
  category: CategoryBrief;
  client_type: ClientType;
  client_type_display: string;
  location_city: string;
  challenge_summary: string;
  solution_summary: string;
  technical_highlights: string[];
  image_url: string;
  completion_year: number;
  is_featured: boolean;
}

export interface TeamSpecialist {
  id: number;
  full_name: string;
  role_title: string;
  qualifications: string;
  bio: string;
  photo_url: string;
}

export type QuoteServiceType = 'novostavba' | 'rekonstrukcia' | 'revizia' | 'wallbox_fve' | 'smart_home' | 'porucha';
export type QuoteObjectType = 'byt' | 'rodinny_dom' | 'bytovy_dom' | 'firma_hala';

export interface QuoteRequestPayload {
  service_type: QuoteServiceType;
  object_type: QuoteObjectType;
  property_location: string;
  floor_area_sqm: number | null;
  has_project_documentation: boolean;
  preferred_timeframe: string;
  client_name: string;
  email: string;
  phone: string;
  description: string;
  gdpr_consent: boolean;
  website: string;
}

export interface QuoteRequestResponse extends Omit<QuoteRequestPayload, 'gdpr_consent' | 'website'> {
  id: number;
  created_at: string;
}

/** DRF validation error shape: field -> messages. */
export type ApiValidationErrors = Record<string, string[]>;
