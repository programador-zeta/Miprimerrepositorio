import { createInterface } from "node:readline";
for await (const line of createInterface({ input: process.stdin })) {
  if (/key:|Database URL:|JWT secret:/i.test(line))
    console.log("[local connection value hidden]");
  else console.log(line);
}
