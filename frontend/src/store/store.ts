import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import toastsReducer from "./slices/toasts-slice";
import { rootSaga } from "./sagas/root-saga";

export function makeStore() {
  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: {
      toasts: toastsReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware),
  });

  sagaMiddleware.run(rootSaga);

  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
