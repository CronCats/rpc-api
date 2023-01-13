import fs from 'fs'
import path from 'path'
import Formatters from './formatters'

const includeDapps = true;
const onlyDapps = false;

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

;(async () => {
  // get files from testData, loop and view formatting
  const folder = path.join(__dirname, '../testData')
  let files = await getFiles(folder)
  const format = new Formatters()

  if (includeDapps) {
    const dappfolder = path.join(__dirname, '../testData/dapps')
    const dappfiles = (await getFiles(dappfolder)).map(f => `dapps/${f}`)
    if (onlyDapps) console.log('dappfiles', dappfiles);
    files = onlyDapps ? dappfiles : files.concat(dappfiles)
  }
  if (!onlyDapps) console.log('files', files);

  // loop, read contents, format
  await Promise.all(files.map(async file => {
    const p = path.join(folder, file)
    if (p !== 'server/testData/dapps') {
      try {
        const data = await fs.readFileSync(p, 'utf-8')
        const d = format.transaction(JSON.parse(data), { usdRate: 2.73 })
        console.log(file, d);
      } catch (e) {
        console.log(e)
      }
    }
  }))
})();