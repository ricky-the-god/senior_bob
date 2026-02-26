function setRootAttr(attr: string, value: string) {
  document.documentElement.setAttribute(attr, value);
}

export const applyContentLayout = (value: "centered" | "full-width") => setRootAttr("data-content-layout", value);
export const applyNavbarStyle = (value: "sticky" | "scroll") => setRootAttr("data-navbar-style", value);
export const applySidebarVariant = (value: string) => setRootAttr("data-sidebar-variant", value);
export const applySidebarCollapsible = (value: string) => setRootAttr("data-sidebar-collapsible", value);
export const applyFont = (value: string) => setRootAttr("data-font", value);
