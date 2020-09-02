import { exec, OutputMode } from "https://deno.land/x/exec/mod.ts";
import { serve } from "https://deno.land/std/http/server.ts";
const server = serve({ port: 8000 });
console.log("http://localhost:8000/");
for await (const req of server) {
  const response = await exec('ls', {output: OutputMode.Capture});
  req.respond({ body: response.output });
}