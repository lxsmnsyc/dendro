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

export class Dendro<T> {
  private value: T;

  private dependencies: Set<Dendro<any>>;

  private listeners = new Set<DendroListener<T>>();

  private supplier: DendroSupplier<T>;

  private onError?: DendroErrorHandler;

  constructor(supplier: DendroSupplier<T>, onError?: DendroErrorHandler) {
    this.supplier = supplier;
    this.dependencies = new Set();
    this.value = supplier(this.get);
    this.onError = onError;
  }

  private scheduled = false;

  private recompute() {
    if (this.scheduled) {
      return;
    }

    this.scheduled = true;

    defer(
      () => {
        this.scheduled = false;
        this.dependencies.forEach((dependency) => {
          dependency.removeListener(this.onEmit);
        });
        this.dependencies.clear();
        this.write(this.supplier(this.get));
      },
      this.reportError,
    );
  }

  private onEmit = () => {
    this.recompute();
  };

  private get = <R>(node: Dendro<R>): R => {
    if (!this.dependencies.has(node)) {
      this.dependencies.add(node);
      node.addListener(this.onEmit);
    }
    return node.read();
  }

  addListener(listener: DendroListener<T>): void {
    this.listeners.add(listener);
  }

  removeListener(listener: DendroListener<T>): void {
    this.listeners.delete(listener);
  }

  write(value: T): void {
    if (!Object.is(this.value, value)) {
      this.value = value;
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
