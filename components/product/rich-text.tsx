import { Fragment, type ReactNode } from "react";

function renderInline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : (
        <Fragment key={index}>{part}</Fragment>
      ),
    );
}

/**
 * Markdown mínimo: párrafos, listas con "- " y **negrita**. No interpreta HTML,
 * así que la descripción guardada en la base de datos no puede inyectar marcado.
 */
export function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).filter((block) => block.trim().length > 0);

  return (
    <div className="space-y-3 text-[15px] leading-relaxed">
      {blocks.map((block, index) => {
        const lines = block.split("\n");
        if (lines.every((line) => line.startsWith("- "))) {
          return (
            <ul key={index} className="list-disc space-y-1 pl-5">
              {lines.map((line) => (
                <li key={line}>{renderInline(line.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return <p key={index}>{renderInline(block)}</p>;
      })}
    </div>
  );
}
