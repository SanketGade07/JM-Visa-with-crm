import type { SVGProps } from "react";

export type FluentIconProps = SVGProps<SVGSVGElement> & {
  size?: number | string;
};

export function fluentIconDefaults({
  size = 48,
  ...props
}: FluentIconProps): SVGProps<SVGSVGElement> {
  const dimension = typeof size === "number" ? `${size}` : size;
  return {
    width: dimension,
    height: dimension,
    viewBox: "0 0 48 48",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    role: "img",
    "aria-hidden": props["aria-label"] ? undefined : true,
    ...props,
  };
}
