import type { FluentIconProps } from "./types";
import { Win11FileTypeSvg } from "./Win11FileTypeSvg";

export function FluentTextIcon(props: FluentIconProps) {
  return <Win11FileTypeSvg src="/drive-icons/txt.svg" {...props} />;
}
