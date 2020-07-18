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
import { defer } from './utils';
import { DendroNode, DendroNodeListener } from './node';

export type DendroNodeReader = <T>(emitter: DendroNode<T>) => T;

export interface DendroEdgeGetInterface {
  get: DendroNodeReader;
}

export type DendroEdgeGet<T> =
  (methods: DendroEdgeGetInterface) => T;
export type DendroEdgeSet<T> =
  (methods: DendroEdgeGetInterface) => T;

export interface DendroEdgeConstructor<T> {
  get: DendroEdgeGet<T>;
  set: DendroEdgeSet<T>;
}

interface Ref<T> {
  value?: T;
}

export class DendroEdge<T> extends DendroNode<T> {
  private dependencies: Set<DendroNode<any>>;

  private edgeConstructor: DendroEdgeConstructor<T>;
  
  private onEmit: DendroNodeListener<any>;

  private getInterface: DendroEdgeGetInterface;

  private static dependencies: Set<DendroNode<any>>;
  private static onEmit: DendroNodeListener<any>;
  private static edge: Ref<DendroEdge<any>>;
  private static getInterface: DendroEdgeGetInterface;

  private static initialCompute<T>(edgeConstructor: DendroEdgeConstructor<T>): T {
    const edgeRef: Ref<DendroEdge<any>> = {};

    const dependencies = new Set<DendroNode<any>>();
  
    const onEmit = () => {
      edgeRef.value?.recompute();
    };

    const getInterface: DendroEdgeGetInterface = {
      get(node) {
        if (!dependencies.has(node)) {
          dependencies.add(node);
          node.addListener(onEmit);
        }
        return node.read();
      }
    };

    const value = edgeConstructor.get(getInterface);

    DendroEdge.edge = edgeRef;
    DendroEdge.dependencies = dependencies;
    DendroEdge.onEmit = onEmit;
    DendroEdge.getInterface = getInterface;

    return value;
  }

  constructor(edgeConstructor: DendroEdgeConstructor<T>) {
    super(DendroEdge.initialCompute(edgeConstructor));

    this.edgeConstructor = edgeConstructor;
    this.dependencies = DendroEdge.dependencies;
    this.onEmit = DendroEdge.onEmit;
    this.getInterface = DendroEdge.getInterface;

    DendroEdge.edge.value = this;
  }

  private scheduled = false;

  private recompute() {
    if (this.scheduled) {
      return;
    }

    this.scheduled = true;

    defer(() => {
      this.scheduled = false;
      if (this.dependencies) {
        this.dependencies.forEach((dependency) => {
          dependency.removeListener(this.onEmit);
        });
        this.dependencies.clear();
      }
      this.emit(this.edgeConstructor.get(this.getInterface));
    });
  }
}

export default function edge<T>(edgeConstructor: DendroEdgeConstructor<T>): DendroEdge<T> {
  return new DendroEdge<T>(edgeConstructor);
}
