// @ts-nocheck
import { parse } from "@babel/parser";
import traverse_ from "@babel/traverse";
import generate_ from "@babel/generator";
import * as t from "@babel/types";
import type { NodePath } from "@babel/traverse";

// Handle ESM/CJS interop
const traverse = (traverse_ as any).default || traverse_;
const generate = (generate_ as any).default || generate_;

/**
 * Transform Next.js layout.tsx to TanStack Start __root.tsx with new pattern
 */
export function transformLayoutToRoot(content: string): string {
  // Parse the code
  const ast = parse(content, {
    sourceType: "module",
    plugins: ["typescript", "jsx"],
  });

  let hasMetadataExport = false;
  let metadataValue: t.Expression | null = null;
  let layoutComponentName = "RootLayout";
  let originalLayoutBody: t.Statement | null = null;

  // First pass: collect information
  traverse(ast, {
    ExportNamedDeclaration(path: NodePath<t.ExportNamedDeclaration>) {
      const declaration = path.node.declaration;
      if (t.isVariableDeclaration(declaration)) {
        const declarator = declaration.declarations[0];
        if (
          t.isIdentifier(declarator.id) &&
          declarator.id.name === "metadata" &&
          declarator.init
        ) {
          hasMetadataExport = true;
          metadataValue = declarator.init;
          path.remove();
        }
      }
    },
    ExportDefaultDeclaration(path) {
      const declaration = path.node.declaration;
      if (t.isFunctionDeclaration(declaration)) {
        if (declaration.id) {
          layoutComponentName = declaration.id.name;
        }
        if (t.isBlockStatement(declaration.body)) {
          originalLayoutBody = declaration.body.body[0]; // Save the return statement
        }
      } else if (t.isIdentifier(declaration)) {
        layoutComponentName = declaration.name;
      }
    },
  });

  // Second pass: transform
  traverse(ast, {
    // Remove font variable declarations
    VariableDeclaration(path) {
      const declarations = path.node.declarations.filter((declarator) => {
        if (
          t.isIdentifier(declarator.id) &&
          declarator.init &&
          t.isCallExpression(declarator.init)
        ) {
          const callee = declarator.init.callee;
          // Remove Geist, Geist_Mono, etc font declarations
          if (
            t.isIdentifier(callee) &&
            (callee.name.includes("Geist") || callee.name.includes("Font"))
          ) {
            return false;
          }
        }
        return true;
      });

      if (declarations.length === 0) {
        path.remove();
      } else if (declarations.length !== path.node.declarations.length) {
        path.node.declarations = declarations;
      }
    },

    Program(path) {
      // Add TanStack Router imports at the top
      const routerImports = t.importDeclaration(
        [
          t.importSpecifier(t.identifier("HeadContent"), t.identifier("HeadContent")),
          t.importSpecifier(t.identifier("Scripts"), t.identifier("Scripts")),
          t.importSpecifier(
            t.identifier("createRootRoute"),
            t.identifier("createRootRoute"),
          ),
        ],
        t.stringLiteral("@tanstack/react-router"),
      );

      // Add devtools imports
      const devtoolsPanelImport = t.importDeclaration(
        [
          t.importSpecifier(
            t.identifier("TanStackRouterDevtoolsPanel"),
            t.identifier("TanStackRouterDevtoolsPanel"),
          ),
        ],
        t.stringLiteral("@tanstack/react-router-devtools"),
      );

      const devtoolsImport = t.importDeclaration(
        [
          t.importSpecifier(t.identifier("TanStackDevtools"), t.identifier("TanStackDevtools")),
        ],
        t.stringLiteral("@tanstack/react-devtools"),
      );

      // Check if globals.css import exists
      const hasGlobalsCss = path.node.body.some((node) => {
        if (t.isImportDeclaration(node)) {
          return node.source.value.includes("globals.css");
        }
        return false;
      });

      // Add globals.css import if not present
      if (!hasGlobalsCss) {
        const cssImport = t.importDeclaration(
          [t.importDefaultSpecifier(t.identifier("appCss"))],
          t.stringLiteral("./globals.css?url"),
        );
        path.node.body.unshift(cssImport);
      }

      path.node.body.unshift(devtoolsImport);
      path.node.body.unshift(devtoolsPanelImport);
      path.node.body.unshift(routerImports);

      // Create Route export with shellComponent
      const routeExport = createRouteExportWithShellComponent(
        hasMetadataExport,
        metadataValue,
      );

      // Find the position to insert (after imports, before component)
      const lastImportIndex = path.node.body.findIndex(
        (node) => !t.isImportDeclaration(node),
      );

      path.node.body.splice(lastImportIndex, 0, routeExport);
    },

    // Transform default export function to RootDocument
    ExportDefaultDeclaration(path) {
      const declaration = path.node.declaration;

      if (t.isFunctionDeclaration(declaration)) {
        // Create new RootDocument function that wraps children
        const rootDocumentFunction = createRootDocumentFunction(declaration);
        path.replaceWith(rootDocumentFunction);
      }
    },

    // Remove Next.js specific imports
    ImportDeclaration(path) {
      const source = path.node.source.value;
      // Remove next/font imports and next imports
      if (source === "next" || source.startsWith("next/font")) {
        path.remove();
      }
      // Update globals.css to use default import with ?url
      if (source === "./globals.css") {
        path.node.source.value = "./globals.css?url";
        // Change to default import: import appCss from "./globals.css?url"
        path.node.specifiers = [t.importDefaultSpecifier(t.identifier("appCss"))];
      }
    },
  });

  // Generate code
  const output = generate(ast, {
    retainLines: false,
    compact: false,
  });

  return output.code;
}

