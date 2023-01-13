import fs from 'fs'
import path from 'path'

// NOTE: could utilize this repo for maximum testing epics later:
// https://gitlab.com/TrevorJTClarke/rpc-proxy

const includeDapps = true;
const onlyDapps = true;

let blockHeight = 1010
let fileRotationIndex = 0
const fileCache = {}
const fileNames = []

const getFiles = dir => {
  const list = []
  return new Promise((res, rej) => {
    fs.readdir(dir, { withFileTypes: true }, (err, files) => {
      if (!err) {
        files.forEach(file => {
          list.push(file.name)
        })

        res(list)
        return
      }
      rej(err)
    })
  })
}

// Load up the known files into a cache
;(async () => {
  // get files from testData, loop and view formatting
  const folder = path.join(__dirname, '../testData')
  let files = await getFiles(folder)

  if (includeDapps) {
    const dappfolder = path.join(__dirname, '../testData/dapps')
    const dappfiles = (await getFiles(dappfolder)).map(f => `dapps/${f}`)
    // if (onlyDapps) console.log('dappfiles', dappfiles);
    files = onlyDapps ? dappfiles : files.concat(dappfiles)
  }
  // if (!onlyDapps) console.log('files', files);

  // loop, read contents, format
  await Promise.all(files.map(async file => {
    const p = path.join(folder, file)
    if (p !== 'server/testData/dapps') {
      try {
        const data = await fs.readFileSync(p, 'utf-8')
        const fileName = file.replace('dapps/', '').replace('\.json', '')
        fileCache[fileName] = JSON.parse(data)
        fileNames.push(fileName)
      } catch (e) {
        console.log(e)
      }
    }
  }))
})();

// block status
// getBlockHeight -> { id: chain.latest_block_height, hash: chain.latest_block_hash }
export const getBlockHeight = async () => {
  blockHeight += 1
  return { id: blockHeight, hash: "CLo31YCUhzz8ZPtS5vXLFskyZgHV5qWgXinBQHgu9Pyd" }
}

// block data
export const getBlockData = async () => {
  return fileCache.block
}

// txns
export const getTransactionsDataFromBlock = async () => {
  const excludedFileNames = ['block', 'chunk', 'status', 'pingbox_get_stats', 'staking_ping']
  let fileData

  if (!excludedFileNames.includes(fileNames[fileRotationIndex]))
    fileData = fileCache[fileNames[fileRotationIndex]]

  fileRotationIndex += 1
  if (fileRotationIndex > fileNames.length) fileRotationIndex = 0
  return [fileData]
}
