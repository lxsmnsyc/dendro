import * as fc from 'fast-check';
import dendro, { Dendro } from '../src';

describe('dendro', () => {
  describe('Dendro', () => {
    describe('#read', () => {
      it('should return the provided value from constructor', () => {
        fc.assert(
          fc.property(fc.string(), (value) => {
            const instance = dendro(() => value);

            expect(instance.read()).toBe(value);
          }),
        );
      });
      it('should return the written value', () => {
        fc.assert(
          fc.property(fc.string(), fc.string(), (a, b) => {
            const instance = dendro(() => a);
            instance.write(b);
            expect(instance.read()).toBe(b);
          }),
        );
      });
    });
    describe('#write', () => {
      it('should update the value', () => {
        fc.assert(
          fc.property(fc.string(), fc.string(), (a, b) => {
            const instance = dendro(() => a);
            instance.write(b);
            expect(instance.read()).toBe(b);
          }),
        );
      });
      it('should notify the listener', (done) => {
        fc.assert(
          fc.property(fc.string(), fc.string(), (a, b) => {
            const instance = dendro(() => a);
            instance.addListener((value) => {
              try {
                expect(value).toBe(b);
                done();
              } catch (err) {
                done(err);
              }
            });
            instance.write(b);
          }),
        );
      });
    });
  });
  describe('dendro', () => {
    it('should create a Dendro instance', () => {
      expect(dendro(() => 0)).toBeInstanceOf(Dendro);
    });
  });
  describe('with dependencies', () => {
    it('should recompute when dependency updates', (done) => {
      fc.assert(
        fc.property(fc.string(), fc.string(), fc.string(), (a, b, c) => {
          const instance = dendro(() => a);
          const dependent = dendro((get) => {
            const value = get(instance);

            return `${value}${c}`;
          });
          expect(dependent.read()).toBe(`${a}${c}`);
          dependent.addListener((value) => {
            try {
              expect(value).toBe(`${b}${c}`);
              done();
            } catch (err) {
              done(err);
            }
          });
          instance.write(b);
        }),
      );
    });
  });
});
