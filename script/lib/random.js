/* --- EXPORTS --- */
export { Random as default };

/*
 * CLASS: Random
 *****************************************************************************/
const Random = class {
  // BASIC

  /* --- METHOD: getRandomUniform --- */
  static getRandomUniform(min, max) {
    return Math.random() * (max - min) + min;
  }

  /* --- METHOD: getRandomInteger --- */
  static getRandomInteger(min, max) {
    // NOTE: Maximum is exclusive.
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }

  /* --- METHOD: getRandomHex --- */
  static getRandomHex() {
    return Random.getRandomInteger(0, 16).toString(16);
  }

  /* --- METHOD: getRandomColor --- */
  // static getRandomColor = () =>
  //   "#" + Math.floor(Math.random() * 16777215).toString(16);
  static getRandomColor() {
    const gRH = Random.getRandomHex;
    return "#" + gRH() + gRH() + gRH() + gRH() + gRH() + gRH();
  }

  /* --- METHOD: flip --- */
  // weighted flip
  static flip(prob0) {
    if (prob0 === undefined) {
      return Random.getRandomInteger(0, 2);
    } else {
      return Math.random() < prob0 ? 0 : 1;
    }
  }

  // ARRAY

  /* --- METHOD: getRandomChoice --- */
  static getRandomChoice(array) {
    const randomIndex = Random.getRandomInteger(0, array.length);
    return array[randomIndex];
  }

  /* --- METHOD: getRandomChoices --- */
  static getRandomChoices(array, size, withReplacement = false) {
    let sample = [];
    if (withReplacement) {
      for (let i = 0; i < size; i++) {
        sample.push(Random.getRandomChoice(array));
      }
    } else {
      for (const item of array) {
        sample.push(item);
      }
      Random.shuffleArray(sample);
      sample = sample.slice(0, size);
    }
    return sample;
  }

  /* --- METHOD: #swap --- */
  static #swap(array, i, j) {
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }

  /* --- METHOD: shuffleArray --- */
  static shuffleArray(array) {
    // Knuth shuffle
    for (let i = 0; i < array.length - 1; i++) {
      Random.#swap(array, i, i + Random.getRandomInteger(0, array.length - i));
    }
  }
};
