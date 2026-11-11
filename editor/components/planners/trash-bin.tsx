export function TrashBin() {
  return (
    <trash-bin>
      <style>{`
    trash-bin { display: block }
`}</style>
      <details>
        <summary>
          <span className="noinvert">🗑️</span> Scraps
        </summary>
      </details>
    </trash-bin>
  );
}
