import type { FluentIconProps } from "./types";
import { Win11FileTypeSvg } from "./Win11FileTypeSvg";

export function FluentWordIcon(props: FluentIconProps) {
  return <Win11FileTypeSvg src="/drive-icons/docx.svg" {...props} />;
}
