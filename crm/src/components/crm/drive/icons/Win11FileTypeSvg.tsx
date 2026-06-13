import type { FluentIconProps } from "./types";

type Win11FileTypeSvgProps = FluentIconProps & {
  src: string;
};

export function Win11FileTypeSvg({
  src,
  size = 48,
  className,
}: Win11FileTypeSvgProps) {
  const dimension =
    typeof size === "number" ? size : Number.parseInt(String(size), 10) || 48;

  return (
    // Official Microsoft file-type SVGs; img avoids gradient id collisions when many icons render.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      width={dimension}
      height={dimension}
      className={["block shrink-0 max-w-none max-h-none", className]
        .filter(Boolean)
        .join(" ")}
      style={{ width: dimension, height: dimension }}
      alt=""
      aria-hidden
      draggable={false}
    />
  );
}
