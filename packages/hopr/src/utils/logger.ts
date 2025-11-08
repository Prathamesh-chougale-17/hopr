import picocolors from 'picocolors'

const { bold, cyan, green, yellow, red, dim, blue } = picocolors

export const logger = {
  info(message: string): void {
    console.log(cyan('ℹ'), message)
  },

  success(message: string): void {
    console.log(green('✔'), message)
  },

  warn(message: string): void {
    console.log(yellow('⚠'), message)
  },

  error(message: string): void {
    console.log(red('✖'), message)
  },

  debug(message: string): void {
    console.log(dim(message))
  },

  header(message: string): void {
    console.log('\n' + bold(blue(message)))
  },

  step(message: string): void {
    console.log(bold('→'), message)
  },

  blank(): void {
    console.log()
  },
}
