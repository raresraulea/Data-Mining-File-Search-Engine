import { buildFileDetails, getWordsWithOccurences, normalizeValue } from "./utils.js";

const FILE_NAME_IDS = ["2504", "2538", "2775", "2792",
'2504', '2836', '2982', '3813', '4294', '5520', '5550',
'2538', '2848', '2984', '3902', '5104', '5524', '5675',
'2775', '2917', '2988', '4206', '5216', '5530', '5678',
'2792', '2955', '3665', '4263', '5220', '5537', '5697',
  '2822', '2978', '3785', '4289', '5229', '5541']

export let dictionaryByFile = {};
export let globalDictionary = {};
export let localVectorsByFile = {};
export let normalizedLocalVectorsByFile = {};
export let ITFByFile = {};
export let inHowManyDocuments = {};

const form = document.getElementById('query-form')
const input = document.getElementById('query-input')
const submitBtn = document.getElementById('query-submit-btn')

submitBtn.addEventListener('click', (e) => {
  e.preventDefault();
  console.log(input.value)

  const wordsWithOcurrences = getWordsWithOccurences(input.value);

  dictionaryByFile[`QUERY`] = {
    words: wordsWithOcurrences,
    title: `QUERY`,
    categories: []
  };

  console.log(dictionaryByFile)


  console.time('app')
  startApp();
  console.timeEnd('app')

  console.log({ITFByFile})
})

function buildDictionaryByFile() {
  const promiseArray = []
  for (let fileNameId of FILE_NAME_IDS) 
    promiseArray.push(() => new Promise(() => buildFileDetails(fileNameId)));
  
  Promise.all(promiseArray.map(f => f()))
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
      // console.log("words", words);

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
      })?.join('')

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

    for (let word of Object.keys(inHowManyDocuments)) {
      ITFVector.push(Math.log10(1.0*FILE_NAME_IDS.length/inHowManyDocuments[word]))
    }
    ITFByFile[filename] = ITFVector

    // console.log({ITFVector})

  }


  console.log("TEXT \n \n", text);
  console.log("NORMALIZED LOCAL VECTORS BY FILE \n \n", normalizedLocalVectorsByFile);
  // console.log("HOW MANY DOCS \n \n", inHowManyDocuments);

  console.log("DICTIONAR GLOBAL", globalDictionary);
  console.log("DETALII PER FISIER:", dictionaryByFile);
}


