import type { FluentIconProps } from "./types";
import { Win11FileTypeSvg } from "./Win11FileTypeSvg";

export function FluentImageIcon(props: FluentIconProps) {
  return <Win11FileTypeSvg src="/drive-icons/photo.svg" {...props} />;
}
