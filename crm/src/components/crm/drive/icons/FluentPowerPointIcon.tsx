import type { FluentIconProps } from "./types";
import { Win11FileTypeSvg } from "./Win11FileTypeSvg";

export function FluentPowerPointIcon(props: FluentIconProps) {
  return <Win11FileTypeSvg src="/drive-icons/pptx.svg" {...props} />;
}
