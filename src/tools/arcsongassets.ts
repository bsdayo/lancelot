import fs from 'fs'
import path from 'path'

const argv = process.argv.slice(2)
if (argv.length === 0) {
  throw new Error('必须指定song目录')
}

const songDir = path.resolve(__dirname, '../..', argv[0])
if (!fs.existsSync(songDir)) {
  throw new Error('song目录无效')
}

const cacheDir = path.resolve(__dirname, '../../cache')
if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir)
}

const files = fs.readdirSync(songDir)
for (let item of files) {
  if (item === 'pack') continue
  if (!fs.statSync(path.resolve(songDir, item)).isDirectory()) continue

  let sid
  if (item.startsWith('dl_')) sid = item.substring(3)
  else sid = item

  const filename = `arcaea-song-${sid}.jpg`
  const filenameBYD = `arcaea-song-${sid}-beyond.jpg`

  fs.copyFileSync(
    path.resolve(songDir, item, 'base.jpg'),
    path.resolve(__dirname, '../../cache', filename)
  )

  if (fs.existsSync(path.resolve(songDir, item, '3.jpg'))) {
    fs.copyFileSync(
      path.resolve(songDir, item, '3.jpg'),
      path.resolve(__dirname, '../../cache', filenameBYD)
    )
  }
}
