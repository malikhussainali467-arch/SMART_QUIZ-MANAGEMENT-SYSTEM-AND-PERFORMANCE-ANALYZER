// Shows a spinner / error / content for the result of useFetch.
//   <Async state={fetchState}>{(data) => <Page data={data} />}</Async>
export function Loader() {
  return (
    <div className="loader">
      <div className="spinner" role="progressbar" aria-label="Loading" />
    </div>
  );
}

export default function Async({ state, children }) {
  if (state.error) return <div className="notice notice-bad">{state.error}</div>;
  if (state.loading && !state.data) return <Loader />;
  return children(state.data);
}
