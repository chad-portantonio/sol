import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveValue(value: string | number | string[]): R;
      toBeInvalid(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toContainElement(element: HTMLElement | null): R;
    }
  }
}
