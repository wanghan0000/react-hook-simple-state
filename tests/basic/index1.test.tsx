import React from "react";
import { test } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { useStore } from "../../src";

/** The simplest basic use */
test("simplestBasic-I", async () => {
  const DemoCompoment = () => {
    const [store] = useStore<any>("countStoreKey", { count: 0 });
    return (
      <>
        <p>{store.count}</p>
      </>
    );
  };

  const App = () => {
    const [store, setStore] = useStore<any>("countStoreKey", { count: 0 });
    return (
      <>
        <p>{store.count}</p>
        <button
          onClick={() => {
            setStore({
              count: store.count + 1,
            });
          }}
        >
          add
        </button>
        <button
          onClick={() => {
            setStore({
              count: store.count - 1,
            });
          }}
        >
          subtract
        </button>
        <DemoCompoment />
      </>
    );
  };

  const { getByText } = render(<App />);

  fireEvent.click(getByText("add"));
  // await waitFor(() => {
  //   getByText("1");
  // });

  // fireEvent.click(getByText("subtract"));
  // await waitFor(() => {
  //   getByText("0");
  // });
});
