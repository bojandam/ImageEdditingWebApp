import { createContext, type RefObject } from "react";

interface contextProps {
  isImportaintFocusRef: RefObject<boolean>;
  focusCanvas: () => void;
}

export const FocusContext = createContext<contextProps | undefined>(undefined);
