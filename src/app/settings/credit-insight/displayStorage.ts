export const displayStorage = (input: number): string => {
  let storage = input / 1000000;
  if (storage >= 1000 && storage < 1000 * 1000) {
    storage = Math.floor(storage / 1000);
    return (storage % 1 === 0 ? storage.toString() : storage.toFixed(1).toString()) + ' GB';
  } else if (storage >= 1000 * 1000) {
    storage = Math.floor(storage / 1000 / 1000);
    return (storage % 1 === 0 ? storage.toString() : storage.toFixed(1).toString()) + ' TB';
  } else {
    return (storage % 1 === 0 ? storage.toString() : storage.toFixed(1).toString()) + ' MB';
  }
};
