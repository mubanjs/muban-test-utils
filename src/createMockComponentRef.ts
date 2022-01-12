import { defineComponent, refComponent } from '@muban/muban';
import type { ComponentFactory } from '@muban/muban';
import { createComponentInstance } from '@muban/muban/lib/Component';
import type { ComponentRef } from '@muban/muban/lib/refs/refDefinitions.types';
import { nanoid } from 'nanoid';

/**
 * Creates a `ref` for a `Component` that can be used to pass to hooks
 *
 * @param [component] A component to be used in the ref. When not passed, a dummy one is created.
 * @param [template] A template string that is used to initialize the component.
 *
 * @returns { ref, target }
 * ref: the created ref
 * target: the html element for that ref
 */
export function createMockComponentRef<T extends ComponentFactory>(
  component?: T,
  template?: string,
): {
  ref: ComponentRef<T>;
  target: HTMLElement;
} {
  // parent component that "creates" this ref
  const uniqueParentId = nanoid();
  const parent = document.createElement('div');
  parent.dataset.component = uniqueParentId;
  const instance = createComponentInstance({}, parent, { name: uniqueParentId, setup: () => [] });

  // child component that this ref links to
  const TestComponent =
    component ??
    defineComponent({
      name: nanoid(),
      setup() {
        return [];
      },
    });

  // create template for child component
  const wrapper = document.createElement('div');
  wrapper.innerHTML = template ?? '';
  const target = (wrapper.firstElementChild as HTMLElement) ?? document.createElement('div');
  target.dataset.component = TestComponent.displayName;
  parent.appendChild(target);

  const ref = refComponent(TestComponent).createRef(instance);

  return { ref, target };
}
