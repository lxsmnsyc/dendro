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
export type DendroNodeListener<T> = (value: T) => void;


export class DendroNode<T> {
  private listeners = new Set<DendroNodeListener<T>>();

  protected value: T;

  constructor(value: T) {
    this.value = value;
  }

  addListener(listener: DendroNodeListener<T>): void {
    this.listeners.add(listener);
  }

  removeListener(listener: DendroNodeListener<T>): void {
    this.listeners.delete(listener);
  }

  emit(value: T): void {
    this.value = value;
    this.listeners.forEach((listener) => {
      listener(value);
    });
  }

  read() {
    return this.value;
  }
}

export default function node<T>(value: T): DendroNode<T> {
  return new DendroNode<T>(value);
}
