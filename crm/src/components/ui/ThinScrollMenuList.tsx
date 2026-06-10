"use client";

import { components, type GroupBase, type MenuListProps } from "react-select";
import { CRM_DROPDOWN_SCROLL_CLASS } from "@/utils/dropdownScrollStyles";

export function ThinScrollMenuList<Option, IsMulti extends boolean, Group extends GroupBase<Option>>(
  props: MenuListProps<Option, IsMulti, Group>
) {
  const mergedClassName = [props.className, CRM_DROPDOWN_SCROLL_CLASS].filter(Boolean).join(" ");

  return <components.MenuList {...props} className={mergedClassName} />;
}
