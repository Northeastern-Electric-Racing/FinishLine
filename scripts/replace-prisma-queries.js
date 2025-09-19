// replaces direct Prisma read queries with singleFlight calls

import fs from "fs";
import path from "path";
import recast from "recast";
import { parse } from "@babel/parser";

const parser = {
  parse(source) {
    return parse(source, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });
  },
};

const projectDir = "../src/backend/src/services";

// Prisma read-only methods
const queryMethods = new Set([
  "findMany",
  "findUnique",
  "findFirst",
  "aggregate",
  "count",
  "groupBy",
]);

function processFile(filePath) {
  const code = fs.readFileSync(filePath, "utf-8");
  const ast = recast.parse(code, { parser });

  let modified = false;
  let importAdded = false;

  const { visit, types: { builders: b } } = recast;

  // Check if singleFlight is already imported
  visit(ast, {
    visitImportDeclaration(path) {
      const decl = path.node;
      if (
        decl.specifiers.some(
          s => s.type === "ImportSpecifier" && s.imported.name === "singleFlight"
        )
      ) {
        importAdded = true;
      }
      this.traverse(path);
    },
  });

  // Replace Prisma read queries with singleFlight
  visit(ast, {
    visitCallExpression(path) {
      const node = path.node;

      // prisma.<model>.<method>(args)
      if (
        node.callee.type === "MemberExpression" &&
        node.callee.object.type === "MemberExpression" &&
        node.callee.object.object.type === "Identifier" &&
        node.callee.object.object.name === "prisma"
      ) {
        const model = node.callee.object.property.name;
        const method = node.callee.property.name;

        if (!queryMethods.has(method)) return false; // skip mutations

        const args = node.arguments[0] || b.objectExpression([]);

        // Build singleFlight call: singleFlight<any>('model', 'method', args)
        const sfCall = b.callExpression(
          b.identifier("singleFlight"),
          [
            b.stringLiteral(model),
            b.stringLiteral(method),
            args,
          ]
        );

        // Add generic <any>
        sfCall.typeParameters = b.tsTypeParameterInstantiation([
          b.tsAnyKeyword(),
        ]);

        path.replace(sfCall);
        modified = true;
      }

      this.traverse(path);
    },
  });

  // Add import at top if missing
if (modified && !importAdded) {
  const importDecl = b.importDeclaration(
    [b.importDefaultSpecifier(b.identifier("singleFlight"))], // default import
    b.stringLiteral("./single-flight") // path to file
  );
  ast.program.body.unshift(importDecl);
}


  if (modified) {
    const output = recast.print(ast).code;
    fs.writeFileSync(filePath, output, "utf-8");
    console.log("Updated:", filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
      processFile(fullPath);
    }
  }
}

walkDir(projectDir);
