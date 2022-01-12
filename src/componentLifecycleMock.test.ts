import { getMubanLifecycleMock, runComponentSetup } from './componentLifecycleMock';
import { onMounted, onUnmounted, ref, watchEffect } from '@muban/muban';
import type * as Muban from '@muban/muban';

jest.mock('@muban/muban', () => getMubanLifecycleMock());

// const { ref, watchEffect } = jest.requireActual<typeof Muban>('@muban/muban');

function useTest({
  setup,
  mounted,
  unmounted,
  change,
}: {
  setup: () => void;
  mounted: () => void;
  unmounted: () => void;
  change: (value: any) => void;
}) {
  setup();

  const state = ref('initial');

  watchEffect(() => {
    change(state.value);
  });

  onMounted(() => {
    mounted();
  });

  onUnmounted(() => {
    unmounted();
  });

  return state;
}

describe('runComponentSetup', () => {
  it('should run a component lifecycle', async () => {
    const setupSpy = jest.fn();
    const mountSpy = jest.fn();
    const unmountSpy = jest.fn();
    const changeSpy = jest.fn();

    await runComponentSetup(
      () => {
        const state = useTest({
          setup: setupSpy,
          mounted: mountSpy,
          unmounted: unmountSpy,
          change: changeSpy,
        });

        return { state };
      },
      ({ state }) => {
        state.value = 'foobar';
      },
    );

    expect(setupSpy).toBeCalledTimes(1);
    expect(mountSpy).toBeCalledTimes(1);
    expect(unmountSpy).toBeCalledTimes(1);
    expect(changeSpy).toBeCalledTimes(2);
    expect(changeSpy).toHaveBeenNthCalledWith(1, 'initial');
    expect(changeSpy).toHaveBeenNthCalledWith(2, 'foobar');
  });
});
