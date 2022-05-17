import StreamZip from 'node-stream-zip'
import fs from 'fs/promises'
import path from 'path'
// import cp from 'child_process'
import { getTempFilePath, createCache } from '../../utils'

const apkfile = process.argv[2]

if (!apkfile)
  throw new Error('请指定正确的apk文件。')
  
;(async () => {
  const zip = new StreamZip.async({ file: apkfile })

  const tempDir = getTempFilePath('arcaea', 'assets')
  await fs.mkdir(tempDir)

  await zip.extract('assets/songs/', tempDir)
  await zip.close()

  for (let dir of await fs.readdir(tempDir)) {
    if (['songlist', 'packlist', 'unlocks', 'pack', 'random'].includes(dir))
      continue

    let songid: string, audioname: string
    if (dir.startsWith('dl_')) {
      songid = dir.substring(3, dir.length)
      audioname = 'preview.ogg'
    } else {
      songid = dir
      audioname = 'base.ogg'
      // TODO - 使用ffmpeg进行音频截取
      continue
    }
    await createCache(
      'arcaea-preview', `${songid}.ogg`,
      await fs.readFile(path.resolve(tempDir, dir, audioname))
    )
  }
  await fs.rm(tempDir, { recursive: true, force: true })
})()
