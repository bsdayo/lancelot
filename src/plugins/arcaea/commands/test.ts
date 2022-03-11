import { Command, s } from 'koishi';
import { getSongIdFuzzy } from '../utils';

export function enableTest(rootCmd: Command) {
  rootCmd
    .subcommand('.test <songname:text>', {hidden: true})
    .action((_, songname: string) => {
      console.log(typeof songname, songname)
      return getSongIdFuzzy(songname)
    })
}