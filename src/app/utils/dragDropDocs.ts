const readEntryContentAsync = async (entry: any) => {
  return new Promise((resolve, reject) => {
    let reading = 0;
    const contents: File[] = [];

    reading++;
    entry.file(async (file: any) => {
      reading--;
      const rawFile = file;
      if (entry.fullPath.substring(1).includes('/')) {
        rawFile.path = entry.fullPath.substring(1);
      }
      console.log(rawFile);
      contents.push(rawFile);

      if (reading === 0) {
        resolve(contents);
      }
    });
  });
};

// Wrap readEntries in a promise to make working with readEntries easier
const readEntriesPromise = async (directoryReader: any) => {
  try {
    return await new Promise((resolve, reject) => {
      directoryReader.readEntries(resolve, reject);
    });
  } catch (err) {
    console.error(err);
  }
};

// Get all the entries (files or sub-directories) in a directory by calling readEntries until it returns empty array
const readAllDirectoryEntries = async (directoryReader: any) => {
  let entries = [];
  let readEntries: any = await readEntriesPromise(directoryReader);
  while (readEntries.length > 0) {
    entries.push(...readEntries);
    readEntries = await readEntriesPromise(directoryReader);
  }
  return entries;
};

export const getAllFileEntries = async (dataTransferItemList: any) => {
  let fileEntries = [];
  // Use BFS to traverse entire directory/file structure
  let queue: any = [];
  // Unfortunately dataTransferItemList is not iterable i.e. no forEach
  for (let i = 0; i < dataTransferItemList.length; i++) {
    queue.push(dataTransferItemList[i].webkitGetAsEntry());
  }
  while (queue.length > 0) {
    let entry = queue.shift();
    if (entry && entry.isFile) {
      fileEntries.push(entry);
    } else if (entry && entry.isDirectory) {
      let reader = entry.createReader();
      queue.push(...(await readAllDirectoryEntries(reader)));
    }
  }
  // return fileEntries;
  return Promise.all(fileEntries.map((entry) => readEntryContentAsync(entry)));
};

export const checkFolderInDocs = (dataTransferItemList: any) => {
  let check = false;
  for (let i = 0; i < dataTransferItemList.length; i++) {
    const data = dataTransferItemList[i].webkitGetAsEntry();
    if (data.isDirectory) {
      check = true;
    }
  }
  return check;
};
