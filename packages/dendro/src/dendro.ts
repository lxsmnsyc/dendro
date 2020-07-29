/**
 * @license
 * MIT License
 *
 * Copyright (c) 2020 Alexis Munsayac
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * @author Alexis Munsayac <alexis.munsayac@gmail.com>
 * @copyright Alexis Munsayac 2020
 */
export type DendroReader = <T>(dendro: Dendro<T>) => T;
export type DendroSupplier<T> = (get: DendroReader) => T;
export type DendroErrorHandler = (error: Error) => void;
export type DendroListener<T> = (value: T) => void;

function defer(
  action: () => void | Promise<void>,
  rescue: (error: Error) => void,
): void {
  Promise.resolve()
    .then(action)
    .catch(rescue);
}

interface Version {
  dependencies: Set<Dendro<any>>;
  alive: boolean;
}

export class Dendro<T> {
  // The state of the instance
  private value: T;

  // Version of the instance
  private version: Version;

  // Listeners of the state updates
  private listeners = new Set<DendroListener<T>>();

  // Computation function
  private supplier: DendroSupplier<T>;

  private onError?: DendroErrorHandler;

  constructor(supplier: DendroSupplier<T>, onError?: DendroErrorHandler) {
    this.supplier = supplier;
    this.onError = onError;
    this.version = Dendro.makeVersion();
    this.value = this.computeInternal();
  }

  // Creates a new 'version' of the instance
  private static makeVersion(): Version {
    return {
      dependencies: new Set<Dendro<any>>(),
      alive: true,
    };
  }

  private computeInternal(): T {
    const { version } = this;

    // Create computation
    return this.supplier((node) => {
      /**
       * Check if the current version is still alive
       * and check if the node to be read is not yet
       * in the dependencies
       *
       * Register the node as a dependency.
       * Previous versions should not add dependencies
       * to prevent recomputation for the current version.
       */
      if (version.alive && !version.dependencies.has(node)) {
        version.dependencies.add(node);
        node.addListener(this.onEmit);
      }

      // Return instance state
      return node.read();
    });
  }

  // Flag for debouncing computations
  private scheduled = false;

  private recompute() {
    if (this.scheduled) {
      return;
    }

    this.scheduled = true;

    defer(
      () => {
        // Remove schedule
        this.scheduled = false;

        // Clear dependencies of the previous version
        this.version.dependencies.forEach((dependency) => {
          dependency.removeListener(this.onEmit);
        });
        // Mark previous version as dead
        this.version.alive = false;
        // Create a new version
        this.version = Dendro.makeVersion();
        // Recompute and notify listeners
        this.write(this.computeInternal());
      },
      this.reportError,
    );
  }

  private onEmit = () => {
    this.recompute();
  };

  addListener(listener: DendroListener<T>): void {
    this.listeners.add(listener);
  }

  removeListener(listener: DendroListener<T>): void {
    this.listeners.delete(listener);
  }

  write(value: T): void {
    // Compare previous state to new state
    if (!Object.is(this.value, value)) {
      // Set new state
      this.value = value;
      // Notify listeners
      this.listeners.forEach((listener) => {
        listener(value);
      });
    }
  }

  read(): T {
    return this.value;
  }

  reportError = (error: Error): void => {
    if (this.onError) {
      this.onError(error);
    } else {
      throw error;
    }
  }
}

export default function dendro<T>(
  supplier: DendroSupplier<T>,
  onError?: DendroErrorHandler,
): Dendro<T> {
  return new Dendro<T>(supplier, onError);
}
