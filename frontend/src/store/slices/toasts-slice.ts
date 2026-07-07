import { createAction, createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type ToastTone = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  tone: ToastTone;
}

interface ToastsState {
  items: Toast[];
}

const initialState: ToastsState = { items: [] };

export const notify = createAction<{ message: string; tone: ToastTone }>("toasts/notify");

const toastsSlice = createSlice({
  name: "toasts",
  initialState,
  reducers: {
    toastShown(state, action: PayloadAction<Toast>) {
      state.items.push(action.payload);
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.items = state.items.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { toastShown, toastDismissed } = toastsSlice.actions;
export default toastsSlice.reducer;
