import { useMemo, useState } from "react";

export function ErrBar({ e }: { e?: string }) {
  const [error, setError] = useState(e);

  useMemo(() => {
    if (e != error) setError(e);
    return e;
  }, [e]);

  if (!error) return null;

  return (
    <button type="button" className="notbutton" onClick={() => setError(undefined)}>
      {error}
    </button>
  );
}
