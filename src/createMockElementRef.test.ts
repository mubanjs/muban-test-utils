import { createMockElementRef } from './createMockElementRef';

describe('createMockElementRef', () => {
  it('should return a valid ref', async () => {
    const { ref, target } = createMockElementRef();

    expect(ref.element).toEqual(target);
  });

  it('should use the passed element', async () => {
    const element = document.createElement('span');
    element.dataset.ref = 'foobar';
    const { ref, target } = createMockElementRef(element);

    expect(ref.element).toEqual(target);
    expect(element).toEqual(target);
    expect(target.dataset.ref).toEqual('foobar');
  });
});
