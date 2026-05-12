import { useState } from "react";

export function ErrBar({ e }: { e?: string }) {
  const [error, setError] = useState(e);
  if (!e) return null;
  return (
    <button type="button" style={{ border: 0 }} onClick={() => setError(undefined)}>
      ${error}
    </button>
  );
}
