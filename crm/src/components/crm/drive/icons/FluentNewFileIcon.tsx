import type { FluentIconProps } from "./types";
import { Win11FileTypeSvg } from "./Win11FileTypeSvg";

export function FluentNewFileIcon(props: FluentIconProps) {
  return <Win11FileTypeSvg src="/drive-icons/newfile.svg" {...props} />;
}
