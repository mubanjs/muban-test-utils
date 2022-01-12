import { refElement } from '@muban/muban';
import type { BindProps } from '@muban/muban/lib/bindings/bindings.types';
import { createComponentInstance } from '@muban/muban/lib/Component';
import type { ElementRef } from '@muban/muban/lib/refs/refDefinitions.types';
import { nanoid } from 'nanoid';

/**
 * Creates a `ref` for an `Element` that can be used to pass to hooks
 *
 * @param [element] An optional element to be used in the ref. When not passed, a div is created.
 *
 * @returns { ref, target }
 * ref: the created ref
 * target: the html element for that ref
 */
export function createMockElementRef<T extends HTMLElement>(
  element?: T,
): {
  ref: ElementRef<T, BindProps>;
  target: T;
} {
  const target = (element ?? document.createElement('div')) as HTMLElement;
  target.dataset.ref = target.dataset.ref ?? nanoid();

  const instance = createComponentInstance({}, target, {
    name: target.dataset.ref,
    setup: () => [],
  });

  const ref = refElement<T>(target.dataset.ref).createRef(instance);

  return { ref, target: target as T };
}
