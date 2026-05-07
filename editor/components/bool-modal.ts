export async function showConfirm(message: string) {
  const dialog = document.createElement("dialog");
  dialog.innerHTML = `
    <p>${message}</p>
    <button id="cancel" type="button">Cancel</button>
    <button id="confirm" type="button">Confirm</button>
  `;
  document.body.appendChild(dialog);

  return new Promise<boolean>(resolve => {
    dialog.showModal();

    const cleanup = (value: boolean) => {
      dialog.close();
      dialog.remove(); // Cleanup DOM
      resolve(value);
    };

    dialog.onclose = () => cleanup(false);
    dialog.querySelector<HTMLDialogElement>("#confirm")!.onclick = () => cleanup(true);
    dialog.querySelector<HTMLDialogElement>("#cancel")!.onclick = () => cleanup(false);
  });
}

// // 3. Usage
// async function handleDelete() {
//   const confirmed = await showConfirm("Are you sure you want to delete this?");
//   if (confirmed) {
//     console.log("Deleted!");
//   } else {
//     console.log("Action cancelled.");
//   }
// }
