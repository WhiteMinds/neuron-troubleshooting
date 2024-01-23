import './prepare'
import { join } from 'path'
import { existsSync, mkdirSync, renameSync, writeFileSync } from 'fs'
import { ProjectItem, getOrganizationProjects, getProjectItems } from './utils/github'
import { assert } from './utils/error'

const projectNames = ['Neuron', 'CKB Explorer']
const projects = await getOrganizationProjects('Magickbase')
const filteredProjects = projects.filter(p => projectNames.includes(p.title))
assert(filteredProjects.length === projectNames.length)

const projectItemsMap: Record<string, ProjectItem[]> = {}
for (const project of filteredProjects) {
  projectItemsMap[project.title] = await getProjectItems(project.id)
}

const folder = join(process.cwd(), 'snapshots')
mkdirSync(folder, { recursive: true })

const currentFilepath = join(folder, 'current.json')
const prevFilepath = join(folder, 'prev.json')

if (existsSync(currentFilepath)) {
  renameSync(currentFilepath, prevFilepath)
}
writeFileSync(currentFilepath, JSON.stringify(projectItemsMap))
