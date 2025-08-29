export const parseSize = (size: number) => {
  const units = ['B', 'K', 'M', 'G', 'T']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${+size.toFixed(2)} ${units[index]}`
}
