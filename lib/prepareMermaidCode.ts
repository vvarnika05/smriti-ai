export default function prepareMermaidCode({ code }: { code: string }) {
  // If the code includes triple backticks, extract just the mermaid content
  if (code.includes("```mermaid")) {
    code = code.replace(/```mermaid\n([\s\S]*?)```/g, "$1");
  }

  // Handle any escaped newlines
  return code.replace(/\\n/g, "\n");
}
