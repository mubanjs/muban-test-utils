import { defineComponent, propType } from '@muban/muban';
import { createMockComponentRef } from './createMockComponentRef';

describe('createMockComponentRef', () => {
  it('should return a valid ref', async () => {
    const { ref, target } = createMockComponentRef();

    expect(ref.component?.element).toEqual(target);
  });
  it('should use the passed component', async () => {
    const Demo = defineComponent({
      name: 'demo',
      props: {
        foo: propType.number.defaultValue(42),
      },
      setup() {
        return [];
      },
    });
    const { ref, target } = createMockComponentRef(Demo);

    expect(ref.component?.name).toEqual(Demo.displayName);
    expect(ref.component?.props.foo).toEqual(42);
    expect(target.dataset.component).toEqual('demo');
  });

  it('should use te passed template', async () => {
    const Demo = defineComponent({
      name: 'demo',
      props: {
        foo: propType.number.defaultValue(42),
      },
      setup() {
        return [];
      },
    });
    const { ref, target } = createMockComponentRef(
      Demo,
      `<div data-component="demo" data-foo="69">test</div>`,
    );

    expect(ref.component?.name).toEqual(Demo.displayName);
    expect(ref.component?.props.foo).toEqual(69);
    expect(target.dataset.component).toEqual('demo');
  });
});
