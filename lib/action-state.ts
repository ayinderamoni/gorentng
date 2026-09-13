export type FormActionState = { error?: string };

export function isNextRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export function actionError(error: unknown): FormActionState {
  return { error: error instanceof Error ? error.message : "Something went wrong" };
}
