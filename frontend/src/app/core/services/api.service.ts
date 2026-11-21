import { HttpClient, httpResource, HttpResourceRef } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ClientType,
  ElectricalService,
  ElectricalServiceDetail,
  QuoteRequestPayload,
  QuoteRequestResponse,
  ReferenceProject,
  ServiceCategory,
  TeamSpecialist,
} from '../models/api.models';

export interface ServiceQuery {
  category?: string | null;
  featured?: boolean;
  search?: string | null;
  ordering?: string | null;
}

export interface ReferenceQuery {
  category?: string | null;
  client_type?: ClientType | null;
  featured?: boolean;
}

type ParamValue = string | number | boolean | null | undefined;

function toParams(query: Record<string, ParamValue>): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value !== null && value !== undefined && value !== '') {
      params[key] = String(value);
    }
  }
  return params;
}

/**
 * Thin typed gateway to the Django REST API.
 *
 * Read endpoints are exposed as signal-driven `httpResource` factories: pass a
 * function that reads signals and the resource re-fetches automatically when
 * those signals change. Must be called within an injection context.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  categoriesResource(): HttpResourceRef<ServiceCategory[] | undefined> {
    return httpResource<ServiceCategory[]>(() => `${this.baseUrl}/categories/`);
  }

  /** Return `undefined` from `query` to keep the resource idle (no request). */
  servicesResource(
    query: () => ServiceQuery | undefined = () => ({}),
  ): HttpResourceRef<ElectricalService[] | undefined> {
    return httpResource<ElectricalService[]>(() => {
      const q = query();
      return q ? { url: `${this.baseUrl}/services/`, params: toParams({ ...q }) } : undefined;
    });
  }

  /** Returns `undefined` request (idle resource) while the slug is empty. */
  serviceDetailResource(slug: () => string | undefined): HttpResourceRef<ElectricalServiceDetail | undefined> {
    return httpResource<ElectricalServiceDetail>(() => {
      const value = slug();
      return value ? `${this.baseUrl}/services/${encodeURIComponent(value)}/` : undefined;
    });
  }

  referencesResource(query: () => ReferenceQuery = () => ({})): HttpResourceRef<ReferenceProject[] | undefined> {
    return httpResource<ReferenceProject[]>(() => ({
      url: `${this.baseUrl}/references/`,
      params: toParams({ ...query() }),
    }));
  }

  teamResource(): HttpResourceRef<TeamSpecialist[] | undefined> {
    return httpResource<TeamSpecialist[]>(() => `${this.baseUrl}/team/`);
  }

  submitQuote(payload: QuoteRequestPayload): Observable<QuoteRequestResponse> {
    return this.http.post<QuoteRequestResponse>(`${this.baseUrl}/quotes/`, payload);
  }
}
