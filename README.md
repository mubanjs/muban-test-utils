# @muban/test-utils

This package contains a set of utility functions that makes testing code that interacts with 
Muban Components a lot easier.

The most obvious use case is testing hooks, but there might be other code that works with 
Components, or use things like refs to operate on.

Instead of trying to create real components in your tests, or try to construct these elements by 
hand, these functions will give you the tools to do that easily.

Additionally, it provides a `getMubanLifecycleMock` function that can be used as **Jest Mock** 
to replace any `@muban/muban` import that uses the `onMounted` and `onUnmounted` Lifecycle Hooks.

## Getting started

### Installing

Add `@muban/test-utils` to your project:
```sh
npm i -D @muban/test-utils
yarn add -D @muban/test-utils
```

### Setup Jest mocking

> This is only needed when the code you're testing makes used of the `onMounted` and `onUnmounted`
Lifecycle Hooks.

```ts
import { getMubanLifecycleMock } from './componentLifecycleMock';

jest.mock('@muban/muban', () => getMubanLifecycleMock());
```

All other exports will be untouched, so you can import them as usual.

If your test code would need the actual `onMounted` and `onUnmounted` code for some reason, you 
can use Jest's `requireActual`;

```ts
import type * as Muban from '@muban/muban';

// using `<typeof Muban>` makes sure that TS understands these imports 
const { onMounted, onUnmounted } = jest.requireActual<typeof Muban>('@muban/muban');
```

## Api

### `getMubanLifecycleMock`

Returns a mock object for the `@muban/muban` where the `onMounted` and `onUnmounted` are 
replaced by an internal implementation (used by `runComponentSetup`).

This allows you to test Muban hooks outside of components (again, using `runComponentSetup`).

```ts
import { getMubanLifecycleMock } from './componentLifecycleMock';

jest.mock('@muban/muban', () => getMubanLifecycleMock());
```

This code must be placed at the top of the file (below the `import` statements), since it should 
execute before any other code. If you place this inside a test or function, it won't work.

### `runComponentSetup`

A helper function that "fakes" how a component would run its setup and lifecycle methods.
It makes sure that the lifecycle hooks called during the `setupFunction` are bound to the
`currentComponentInstance`, so those hooks can be triggered.

> Using the `runComponentSetup` function for testing is only required when using lifecycle hooks. 
> For other hooks, you can just execute and test them as any other functions. 
  
```ts
async function runComponentSetup<T extends any>(
  setupFunction: () => T,
  runFunction?: (params: T) => void | Promise<void>,
): Promise<void>;
```

**Parameters**

* `setupFunction()` – A function to init your hooks. It runs before any lifecycle hooks are
  called, similar to the actual component `setup` function.
* `runFunction(params)` – A function that would simulate anything that would happen during a 
  component's lifetime. Basically the user/dom that interacts with a component (e.g. clicking 
  on it). This function can be `async` if you need this for your test case.
  It receives any parameters that are returned from the `setupFunction`, so you can interact 
  with anything that is returned from your hooks.

**Returns**

An empty Promise. Since the `runFunction` can be `async`, this whole function is `async` by default.
It's best to `await` this, and do you assertions after.

**Example**

```ts
const changeSpy = jest.fn();

it('should run a component lifecycle', async () => {
  // run the `runComponentSetup`, and await in case it's async
  await runComponentSetup(
    // the `setupFunction` is similar to the `setup` of your component
    () => {
      // invoke the hook to test (which can have lifecycle hooks)
      const state = useTest({
        change: changeSpy,
      });
      
      // pass through some info to the `runFunction` to interact with
      return { state };
    },
    // the usage of the `runFunction` is optional
    ({ state }) => {
      // interact with the sate, to trigger logic in the hook
      state.value = 'foobar';
    },
  );
  
  // after the above is done, we can assert our logic,
  // in this case, check if the spies are called with correct values
  expect(changeSpy).toBeCalledTimes(2);
  expect(changeSpy).toHaveBeenNthCalledWith(1, 'initial');
  expect(changeSpy).toHaveBeenNthCalledWith(2, 'foobar');
});
```

### `createMockElementRef`

Creates a `ref` for an `Element` that can be used to pass to hooks or interact with in any other 
way.

```ts
function createMockElementRef<T extends HTMLElement>(
  element?: T,
): {
  ref: ElementRef<T, BindProps>;
  target: T;
};
```

**Params**

* `element` - An optional element to be used in the ref. When not passed, a div is created.

**Returns**

An object with a `ref` and a `target`

* `ref` – The created ref
* `target` – The html element for that ref

**Example**

```ts
const { ref, target } = createMockElementRef();

// this hook makes use of the `ref`
useSomeHook(ref);

// do test with this, or the result of the hook
expect(ref.element).toEqual(target);
```

```ts
const element = document.createElement('span');
element.dataset.ref = 'foobar';

const { ref, target } = createMockElementRef(element);

expect(ref.element).toEqual(target);
expect(element).toEqual(target);
expect(target.dataset.ref).toEqual('foobar');
```

### `createMockComponentRef`

Creates a `ref` for an `Component` that can be used to pass to hooks or interact with in any other
way.

```ts
function createMockComponentRef<T extends ComponentFactory>(
  component?: T,
  template?: string,
): {
  ref: ComponentRef<T>;
  target: HTMLElement;
}
```

**Params**

* `component` - A component to be used in the ref. When not passed, a dummy one is created.
* `template` - An optional to be used for the passed `component`. When not passed, a dummy one is 
  created.

The use case for passing those overrides, is to access the parsed component props through the 
ref, or bind to the component props.

**Returns**

An object with a `ref` and a `target`

* `ref` – The created ref linked to a test Component
* `target` – The html element for that ref

**Example**

```ts
const { ref, target } = createMockComponentRef();

// this hook makes use of the `ref`
useSomeHook(ref);

// do test with this, or the result of the hook
expect(ref.component?.element).toEqual(target);
```

```ts
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
```
