/**
 * UiStateContext - UI-specific state management
 *
 * This context handles UI state like sidebar visibility, active views,
 * modals, toasts, and other UI-specific interactions.
 */

import React, { createContext, useContext, useReducer, ReactNode, useMemo } from "react";
import { Toast } from "@/types/ui-types";

// Types
interface UiStateState {
  // Navigation
  sidebarOpen: boolean;
  activePage: string;
  activeView: string;

  // Modals
  activeModals: {
    id: string;
    props?: Record<string, any>;
  }[];

  // Notifications
  toasts: Toast[];

  // UI State
  isLoading: boolean;
  loadingMessage?: string;
  contextMenuOpen: boolean;
  contextMenuPosition?: { x: number; y: number };
  contextMenuItems?: { id: string; label: string; action: string }[];

  // Drawers
  rightDrawerOpen: boolean;
  rightDrawerContent?: string;
  rightDrawerSize: number; // in pixels

  // Mobile view
  isMobileMenuOpen: boolean;
}

type UiStateAction =
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SIDEBAR"; payload: boolean }
  | { type: "SET_ACTIVE_PAGE"; payload: string }
  | { type: "SET_ACTIVE_VIEW"; payload: string }
  | { type: "OPEN_MODAL"; payload: { id: string; props?: Record<string, any> } }
  | { type: "CLOSE_MODAL"; payload: string }
  | { type: "CLOSE_ALL_MODALS" }
  | { type: "ADD_TOAST"; payload: Toast }
  | { type: "REMOVE_TOAST"; payload: string }
  | { type: "CLEAR_TOASTS" }
  | { type: "SET_LOADING"; payload: { isLoading: boolean; message?: string } }
  | {
      type: "OPEN_CONTEXT_MENU";
      payload: {
        position: { x: number; y: number };
        items: { id: string; label: string; action: string }[];
      };
    }
  | { type: "CLOSE_CONTEXT_MENU" }
  | { type: "TOGGLE_RIGHT_DRAWER" }
  | { type: "SET_RIGHT_DRAWER"; payload: { open: boolean; content?: string; size?: number } }
  | { type: "TOGGLE_MOBILE_MENU" }
  | { type: "SET_MOBILE_MENU"; payload: boolean };

interface UiStateContextType extends UiStateState {
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;
  setActivePage: (page: string) => void;
  setActiveView: (view: string) => void;
  openModal: (id: string, props?: Record<string, any>) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  setLoading: (isLoading: boolean, message?: string) => void;
  openContextMenu: (
    position: { x: number; y: number },
    items: { id: string; label: string; action: string }[]
  ) => void;
  closeContextMenu: () => void;
  toggleRightDrawer: () => void;
  setRightDrawer: (open: boolean, content?: string, size?: number) => void;
  toggleMobileMenu: () => void;
  setMobileMenu: (open: boolean) => void;
}

// Default state
const defaultState: UiStateState = {
  sidebarOpen: true,
  activePage: "dashboard",
  activeView: "default",
  activeModals: [],
  toasts: [],
  isLoading: false,
  contextMenuOpen: false,
  rightDrawerOpen: false,
  rightDrawerSize: 320,
  isMobileMenuOpen: false,
};

// Create context
const UiStateContext = createContext<UiStateContextType | undefined>(undefined);

