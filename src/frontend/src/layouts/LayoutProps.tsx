/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

export interface LayoutProps {
  open?: boolean;
}

export interface NavTopBarProps extends LayoutProps {
  handleDrawerOpen: () => void;
}

export interface SideBarProps extends LayoutProps {
  handleDrawerClose: () => void;
}
