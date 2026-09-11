import { createContext, type RefObject } from "react";

interface contextProps {
  isImportaintFocusRef: RefObject<boolean>;
}

export const FocusContext = createContext<contextProps | undefined>(undefined);
