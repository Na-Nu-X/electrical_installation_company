import { HttpResourceRef } from '@angular/common/http';
import { computed, Signal } from '@angular/core';

/**
 * Safe read of an `httpResource` value: `value()` throws while the resource is
 * in an error state, so templates read through this computed instead.
 */
export function resourceValue<T>(resource: HttpResourceRef<T | undefined>, fallback: T): Signal<T> {
  return computed(() => (resource.hasValue() ? (resource.value() ?? fallback) : fallback));
}