/**
 * Create Route export with shellComponent pattern
 */
function createRouteExportWithShellComponent(
  hasMetadata: boolean,
  metadataValue: t.Expression | null,
): t.ExportNamedDeclaration {
  const properties: t.ObjectProperty[] = [];

  // Add head property with metadata
  const headFunction = createHeadFunction();
  properties.push(t.objectProperty(t.identifier("head"), headFunction));

  // Add shellComponent property
  properties.push(
    t.objectProperty(t.identifier("shellComponent"), t.identifier("RootDocument")),
  );

  const routeExport = t.exportNamedDeclaration(
    t.variableDeclaration("const", [
      t.variableDeclarator(
        t.identifier("Route"),
        t.callExpression(t.identifier("createRootRoute"), [
          t.objectExpression(properties),
        ]),
      ),
    ]),
  );

  return routeExport;
}

/**
 * Create head function with proper meta tags
 */
function createHeadFunction(): t.ArrowFunctionExpression {
  return t.arrowFunctionExpression(
    [],
    t.parenthesizedExpression(
      t.objectExpression([
        t.objectProperty(
          t.identifier("meta"),
          t.arrayExpression([
            t.objectExpression([
              t.objectProperty(
                t.identifier("charSet"),
                t.stringLiteral("utf-8"),
              ),
            ]),
            t.objectExpression([
              t.objectProperty(
                t.identifier("name"),
                t.stringLiteral("viewport"),
              ),
              t.objectProperty(
                t.identifier("content"),
                t.stringLiteral("width=device-width, initial-scale=1"),
              ),
            ]),
            t.objectExpression([
              t.objectProperty(
                t.identifier("title"),
                t.stringLiteral("TanStack Start Starter"),
              ),
            ]),
          ]),
        ),
        t.objectProperty(
          t.identifier("links"),
          t.arrayExpression([
            t.objectExpression([
              t.objectProperty(
                t.identifier("rel"),
                t.stringLiteral("stylesheet"),
              ),
              t.objectProperty(t.identifier("href"), t.identifier("appCss")),
            ]),
          ]),
        ),
      ]),
    ),
  );
}

/**
 * Create RootDocument function that wraps children with devtools
 */
