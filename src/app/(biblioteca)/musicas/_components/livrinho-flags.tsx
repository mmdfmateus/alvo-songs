import {
  LIVRINHO_FLAG_LABEL,
  type LivrinhoFlag,
} from "~/lib/livrinho-import";

export function LivrinhoFlags({ flags }: { flags: LivrinhoFlag[] }) {
  if (flags.length === 0) return null;

  return (
    <ul className="mt-1 flex flex-wrap gap-1">
      {flags.map((flag) => (
        <li
          key={flag}
          className="rounded-full bg-[#f0f0ec] px-2 py-0.5 text-xs font-medium text-muted-foreground"
        >
          {LIVRINHO_FLAG_LABEL[flag]}
        </li>
      ))}
    </ul>
  );
}
