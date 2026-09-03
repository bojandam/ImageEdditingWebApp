import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

interface contextProps {
  isImportaintFocusRef: RefObject<boolean>;
}

export const FocusContext = createContext<contextProps | undefined>(undefined);
