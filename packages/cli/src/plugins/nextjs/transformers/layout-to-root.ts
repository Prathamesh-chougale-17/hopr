import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import generate from '@babel/generator'
import * as t from '@babel/types'

/**
 * Transform Next.js layout.tsx to TanStack Start __root.tsx
 */
export function transformLayoutToRoot(content: string): string {
  // Parse the code
  const ast = parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })

  let hasMetadataExport = false
  let metadataValue: t.Expression | null = null
  let layoutComponentName = 'RootLayout'

  // First pass: collect information
  traverse(ast, {
    ExportNamedDeclaration(path) {
      const declaration = path.node.declaration
      if (t.isVariableDeclaration(declaration)) {
        const declarator = declaration.declarations[0]
        if (
          t.isIdentifier(declarator.id) &&
          declarator.id.name === 'metadata' &&
          declarator.init
        ) {
          hasMetadataExport = true
          metadataValue = declarator.init
          path.remove()
        }
      }
    },
    ExportDefaultDeclaration(path) {
      const declaration = path.node.declaration
      if (t.isFunctionDeclaration(declaration) && declaration.id) {
        layoutComponentName = declaration.id.name
      } else if (t.isIdentifier(declaration)) {
        layoutComponentName = declaration.name
      }
    },
  })

  // Second pass: transform
  traverse(ast, {
    Program(path) {
      // Add TanStack Router imports at the top
      const importDeclaration = t.importDeclaration(
        [
          t.importSpecifier(t.identifier('Outlet'), t.identifier('Outlet')),
          t.importSpecifier(t.identifier('createRootRoute'), t.identifier('createRootRoute')),
          t.importSpecifier(t.identifier('HeadContent'), t.identifier('HeadContent')),
          t.importSpecifier(t.identifier('Scripts'), t.identifier('Scripts')),
        ],
        t.stringLiteral('@tanstack/react-router')
      )

      // Check if globals.css import exists
      const hasGlobalsCss = path.node.body.some((node) => {
        if (t.isImportDeclaration(node)) {
          return node.source.value.includes('globals.css')
        }
        return false
      })

      // Add globals.css import if not present
      if (!hasGlobalsCss) {
        const cssImport = t.importDeclaration(
          [t.importDefaultSpecifier(t.identifier('appCss'))],
          t.stringLiteral('./globals.css?url')
        )
        path.node.body.unshift(cssImport)
      }

      path.node.body.unshift(importDeclaration)

      // Create Route export
      const routeExport = createRouteExport(hasMetadataExport, metadataValue, layoutComponentName)

      // Find the position to insert (after imports, before component)
      const lastImportIndex = path.node.body.findIndex(
        (node) => !t.isImportDeclaration(node)
      )

      path.node.body.splice(lastImportIndex, 0, routeExport)
    },

    // Transform default export function
    ExportDefaultDeclaration(path) {
      const declaration = path.node.declaration

      if (t.isFunctionDeclaration(declaration)) {
        // Convert to regular function
        const functionDeclaration = t.functionDeclaration(
          declaration.id || t.identifier(layoutComponentName),
          [],
          declaration.body
        )

        path.replaceWith(functionDeclaration)

        // Transform function body
        transformFunctionBody(functionDeclaration)
      }
    },

    // Remove Metadata import from next
    ImportDeclaration(path) {
      if (path.node.source.value === 'next') {
        const specifiers = path.node.specifiers.filter(
          (spec) =>
            !(t.isImportSpecifier(spec) &&
              t.isIdentifier(spec.imported) &&
              spec.imported.name === 'Metadata')
        )

        if (specifiers.length === 0) {
          path.remove()
        } else {
          path.node.specifiers = specifiers
        }
      }
    },
  })

  // Generate code
  const output = generate(ast, {
    retainLines: false,
    compact: false,
  })

  return output.code
}

/**
 * Transform function body to use Outlet and Scripts
 */
function transformFunctionBody(functionDeclaration: t.FunctionDeclaration): void {
  traverse(
    t.file(t.program([functionDeclaration])),
    {
      JSXElement(path) {
        // Find the body element and add Outlet
        if (
          t.isJSXElement(path.node) &&
          t.isJSXIdentifier(path.node.openingElement.name) &&
          path.node.openingElement.name.name === 'body'
        ) {
          const children = path.node.children.filter((child) => {
            // Remove {children} expression
            if (t.isJSXExpressionContainer(child)) {
              return !(
                t.isIdentifier(child.expression) && child.expression.name === 'children'
              )
            }
            return true
          })

          // Add Outlet and Scripts
          children.push(
            t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier('Outlet'), [], true),
              null,
              [],
              true
            ),
            t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier('Scripts'), [], true),
              null,
              [],
              true
            )
          )

          path.node.children = children
        }

        // Add HeadContent to head
        if (
          t.isJSXElement(path.node) &&
          t.isJSXIdentifier(path.node.openingElement.name) &&
          path.node.openingElement.name.name === 'head'
        ) {
          path.node.children.push(
            t.jsxElement(
              t.jsxOpeningElement(t.jsxIdentifier('HeadContent'), [], true),
              null,
              [],
              true
            )
          )
        }
      },

      // Remove children parameter
      FunctionDeclaration(path) {
        path.node.params = []
      },
    },
    undefined,
    functionDeclaration
  )
}

/**
 * Create Route export with head function
 */
function createRouteExport(
  hasMetadata: boolean,
  metadataValue: t.Expression | null,
  componentName: string
): t.ExportNamedDeclaration {
  const properties: t.ObjectProperty[] = []

  // Add head property if metadata exists
  if (hasMetadata && metadataValue) {
    const headFunction = createHeadFunction(metadataValue)
    properties.push(t.objectProperty(t.identifier('head'), headFunction))
  }

  // Add component property
  properties.push(
    t.objectProperty(t.identifier('component'), t.identifier(componentName))
  )

  const routeExport = t.exportNamedDeclaration(
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier('Route'),
        t.callExpression(t.identifier('createRootRoute'), [
          t.objectExpression(properties),
        ])
      ),
    ])
  )

  return routeExport
}

/**
 * Convert metadata object to head function
 */
function createHeadFunction(metadataValue: t.Expression): t.ArrowFunctionExpression {
  // Create head function that returns metadata structure
  return t.arrowFunctionExpression(
    [],
    t.parenthesizedExpression(
      t.objectExpression([
        t.objectProperty(
          t.identifier('meta'),
          t.arrayExpression([
            t.objectExpression([
              t.objectProperty(t.identifier('charSet'), t.stringLiteral('utf-8')),
            ]),
            t.objectExpression([
              t.objectProperty(t.identifier('name'), t.stringLiteral('viewport')),
              t.objectProperty(
                t.identifier('content'),
                t.stringLiteral('width=device-width, initial-scale=1')
              ),
            ]),
          ])
        ),
        t.objectProperty(
          t.identifier('links'),
          t.arrayExpression([
            t.objectExpression([
              t.objectProperty(t.identifier('rel'), t.stringLiteral('stylesheet')),
              t.objectProperty(t.identifier('href'), t.identifier('appCss')),
            ]),
          ])
        ),
      ])
    )
  )
}