function createRootDocumentFunction(
  originalLayout: t.FunctionDeclaration,
): t.FunctionDeclaration {
  // Create children parameter with React.ReactNode type
  const childrenParam = t.identifier("children");
  childrenParam.typeAnnotation = t.tsTypeAnnotation(
    t.tsTypeReference(
      t.tsQualifiedName(t.identifier("React"), t.identifier("ReactNode")),
    ),
  );

  const params = [
    t.objectPattern([
      t.objectProperty(t.identifier("children"), childrenParam, false, true),
    ]),
  ];

  // Get original body JSX but replace children with {children} and devtools
  let bodyJSX: t.JSXElement | null = null;

  // Extract JSX from original layout
  traverse(
    t.file(t.program([originalLayout])),
    {
      ReturnStatement(path) {
        if (t.isJSXElement(path.node.argument)) {
          bodyJSX = path.node.argument;
        }
      },
    },
    undefined,
    originalLayout,
  );

  if (bodyJSX) {
    // Transform the body JSX
    traverse(
      t.file(t.program([t.expressionStatement(bodyJSX)])),
      {
        JSXElement(path) {
          // Find body element
          if (
            t.isJSXElement(path.node) &&
            t.isJSXIdentifier(path.node.openingElement.name) &&
            path.node.openingElement.name.name === "body"
          ) {
            // Remove {children} and add our new content
            path.node.children = [
              t.jsxExpressionContainer(t.identifier("children")),
              t.jsxElement(
                t.jsxOpeningElement(
                  t.jsxIdentifier("TanStackDevtools"),
                  [
                    t.jsxAttribute(
                      t.jsxIdentifier("config"),
                      t.jsxExpressionContainer(
                        t.objectExpression([
                          t.objectProperty(
                            t.identifier("position"),
                            t.stringLiteral("bottom-right"),
                          ),
                        ]),
                      ),
                    ),
                    t.jsxAttribute(
                      t.jsxIdentifier("plugins"),
                      t.jsxExpressionContainer(
                        t.arrayExpression([
                          t.objectExpression([
                            t.objectProperty(
                              t.identifier("name"),
                              t.stringLiteral("Tanstack Router"),
                            ),
                            t.objectProperty(
                              t.identifier("render"),
                              t.jsxElement(
                                t.jsxOpeningElement(
                                  t.jsxIdentifier("TanStackRouterDevtoolsPanel"),
                                  [],
                                  true,
                                ),
                                null,
                                [],
                                true,
                              ),
                            ),
                          ]),
                        ]),
                      ),
                    ),
                  ],
                  false,
                ),
                t.jsxClosingElement(t.jsxIdentifier("TanStackDevtools")),
                [],
                false,
              ),
              t.jsxElement(
                t.jsxOpeningElement(t.jsxIdentifier("Scripts"), [], true),
                null,
                [],
                true,
              ),
            ];

            // Remove font className if exists
            path.node.openingElement.attributes =
              path.node.openingElement.attributes.filter((attr) => {
                if (
                  t.isJSXAttribute(attr) &&
                  t.isJSXIdentifier(attr.name) &&
                  attr.name.name === "className"
                ) {
                  // Check if className contains font variables
                  if (attr.value && t.isJSXExpressionContainer(attr.value)) {
                    const expr = attr.value.expression;
                    if (t.isTemplateLiteral(expr)) {
                      const hasFontVars = expr.expressions.some((exp) => {
                        if (
                          t.isMemberExpression(exp) &&
                          t.isIdentifier(exp.object)
                        ) {
                          return (
                            exp.object.name.toLowerCase().includes("geist") ||
                            exp.object.name.toLowerCase().includes("font")
                          );
                        }
                        return false;
                      });
                      if (hasFontVars) {
                        return false; // Remove the className
                      }
                    }
                  }
                }
                return true;
              });
          }

          // Add HeadContent to head
          if (
            t.isJSXElement(path.node) &&
            t.isJSXIdentifier(path.node.openingElement.name) &&
            path.node.openingElement.name.name === "head"
          ) {
            path.node.children.push(
              t.jsxElement(
                t.jsxOpeningElement(t.jsxIdentifier("HeadContent"), [], true),
                null,
                [],
                true,
              ),
            );
          }
        },
      },
      undefined,
      bodyJSX,
    );
  }

  // Create the function body
  const functionBody = t.blockStatement([t.returnStatement(bodyJSX)]);

  return t.functionDeclaration(
    t.identifier("RootDocument"),
    params,
    functionBody,
  );
}
