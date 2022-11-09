export const parentPath = (pathname) => {
  return `${pathname.substr(0, pathname.lastIndexOf("/"))}`;
};

export const addPath = (pathname) => {
  return `${pathname}/add`;
};

export const invitePath = (pathname) => {
  return `${pathname}/invite`;
};

export const viewSlugPath = (pathname, datum) => {
  return `${pathname}/${datum?.slug}`;
};

export const viewUuidPath = (pathname, datum) => {
  return `${pathname}/${datum?.uuid}`;
};

export const toCapitalized = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);