// Reducer function
const uiStateReducer = (state: UiStateState, action: UiStateAction): UiStateState => {
  switch (action.type) {
    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case "SET_SIDEBAR":
      return { ...state, sidebarOpen: action.payload };
    case "SET_ACTIVE_PAGE":
      return { ...state, activePage: action.payload };
    case "SET_ACTIVE_VIEW":
      return { ...state, activeView: action.payload };
    case "OPEN_MODAL":
      return {
        ...state,
        activeModals: [...state.activeModals, action.payload],
      };
    case "CLOSE_MODAL":
      return {
        ...state,
        activeModals: state.activeModals.filter((modal) => modal.id !== action.payload),
      };
    case "CLOSE_ALL_MODALS":
      return { ...state, activeModals: [] };
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.payload, ...state.toasts].slice(0, 5), // Limit to 5 toasts
      };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload),
      };
    case "CLEAR_TOASTS":
      return { ...state, toasts: [] };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload.isLoading,
        loadingMessage: action.payload.message,
      };
    case "OPEN_CONTEXT_MENU":
      return {
        ...state,
        contextMenuOpen: true,
        contextMenuPosition: action.payload.position,
        contextMenuItems: action.payload.items,
      };
    case "CLOSE_CONTEXT_MENU":
      return {
        ...state,
        contextMenuOpen: false,
        contextMenuPosition: undefined,
        contextMenuItems: undefined,
      };
    case "TOGGLE_RIGHT_DRAWER":
      return { ...state, rightDrawerOpen: !state.rightDrawerOpen };
    case "SET_RIGHT_DRAWER":
      return {
        ...state,
        rightDrawerOpen: action.payload.open,
        rightDrawerContent: action.payload.content || state.rightDrawerContent,
        rightDrawerSize: action.payload.size || state.rightDrawerSize,
      };
    case "TOGGLE_MOBILE_MENU":
      return { ...state, isMobileMenuOpen: !state.isMobileMenuOpen };
    case "SET_MOBILE_MENU":
      return { ...state, isMobileMenuOpen: action.payload };
    default:
      return state;
  }
};

// Provider component
export const UiStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(uiStateReducer, defaultState);

  // Create a unique ID for toasts
  const createId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  };

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo<UiStateContextType>(
    () => ({
      ...state,
      toggleSidebar: () => dispatch({ type: "TOGGLE_SIDEBAR" }),
      setSidebar: (open: boolean) => dispatch({ type: "SET_SIDEBAR", payload: open }),
      setActivePage: (page: string) => dispatch({ type: "SET_ACTIVE_PAGE", payload: page }),
      setActiveView: (view: string) => dispatch({ type: "SET_ACTIVE_VIEW", payload: view }),
      openModal: (id: string, props?: Record<string, any>) =>
        dispatch({ type: "OPEN_MODAL", payload: { id, props } }),
      closeModal: (id: string) => dispatch({ type: "CLOSE_MODAL", payload: id }),
      closeAllModals: () => dispatch({ type: "CLOSE_ALL_MODALS" }),
      addToast: (toast: Omit<Toast, "id">) =>
        dispatch({ type: "ADD_TOAST", payload: { ...toast, id: createId() } }),
      removeToast: (id: string) => dispatch({ type: "REMOVE_TOAST", payload: id }),
      clearToasts: () => dispatch({ type: "CLEAR_TOASTS" }),
      setLoading: (isLoading: boolean, message?: string) =>
        dispatch({ type: "SET_LOADING", payload: { isLoading, message } }),
      openContextMenu: (
        position: { x: number; y: number },
        items: { id: string; label: string; action: string }[]
      ) => dispatch({ type: "OPEN_CONTEXT_MENU", payload: { position, items } }),
      closeContextMenu: () => dispatch({ type: "CLOSE_CONTEXT_MENU" }),
      toggleRightDrawer: () => dispatch({ type: "TOGGLE_RIGHT_DRAWER" }),
      setRightDrawer: (open: boolean, content?: string, size?: number) =>
        dispatch({ type: "SET_RIGHT_DRAWER", payload: { open, content, size } }),
      toggleMobileMenu: () => dispatch({ type: "TOGGLE_MOBILE_MENU" }),
      setMobileMenu: (open: boolean) => dispatch({ type: "SET_MOBILE_MENU", payload: open }),
    }),
    [state]
  );

  return <UiStateContext.Provider value={contextValue}>{children}</UiStateContext.Provider>;
};

// Custom hook to use the UI state context
export const useUiState = (): UiStateContextType => {
  const context = useContext(UiStateContext);

  if (context === undefined) {
    throw new Error("useUiState must be used within a UiStateProvider");
  }

  return context;
};

export default UiStateContext;
