/*eslint-env jasmine*/

// Based on https://hg.python.org/releasing/3.4.3/file/tip/Lib/test/test_itertools.py

import {
  accumulate,
  range,
  chain,
  islice,
  chain_from_iterable,
  count,
} from "../index";

describe("itertools", () => {
  it("range", () => {
    expect(range(10)).toYield(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
    expect(range(1, 11)).toYield(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
    expect(range(0, 30, 5)).toYield(0, 5, 10, 15, 20, 25);
    expect(range(0, 10, 3)).toYield(0, 3, 6, 9);
    expect(range(0, -10, -1)).toYield(0, -1, -2, -3, -4, -5, -6, -7, -8, -9);
    expect(range(1, 0)).toYield();

    expect(range(3)).toYield(0, 1, 2);
    expect(range(1, 5)).toYield(1, 2, 3, 4);
    expect(range(0)).toYield();
    expect(range(-3)).toYield();
    expect(range(1, 10, 3)).toYield(1, 4, 7);
    expect(range(5, -5, -3)).toYield(5, 2, -1, -4);

    const a = 10;
    const b = 100;
    const c = 50;

    expect(range(a, a + 2)).toYield(a, a + 1);
    expect(range(a + 2, a, -1)).toYield(a + 2, a + 1);
    expect(range(a + 4, a, -2)).toYield(a + 4, a + 2);

    const seq = Array.from(range(a, b, c));
    expect(seq).toContain(a);
    expect(seq).not.toContain(b);
    expect(seq.length).toBe(2);

    const negSeq = Array.from(range(-a, -b, -c));
    expect(negSeq).toContain(-a);
    expect(negSeq).not.toContain(-b);
    expect(negSeq.length).toBe(2);

    expect(range).toThrowError(Error, "start must be a number");
    expect(() => range(1, 2, 0)).toThrowError(Error, "step must be different than zero");
    expect(() => range("spam")).toThrowError(Error, "start must be a number");
    expect(() => range(0, "spam")).toThrowError(Error, "stop must be a number");
    expect(() => range(0, 42, "spam")).toThrowError(Error, "step must be a number");
  });

  describe("islice", () => {
    it("should agree with range", () => {
      expect(islice(range(100), 10, 20, 3)).toYieldFromIterator(range(10, 20, 3));
      expect(islice(range(100), 10, 3, 20)).toYieldFromIterator(range(10, 3, 20));
      expect(islice(range(100), 10, 20)).toYieldFromIterator(range(10, 20));
      expect(islice(range(100), 10, 3)).toYieldFromIterator(range(10, 3));
      expect(islice(range(100), 20)).toYieldFromIterator(range(20));
    });

    it("stops when seqn is exhausted", () => {
      expect(islice(range(100), 10, 110, 3)).toYieldFromIterator(range(10, 100, 3));
      expect(islice(range(100), 10, 110)).toYieldFromIterator(range(10, 100));
      expect(islice(range(100), 110)).toYieldFromIterator(range(100));
    });

    it("works when stop=null", () => {
      expect(islice(range(10))).toYieldFromIterator(range(10));
      expect(islice(range(10), 2, Infinity)).toYieldFromIterator(range(2, 10));
      expect(islice(range(10), 1, Infinity, 2)).toYieldFromIterator(range(1, 10, 2));
    });

    it("consumes the right number of items", () => {
      const iterator = range(10);
      expect(islice(iterator, 3)).toYieldFromIterator(range(3));
      expect(iterator).toYieldFromIterator(range(3, 10));
    });

    it("throws errors when passing invalid arguments", () => {
      const ra = range(10);
      expect(() => islice(ra, -5, 10, 1)).toThrowError(Error, "start must be positive");
      expect(() => islice(ra, 1, -5, -1)).toThrowError(Error, "stop must be positive");
      expect(() => islice(ra, 1, 10, -1)).toThrowError(Error, "step must be positive");
      expect(() => islice(ra, 1, 10, 0)).toThrowError(Error, "step must be different than zero");
      expect(() => islice(ra, "a")).toThrowError(Error, "stop must be a number");
      expect(() => islice(ra, "a", 1)).toThrowError(Error, "start must be a number");
      expect(() => islice(ra, 1, "a")).toThrowError(Error, "stop must be a number");
      expect(() => islice(ra, "a", 1, 1)).toThrowError(Error, "start must be a number");
      expect(() => islice(ra, 1, "a", 1)).toThrowError(Error, "stop must be a number");

      expect(() => islice(ra, 0.5)).toThrowError(Error, "stop must be an integer");
      expect(() => islice(ra, 0.5, 1)).toThrowError(Error, "start must be an integer");
      expect(() => islice(ra, 1, 0.5)).toThrowError(Error, "stop must be an integer");
      expect(() => islice(ra, 0.5, 1, 1)).toThrowError(Error, "start must be an integer");
      expect(() => islice(ra, 1, 0.5, 1)).toThrowError(Error, "stop must be an integer");
    });

    it("is in a predictable state", () => {
      pending("TODO: implement count");
      const c = count();
      expect(islice(c, 1, 3, 50)).toYield(1);
      expect(c.next()).toBe(3);
    });

  });

  it("accumulate", () => {
    expect(accumulate(range(10))).toYield(0, 1, 3, 6, 10, 15, 21, 28, 36, 45);
    expect(accumulate("abc")).toYield("a", "ab", "abc");
    expect(accumulate([])).toYield();
    expect(accumulate([7])).toYield(7);
    expect(accumulate).toThrowError(Error, "undefined is not iterable");
    const s = [2, 8, 9, 5, 7, 0, 3, 4, 1, 6];
    expect(accumulate(s, Math.min)).toYield(2, 2, 2, 2, 2, 0, 0, 0, 0, 0);
    expect(accumulate(s, Math.max)).toYield(2, 8, 9, 9, 9, 9, 9, 9, 9, 9);
    expect(accumulate(s, (a, b) => a * b)).toYield(2, 16, 144, 720, 5040, 0, 0, 0, 0, 0);
  });

  it("chain", () => {
    expect(chain("abc", "def")).toYield("a", "b", "c", "d", "e", "f");
    expect(chain("abc")).toYield("a", "b", "c");
    expect(chain("")).toYield();
    expect(islice(chain("abc", "def"), 4)).toYield("a", "b", "c", "d");
    expect(() => chain(2, 3)).toThrowError(Error, "2 is not iterable");
  });

  it("chain_from_iterable", () => {
    pending("TODO: implement chain_from_iterable");

    expect(chain_from_iterable(["abc", "def"])).toYield("a", "b", "c", "d", "e", "f");
    expect(chain_from_iterable(["abc"])).toYield("a", "b", "c");
    expect(chain_from_iterable([""])).toYield();
    expect(islice(chain_from_iterable(["abc", "def"]), 4)).toYield("a", "b", "c", "d");
    expect(() => chain_from_iterable([2, 3])).toThrowError(Error, "2 is not iterable");
  });
});
