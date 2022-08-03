import fs from 'fs'
import path from 'path'

import icons from '../assets/icons.json'

const options = Object.keys(icons).join(',')

const snippets = {
  'iconize HTML': {
    prefix: 'icon',
    body: [
      `<i qf-icon qfName="\${1|${options}|}\$0"></i>`,
    ],
    description: 'iconize HTML',
  },
}

fs.writeFileSync(path.join(__dirname, '../snippets/html.json'), JSON.stringify(snippets, null, 2))
