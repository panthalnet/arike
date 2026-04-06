/**
 * Icon utility functions (client-safe, no database dependencies)
 */

/**
 * Validate icon reference format
 */
export function validateIconReference(icon: string): boolean {
  const iconRegex = /^(builtin:(material|simple):[a-z0-9-]+|upload:[a-f0-9-]+\.(png|jpg|jpeg|webp|svg))$/
  return iconRegex.test(icon)
}

/**
 * Parse icon reference to get type and identifier
 */
export function parseIconReference(icon: string): {
  type: 'material' | 'simple' | 'upload'
  identifier: string
} {
  if (icon.startsWith('builtin:material:')) {
    return {
      type: 'material',
      identifier: icon.replace('builtin:material:', ''),
    }
  } else if (icon.startsWith('builtin:simple:')) {
    return {
      type: 'simple',
      identifier: icon.replace('builtin:simple:', ''),
    }
  } else if (icon.startsWith('upload:')) {
    return {
      type: 'upload',
      identifier: icon.replace('upload:', ''),
    }
  }

  throw new Error('Invalid icon reference format')
}

/**
 * Validate URL format (must be http or https)
 */
export function validateUrl(url: string): boolean {
  const urlRegex = /^https?:\/\/.+/
  return urlRegex.test(url)
}
