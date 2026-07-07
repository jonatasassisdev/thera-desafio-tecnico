import { all } from "redux-saga/effects";
import { toastsSaga } from "./toasts-saga";

export function* rootSaga() {
  yield all([toastsSaga()]);
}
