import { buildFileDetails, normalizeValue } from "./utils.js";

const FILE_NAME_IDS = ["2504", "2538", "2775", "2792"];
export let dictionaryByFile = {};
export let globalDictionary = {};
export let localVectorsByFile = {};
export let normalizedLocalVectorsByFile = {};
export let ITFByFile = {};
export let inHowManyDocuments = {};

function buildDictionaryByFile() {
  for (let fileNameId of FILE_NAME_IDS) 
    buildFileDetails(fileNameId);
}

function startApp() {
  buildDictionaryByFile();

  globalDictionary = [... new Set(Object.values(dictionaryByFile).reduce(
    (acc, fileDetails) => (acc = [...acc, ...Object.keys(fileDetails.words)]),
    []
  ).sort())];
     
  const firstSection = globalDictionary.reduce((acc, item) => {
     return acc +=`@attribute ${item} \n`
  },'')
  
  const text = Object.entries(dictionaryByFile).reduce(
    (textToSave, [filename, { words }]) => {
      let innerTextToSave = "\n " + filename + " # ";
      console.log("words", words);

      let localVectors = Array.from({length: globalDictionary.length}, (_) => 0)


      innerTextToSave += globalDictionary.map((globalWord, idx) => {
        const fileContainsWord = !!dictionaryByFile[filename].words[globalWord]
        let alreadyCounted = false;
        localVectors[idx] = dictionaryByFile[filename].words[globalWord] ?? 0

        if (!inHowManyDocuments[globalWord]) inHowManyDocuments[globalWord] = 0
        
        if (fileContainsWord && !alreadyCounted) {
          inHowManyDocuments[globalWord] += 1
          alreadyCounted = true;
        }

        return `${idx}:${localVectors[idx]} `
      }).join('')

      localVectorsByFile[filename] = localVectors

      innerTextToSave += `# ${dictionaryByFile[filename].categories.join(' ')}`
      return (textToSave += innerTextToSave);
    },
    `@data`
  );




  for (let filename of Object.keys(localVectorsByFile)) {
    let normalizedVector = []
    let ITFVector = []
    let freqArray = localVectorsByFile[filename]
    freqArray.map((item) => {
      normalizedVector.push(normalizeValue(item))
    })
    normalizedLocalVectorsByFile[filename] = normalizedVector

    let fileWords = Object.values(dictionaryByFile[filename].words);

  //NU IAU cuvintele de unde trebuie (trebuie si cele care nu apar deloc)

    for (let word of Object.keys(inHowManyDocuments)) {
      ITFVector.push(Math.log10(1.0*4/inHowManyDocuments[word]))
    }

    console.log({ITFVector})

  }


  console.log("TEXT \n \n", text);
  console.log("NORMALIZED LOCAL VECTORS BY FILE \n \n", normalizedLocalVectorsByFile);
  console.log("HOW MANY DOCS \n \n", inHowManyDocuments);

  console.log("DICTIONAR GLOBAL", globalDictionary);
  console.log("DETALII PER FISIER:", dictionaryByFile);
}
startApp();