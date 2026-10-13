import fs from 'fs'
import path from 'path'

const root = path.resolve('src')
const hexReplacements = [
  ['#4C2600', '#5A2D0C'],
  ['#FFDA03', '#FFD400'],
  ['#1a0f00', '#1F1F1F'],
  ['#fbf7ef', '#FAFAF8'],
  ['#fff7e6', '#FAFAF8'],
  ['#fdf0c8', '#FAFAF8'],
  ['#2b1500', '#5A2D0C'],
  ['#5c3418', '#7A4A20'],
  ['#D97706', '#FAFAF8'],
]

const classReplacements = [
  ['bg-amber-600', 'bg-[#5A2D0C]'],
  ['hover:bg-amber-700', 'hover:bg-[#FFD400]'],
  ['hover:bg-amber-400', 'hover:bg-[#FFD400]'],
  ['bg-amber-50', 'bg-[#F5F1EA]'],
  ['text-amber-800', 'text-[#5A2D0C]'],
  ['text-amber-700', 'text-[#5A2D0C]'],
  ['hover:text-amber-700', 'hover:text-[#FFD400]'],
  ['hover:text-amber-800', 'hover:text-[#FFD400]'],
  ['text-amber-600', 'text-[#FFD400]'],
  ['text-amber-500', 'text-[#FFD400]'],
  ['text-amber-300', 'text-[#FFD400]'],
  ['bg-amber-500', 'bg-[#FFD400]'],
  ['bg-amber-300', 'bg-[#FFD400]'],
  ['ring-amber-500', 'ring-[#FFD400]'],
  ['ring-amber-200', 'ring-[#FFD400]/30'],
  ['focus:ring-amber-500', 'focus:ring-[#FFD400]'],
  ['border-amber-200', 'border-[#FFD400]/30'],
  ['from-amber-50', 'from-[#F5F1EA]'],
  ['to-amber-50', 'to-[#F5F1EA]'],
  ['via-amber-50', 'via-[#F5F1EA]'],
  ['hover:bg-yellow-300', 'hover:bg-[#FFE566]'],
  ['bg-red-600', 'bg-[#E53935]'],
  ['text-red-600', 'text-[#E53935]'],
  ['text-green-400', 'text-[#22C55E]'],
  ['text-green-600', 'text-[#22C55E]'],
]

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name)
    if (fs.statSync(full).isDirectory()) walk(full, files)
    else if (/\.(jsx|js|css)$/.test(name)) files.push(full)
  }
  return files
}

let updated = 0
for (const file of walk(root)) {
  let content = fs.readFileSync(file, 'utf8')
  const original = content
  for (const [from, to] of hexReplacements) content = content.split(from).join(to)
  for (const [from, to] of classReplacements) content = content.split(from).join(to)
  if (content !== original) {
    fs.writeFileSync(file, content)
    updated++
    console.log('Updated:', path.relative(process.cwd(), file))
  }
}
console.log(`Done. Updated ${updated} files.`)
