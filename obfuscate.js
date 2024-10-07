import JavaScriptObfuscator from "javascript-obfuscator";
import fs from "fs";
import path from "path";

const filesToObfuscate = [
  { input: "richbull.js", output: "dist/richbull.js" },
  { input: "helpers/ApiService.js", output: "dist/helpers/ApiService.js" },
];

filesToObfuscate.forEach((file) => {
  const sourceCode = fs.readFileSync(
    path.join(process.cwd(), file.input),
    "utf8"
  );

  const obfuscatedCode = JavaScriptObfuscator.obfuscate(sourceCode, {
    compact: true,
    controlFlowFlattening: true,
    deadCodeInjection: true,
    debugProtection: true,
    stringArray: true,
    rotateStringArray: true,
    stringArrayEncoding: ["base64"],
    splitStrings: true,
    splitStringsChunkLength: 10,
  }).getObfuscatedCode();

  fs.mkdirSync(path.dirname(path.join(process.cwd(), file.output)), {
    recursive: true,
  });
  fs.writeFileSync(path.join(process.cwd(), file.output), obfuscatedCode);

  console.log(
    `Mã nguồn của file ${file.input} đã được làm rối và lưu tại ${file.output}`
  );
});
