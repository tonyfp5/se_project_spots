export function setButtonText(
  btn,
  loading,
  text = "Save",
  loadingText = "Saving..."
) {
  if (loading) {
    btn.textContent = loadingText;
  } else {
    btn.textContent = text;
  }
}