// @ts-nocheck
import { parse } from '@babel/parser'
import traverse_ from '@babel/traverse'
import generate_ from '@babel/generator'
import * as t from '@babel/types'

// Handle ESM/CJS interop
const traverse = (traverse_ as any).default || traverse_
const generate = (generate_ as any).default || generate_

/**
 * Transform Next.js page.tsx to TanStack Start route
 */
export function transformPageToRoute(content: string, routePath: string): string {
  const ast = parse(content, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  })

  let componentName = 'Page'
  let hasAsyncComponent = false
  let hasParams = false
  let hasSearchParams = false

  // First pass: analyze
  traverse(ast, {
    ExportDefaultDeclaration(path) {
      const declaration = path.node.declaration

      if (t.isFunctionDeclaration(declaration)) {
        if (declaration.id) {
          componentName = declaration.id.name
        }
        hasAsyncComponent = declaration.async || false

        // Check parameters
        if (declaration.params.length > 0) {
          const firstParam = declaration.params[0]
          if (t.isObjectPattern(firstParam)) {
            firstParam.properties.forEach((prop) => {
              if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                if (prop.key.name === 'params') hasParams = true
                if (prop.key.name === 'searchParams') hasSearchParams = true
              }
            })
          }
        }
      }
    },
  })

  // Second pass: transform
  traverse(ast, {
    Program(path) {
      // Add TanStack Router imports
      const imports = [t.importSpecifier(t.identifier('createFileRoute'), t.identifier('createFileRoute'))]

      const importDeclaration = t.importDeclaration(imports, t.stringLiteral('@tanstack/react-router'))

      path.node.body.unshift(importDeclaration)

      // Create Route export
      const routeExport = createRouteExport(
        routePath,
        componentName,
        hasAsyncComponent,
        hasParams,
        hasSearchParams
      )

      const lastImportIndex = path.node.body.findIndex((node) => !t.isImportDeclaration(node))
      path.node.body.splice(lastImportIndex, 0, routeExport)
    },

    // Transform default export
    ExportDefaultDeclaration(path) {
      const declaration = path.node.declaration

      if (t.isFunctionDeclaration(declaration)) {
        // Convert to regular function
        const functionDeclaration = t.functionDeclaration(
          declaration.id || t.identifier(componentName),
          [],
          declaration.body,
          false, // Remove async
          false
        )

        path.replaceWith(functionDeclaration)

        // Transform function body
        transformFunctionBody(functionDeclaration, hasParams, hasSearchParams, hasAsyncComponent)
      }
    },

    // Remove Next.js specific imports
    ImportDeclaration(path) {
      const source = path.node.source.value
      // Remove next, next/image, next/headers, next/navigation, etc.
      if (source === 'next' || source.startsWith('next/')) {
        path.remove()
      }
    },

    // Transform Next.js Image to standard img
    JSXElement(path) {
      const openingElement = path.node.openingElement
      if (t.isJSXIdentifier(openingElement.name) && openingElement.name.name === 'Image') {
        // Change to lowercase img
        openingElement.name.name = 'img'

        // Also update closing element if it exists
        if (path.node.closingElement && t.isJSXIdentifier(path.node.closingElement.name)) {
          path.node.closingElement.name.name = 'img'
        }

        // Remove Next.js specific props (priority, fill, etc.)
        openingElement.attributes = openingElement.attributes.filter((attr) => {
          if (t.isJSXAttribute(attr) && t.isJSXIdentifier(attr.name)) {
            const propName = attr.name.name
            // Remove Next.js specific Image props
            return !['priority', 'fill', 'quality', 'placeholder', 'blurDataURL', 'loading'].includes(propName as string)
          }
          return true
        })
      }
    },
  })

  const output = generate(ast, {
    retainLines: false,
    compact: false,
  })

  return output.code
}

/**
 * Transform function body to use Route hooks
 */
function transformFunctionBody(
  functionDeclaration: t.FunctionDeclaration,
  hasParams: boolean,
  hasSearchParams: boolean,
  wasAsync: boolean
): void {
  const statements: t.Statement[] = []

  // Add hook calls at the beginning
  if (hasParams) {
    statements.push(
      t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier('params'),
          t.callExpression(
            t.memberExpression(t.identifier('Route'), t.identifier('useParams')),
            []
          )
        ),
      ])
    )
  }

  if (hasSearchParams) {
    statements.push(
      t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier('searchParams'),
          t.callExpression(
            t.memberExpression(t.identifier('Route'), t.identifier('useSearch')),
            []
          )
        ),
      ])
    )
  }

  if (wasAsync) {
    statements.push(
      t.variableDeclaration('const', [
        t.variableDeclarator(
          t.identifier('data'),
          t.callExpression(
            t.memberExpression(t.identifier('Route'), t.identifier('useLoaderData')),
            []
          )
        ),
      ])
    )
  }

  // Prepend to existing body
  if (t.isBlockStatement(functionDeclaration.body)) {
    functionDeclaration.body.body = [...statements, ...functionDeclaration.body.body]
  }

  // Remove await expressions for params
  traverse(
    t.file(t.program([functionDeclaration])),
    {
      VariableDeclarator(path) {
        if (
          t.isObjectPattern(path.node.id) &&
          t.isAwaitExpression(path.node.init)
        ) {
          const init = path.node.init.argument
          if (t.isIdentifier(init) && (init.name === 'params' || init.name === 'searchParams')) {
            path.remove()
          }
        }
      },
    },
    undefined,
    functionDeclaration
  )
}

/**
 * Create Route export
 */
function createRouteExport(
  routePath: string,
  componentName: string,
  hasAsync: boolean,
  _hasParams: boolean,
  _hasSearchParams: boolean
): t.ExportNamedDeclaration {
  const properties: t.ObjectProperty[] = []

  // Add component property
  properties.push(t.objectProperty(t.identifier('component'), t.identifier(componentName)))

  // If async, add loader placeholder comment
  if (hasAsync) {
    // Note: We'll add a comment in the generated code suggesting to add loader
  }

  const routeExport = t.exportNamedDeclaration(
    t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier('Route'),
        t.callExpression(t.identifier('createFileRoute'), [
          t.stringLiteral(routePath),
          t.objectExpression(properties),
        ])
      ),
    ])
  )

  return routeExport
}
