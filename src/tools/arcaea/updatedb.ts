import Database from 'better-sqlite3'
import { getAssetFilePath } from '../../utils'

const dbfile = process.argv.slice(2)[0] ?? ''

if (dbfile === '') {
  console.log('请指定新的 arcsong.db！')
  process.exit(1)
}

const olddb = new Database(getAssetFilePath('arcaea', 'arcsong.db'))

olddb.exec('PRAGMA foreign_keys = OFF')

olddb.exec(`
  CREATE TABLE IF NOT EXISTS alias (
    [sid]         TEXT                 NOT NULL, 
    [alias]       TEXT   PRIMARY KEY   NOT NULL
)`)
olddb.exec(`
  CREATE TABLE IF NOT EXISTS packages (
    [id]          TEXT   PRIMARY KEY   NOT NULL, 
    [name]        TEXT                 NOT NULL   DEFAULT ""
)`)
olddb.exec(`
  CREATE TABLE IF NOT EXISTS charts (
    [song_id]           TEXT       NOT NULL   DEFAULT '',
    [rating_class]      INTEGER    NOT NULL   DEFAULT 0,
    [name_en]           TEXT       NOT NULL   DEFAULT '',
    [name_jp]           TEXT                  DEFAULT '',
    [artist]            TEXT       NOT NULL   DEFAULT '',
    [bpm]               TEXT       NOT NULL   DEFAULT '',
    [bpm_base]          DOUBLE     NOT NULL   DEFAULT 0,
    [set]               TEXT       NOT NULL   DEFAULT '',
    [time]              INTEGER               DEFAULT 0,
    [side]              INTEGER    NOT NULL   DEFAULT 0,
    [world_unlock]      BOOLEAN    NOT NULL   DEFAULT 0,
    [remote_download]   BOOLEAN               DEFAULT '',
    [bg]                TEXT       NOT NULL   DEFAULT '',
    [date]              INTEGER    NOT NULL   DEFAULT 0,
    [version]           TEXT       NOT NULL   DEFAULT '',
    [difficulty]        INTEGER    NOT NULL   DEFAULT 0,
    [rating]            INTEGER    NOT NULL   DEFAULT 0,
    [note]              INTEGER    NOT NULL   DEFAULT 0,
    [chart_designer]    TEXT                  DEFAULT '',
    [jacket_designer]   TEXT                  DEFAULT '',
    [jacket_override]   BOOLEAN    NOT NULL   DEFAULT 0,
    [audio_override]    BOOLEAN    NOT NULL   DEFAULT 0,

    PRIMARY KEY ([song_id], [rating_class])
)`)

olddb.prepare("ATTACH DATABASE ? AS 'newdb'").run(dbfile)
olddb.exec('INSERT OR REPLACE INTO main.alias (sid, alias) SELECT * FROM newdb.alias')

olddb.exec(`INSERT OR REPLACE INTO main.charts (
  [song_id], [rating_class], [name_en], [name_jp],
  [artist], [bpm], [bpm_base], [set], [time], [side],
  [world_unlock], [remote_download], [bg],
  [date], [version], [difficulty], [rating],
  [note], [chart_designer], [jacket_designer],
  [jacket_override], [audio_override]
) SELECT * FROM newdb.charts`)

olddb.exec('INSERT OR REPLACE INTO main.packages (id, name) SELECT * FROM newdb.packages')
olddb.exec('DETACH newdb')
olddb.close()

console.log('更新完成。')
