import Database from 'better-sqlite3'
import { getAssetFilePath } from '../../utils'

const dbfile = process.argv.slice(2)[0] ?? ''

if (dbfile === '') {
  console.log('请指定新的 arcsong.db！')
  process.exit(1)
}

const olddb = new Database(getAssetFilePath('arcaea', 'arcsong.db'))

olddb.exec('PRAGMA foreign_keys = OFF')

olddb.prepare("ATTACH DATABASE ? AS 'newdb'").run(dbfile)
olddb.exec('INSERT OR IGNORE INTO main.alias (sid, alias) SELECT * FROM newdb.alias')

olddb.exec(`INSERT OR IGNORE INTO main.songs (
  sid, name_en, name_jp,
  bpm, bpm_base,
  pakset, artist, time, side,
  date, version, world_unlock, remote_download,
  rating_pst, rating_prs, rating_ftr, rating_byn,
  notes_pst, notes_prs, notes_ftr, notes_byn,
  chart_designer_pst, chart_designer_prs,
  chart_designer_ftr, chart_designer_byn,
  jacket_designer_pst, jacket_designer_prs,
  jacket_designer_ftr, jacket_designer_byn,
  jacket_override_pst, jacket_override_prs,
  jacket_override_ftr, jacket_override_byn
) SELECT * FROM newdb.songs`)

olddb.exec('INSERT OR IGNORE INTO main.packages (id, name) SELECT * FROM newdb.packages')
olddb.exec('DETACH newdb')
olddb.close()

console.log('更新完成。')
