import type { FluentIconProps } from "./types";
import { Win11FileTypeSvg } from "./Win11FileTypeSvg";

export function FluentGenericFileIcon(props: FluentIconProps) {
  return <Win11FileTypeSvg src="/drive-icons/genericfile.svg" {...props} />;
}
