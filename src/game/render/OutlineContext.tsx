import { createContext, useContext } from "react";

/** True when the active theme has outline: true */
export const OutlineContext = createContext(false);

export function useOutline() {
  return useContext(OutlineContext);
}
