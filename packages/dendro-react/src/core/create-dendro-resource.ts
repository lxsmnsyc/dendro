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
import { Dendro } from '@lxsmnsyc/dendro';

export interface ResourcePending<T> {
  status: 'pending';
  value: Promise<T>;
}
export interface ResourceSuccess<T> {
  status: 'success';
  value: T;
}
export interface ResourceFailure {
  status: 'failure';
  value: any;
}
export type ResourceResult<T> = ResourcePending<T> | ResourceSuccess<T> | ResourceFailure;

export class DendroResource<T> extends Dendro<ResourceResult<T>> {
  constructor(source: Dendro<Promise<T>>) {
    super(
      () => ({
        status: 'pending',
        value: source.read(),
      }),
      source.reportError,
    );

    source.addListener((promise) => {
      this.write({
        status: 'pending',
        value: promise,
      });

      promise.then(
        (value) => this.write({
          status: 'success',
          value,
        }),
        (value) => this.write({
          status: 'failure',
          value,
        }),
      );
    });
  }
}

export default function createDendroResource<T>(
  source: Dendro<Promise<T>>,
): DendroResource<T> {
  return new DendroResource(source);
}
