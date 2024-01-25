import './prepare'
import { generateDevlogFromSnapshotsDiff, updateSnapshots } from './utils/report'

await updateSnapshots()
console.log('generateDevlogFromSnapshotsDiff():')
console.log(generateDevlogFromSnapshotsDiff())
