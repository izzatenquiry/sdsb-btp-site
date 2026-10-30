import { getChatGPTUser, chatGPTSignInPath } from "@/app/chatgpt-auth";
import { Dashboard } from "@/app/dashboard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getChatGPTUser();
  if (!user) {
    return (
      <main className="signin-shell">
        <section className="signin-card">
          <span className="eyebrow">BANTING TECHNOLOGY PARK</span>
          <h1>QAQC Control</h1>
          <p>Sign in to view the private project dashboard and shared registers.</p>
          <a className="button-primary signin-button" href={chatGPTSignInPath("/")} target="_top">
            Sign in to continue
          </a>
        </section>
      </main>
    );
  }
  return <Dashboard user={{ name: user.displayName, email: user.email }} />;
}
