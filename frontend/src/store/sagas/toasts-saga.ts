import { nanoid } from "@reduxjs/toolkit";
import { delay, put, takeEvery } from "redux-saga/effects";
import { notify, toastDismissed, toastShown, type Toast } from "../slices/toasts-slice";

const TOAST_DURATION_MS = 4000;

function* handleNotify(action: ReturnType<typeof notify>) {
  const toast: Toast = { id: nanoid(), ...action.payload };
  yield put(toastShown(toast));
  yield delay(TOAST_DURATION_MS);
  yield put(toastDismissed(toast.id));
}

export function* toastsSaga() {
  yield takeEvery(notify.type, handleNotify);
}
