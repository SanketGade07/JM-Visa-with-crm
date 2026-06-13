import type { FluentIconProps } from "./types";
import { Win11FileTypeSvg } from "./Win11FileTypeSvg";

export function FluentArchiveIcon(props: FluentIconProps) {
  return <Win11FileTypeSvg src="/drive-icons/archive.svg" {...props} />;
}
