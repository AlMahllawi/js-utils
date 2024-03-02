const {
  MIN_SAFE_INTEGER, MAX_SAFE_INTEGER,
  isInteger, isFinite 
} = Number;
const { abs } = Math;
const { isArray } = Array;
export default class NumericRange { // TODO: handle [floating point accuracy issues](https://stackoverflow.com/a/44949594)
  #start;
  get start() { return this.#start; }
  set start(value) {
    if (isFinite(value) && isNaN(value))
      throw new Error("Range start must be a number or Infinity.");
    this.#start = value;
  }

  #end;
  get end() { return this.#end; }
  set end(value) {
    if (isFinite(value) && isNaN(value))
      throw new Error("Range end must be a number or Infinity.");
    this.#end = value;
  }

  get ordinary() { return this.#start <= this.#end; }

  get limited() { return isFinite(this.#start) && isFinite(this.#end); }

  #step;
  get step() { return this.#step; }
  set step(value) {
    if (isNaN(value))
      throw new Error("Range step must be a number.");
    this.#step = abs(value);
  }

  get steps() {
    return (this.ordinary && this.limited)
    ? ((this.#end - this.#start) / this.#step) - 1 // TODO: handle inconsistent boundaries
    : Infinity;
  }

  stepOf(value) {
    if (value == this.#start) return 0;
    if (value == this.#end) return -0;

    let comesAfterStart = value > this.#start, comesBeforeEnd = value < this.#end;
    if (!(this.ordinary
      ? comesAfterStart && comesBeforeEnd
      : comesAfterStart || comesBeforeEnd
    )) return NaN;
    
    let step = comesAfterStart
    ? (value - this.#start) / this.#step
    : -abs((abs(value) - abs(this.#end)) / this.#step);
    
    return isInteger(step) ? step : NaN;
  }

  atStep(step) {
    if (step == 0) return (1/step == -Infinity) ? this.#end : this.#start;
    let value = this.#step * step;
    if (step > 0) {
      value += this.#start;
      if (this.ordinary && value >= this.#end) return NaN;
    } else {
      value += this.#end;
      if (this.ordinary && value <= this.#start) return NaN;
    }
    return value;
  }

  get isIntegerBase() { return isInteger(this.#start) && isInteger(this.#end) && isInteger(this.#step) }

  #bounds;
  get bounds() { return this.#bounds; }
  set bounds(value) {
    if (typeof value == 'boolean') value = [value, value];
    if (!(isArray(value) && value.length == 2 && value.every(val => typeof val == 'boolean')))
      throw new Error("Range bounds must be a boolean value or [boolean, boolean].");
    this.#bounds = value;
  }

  includes(value) {
    if (isNaN(value)) return false;
    if (value == this.#start) return this.#bounds[0];
    if (value == this.#end) return this.#bounds[1];
    return !isNaN(this.stepOf(value));
  }

  iterate(callback, backwards = false) {
    if (typeof(callback) != "function") return;

    let iterating = true;
    function stop() { iterating = false; }

    let step = this.#step,
    borders = [this.#start, this.#end].map(value => isFinite(value) ? value
      : value == -Infinity ? MIN_SAFE_INTEGER : MAX_SAFE_INTEGER
    );
    if (!this.#bounds[0]) borders[0] += step;
    if (!this.#bounds[1]) borders[1] -= step;

    let stages = this.ordinary
    ? [ borders ]
    : [ [MIN_SAFE_INTEGER, borders[1]], [borders[0], MAX_SAFE_INTEGER] ];

    if (backwards) {
      step *= -1;
      stages = stages.map(stage => stage.reverse()).reverse();
    }
    let satisfied = backwards
    ? (iteration, destination) => iteration >= destination
    : (iteration, destination) => iteration <= destination;
    
    for (let stage of stages) {
      let [iteration, destination] = stage;
      do { callback(iteration, stop); iteration += step; }
      while (iterating && satisfied(iteration, destination));
    }
  }

  get values() {
    let values = []; // TODO: handle invalid size error in huge ranges
    this.iterate(value => values.push(value));
    return values;
  }

  /**
   * @param {number} start 
   * @param {number} end 
   * @param {number} step 
   * @param {boolean|[boolean, boolean]} bounds 
   */
  constructor(start = -Infinity, end = Infinity, step = 1, bounds = true) {
    this.start = start;
    this.end = end;
    this.step = step;
    this.bounds = bounds;
  }
}
