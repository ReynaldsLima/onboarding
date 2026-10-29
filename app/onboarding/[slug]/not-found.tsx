export default function OnboardingNotFound() {
  return (
    <main className="mx-auto flex max-w-md flex-col items-center gap-2 px-6 py-24 text-center">
      <h1 className="text-xl font-semibold text-text">Link inválido</h1>
      <p className="text-muted">
        Esse link de onboarding não existe ou foi removido. Confira o link
        enviado pela equipe e tente novamente.
      </p>
    </main>
  );
}
