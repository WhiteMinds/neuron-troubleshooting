import './prepare'
import { join } from 'path'
import { mkdirSync, readFileSync } from 'fs'
import { ProjectItem, createDiscussion } from './utils/github'
import { assert } from './utils/error'

const sortedStatusValues = [
  '🆕 New',
  '📫Hold On',
  '📋 Backlog',
  '📌Planning',
  '🎨 Designing',
  '🏗 In Progress',
  '🔎 Code Review',
  '👀 Testing',
  '🚩Pre Release',
  '✅ Done',
]

const folder = join(process.cwd(), 'snapshots')
mkdirSync(folder, { recursive: true })

const currentFilepath = join(folder, 'current.json')
const prevFilepath = join(folder, 'prev.json')

const currentProjectItemsMap = JSON.parse(readFileSync(currentFilepath).toString()) as Record<string, ProjectItem[]>
const prevProjectItemsMap = JSON.parse(readFileSync(prevFilepath).toString()) as Record<string, ProjectItem[]>

function itemsToItemMap(items: ProjectItem[]): Record<ProjectItem['id'], ProjectItem> {
  const map: Record<ProjectItem['id'], ProjectItem> = {}
  for (const item of items) {
    map[item.id] = item
  }
  return map
}

function getField(item: ProjectItem, filedName: string) {
  return item.fieldValues.nodes.find(n => n.field.name === filedName)
}

let devLog = ''

for (const [title, currentItems] of Object.entries(currentProjectItemsMap)) {
  const prevItems = prevProjectItemsMap[title]
  if (!prevItems) continue

  const currentMap = itemsToItemMap(currentItems)
  const prevMap = itemsToItemMap(prevItems)

  const newItems: ProjectItem[] = []
  const update: ProjectItem[] = []
  const done: ProjectItem[] = []

  for (const id of Object.keys(currentMap)) {
    const currentItem = currentMap[id]
    const prevItem = prevMap[id]
    assert(currentItem)

    const hasAnyChange = !prevItem || JSON.stringify(currentItem) !== JSON.stringify(prevItem)
    const hasStatusChange = !prevItem || getField(currentItem, 'Status')?.name !== getField(prevItem, 'Status')?.name
    if (!hasAnyChange) continue

    const currentStatus = getField(currentItem, 'Status')?.name ?? ''
    switch (currentStatus) {
      case '🆕 New':
        newItems.push(currentItem)
        break
      case '🚩Pre Release':
      case '✅ Done':
        const prevStatus = prevItem == null ? '' : getField(prevItem, 'Status')?.name ?? ''
        const prevIsDone = ['🚩Pre Release', '✅ Done'].includes(prevStatus)
        if (hasStatusChange && !prevIsDone) {
          done.push(currentItem)
        }
        break
      default:
        update.push(currentItem)
        break
    }
  }

  ;[newItems, update, done].forEach(items =>
    items.sort((a, b) => {
      const aStatus = getField(a, 'Status')?.name ?? ''
      const bStatus = getField(b, 'Status')?.name ?? ''
      return sortedStatusValues.indexOf(aStatus) - sortedStatusValues.indexOf(bStatus)
    }),
  )

  const getStatusChangeLog = (item: ProjectItem) => {
    const currentStatus = getField(item, 'Status')?.name
    const prevItem = prevMap[item.id]
    const prevStatus = prevItem == null ? undefined : getField(prevItem, 'Status')?.name
    if (prevStatus == null || currentStatus === prevStatus) return ` [${currentStatus}]`
    return ` [${prevStatus} -> ${currentStatus}]`
  }

  const getContentURL = (item: ProjectItem) =>
    item.content.url != null ? ` [#${item.content.number}](${item.content.url})` : ''

  const getDescription = (item: ProjectItem) => {
    const desc = getField(item, 'Description')?.text
    return desc != null ? ` [${desc}]` : ''
  }

  devLog += `# ${title}\n\n`

  if (newItems.length > 0) {
    devLog += '## [NEW]\n\n'
    newItems.forEach((item, idx) => {
      devLog += `${idx + 1}. ${item.content.title}${getContentURL(item)}${getDescription(item)}\n`
    })
    devLog += '\n'
  }

  if (update.length > 0) {
    devLog += '## [UPDATE]\n\n'
    update.forEach((item, idx) => {
      devLog += `${idx + 1}.${getStatusChangeLog(item)} ${item.content.title}${getContentURL(item)}${getDescription(
        item,
      )}\n`
    })
    devLog += '\n'
  }

  if (done.length > 0) {
    devLog += '## [DONE]\n\n'
    done.forEach((item, idx) => {
      devLog += `${idx + 1}. [${getField(item, 'Status')?.name}] ${item.content.title}${getContentURL(
        item,
      )}${getDescription(item)}\n`
    })
  }

  devLog += '\n'
}

createDiscussion('Magickbase', 'shaping', 'Dev Log', `Dev Log ${new Date().toISOString().slice(0, 10)}`, devLog)
  .then(res => console.log('Dev log created', res.id))
  .catch(console.error)
