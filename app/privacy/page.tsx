import AppShell from "@/src/components/layout/app-shell";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <AppShell>
      <article className="mx-auto max-w-3xl space-y-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Privacy Policy
          </h1>
          <p className="mt-2 text-xs text-zinc-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">1. Our approach</h2>
          <p>
            4K Sportsbook is designed so that users can participate with a <strong>pseudonymous</strong>{" "}
            account: we ask only for a <strong>username</strong> and <strong>password</strong>. We do not
            require your real name, email, or phone number for registration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">2. What we process</h2>
          <ul className="list-inside list-disc space-y-1 pl-1">
            <li>
              <strong>Account credentials:</strong> username and a hashed password (we never store your
              password in plain text).
            </li>
            <li>
              <strong>Activity data:</strong> bets, balances, deposits, withdrawals, and technical logs
              needed to run the sportsbook and meet legal or security obligations.
            </li>
            <li>
              <strong>Wallet addresses you provide</strong> for deposits and withdrawals (blockchain
              addresses are public by nature).
            </li>
            <li>
              <strong>Session data:</strong> when you use the site, standard information such as IP address
              and browser type may be processed by our infrastructure for security and abuse prevention.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">3. Passwords and recovery</h2>
          <p>
            You may change your password while logged in. Because we do not collect email or phone
            numbers, <strong>we cannot reset a forgotten password</strong> or prove ownership of an
            account without the credentials you chose. If you lose access or your account is locked,{" "}
            <strong>we cannot recover the account</strong> and <strong>funds may be permanently lost</strong>{" "}
            as we cannot verify your identity. You are responsible for storing your password safely.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">4. Cookies and storage</h2>
          <p>
            The app may store a session token in your browser (for example via local storage or cookies) so
            you stay logged in. You can clear this data from your device at any time, which will log you
            out.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">5. Operational emails</h2>
          <p>
            Administrators may receive internal notifications about signups, deposit requests, and
            withdrawal requests so that the service can be operated. These messages are not marketing
            newsletters.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">6. Retention</h2>
          <p>
            We retain account and transaction records for as long as needed to provide the Service, comply
            with law, resolve disputes, and enforce our agreements.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">7. Your rights</h2>
          <p>
            Depending on where you live, you may have rights to access, correct, or delete personal data.
            Because accounts are username-only, some requests may be limited where we cannot verify identity.
            Contact us through the official channels we publish for the Service if you need assistance.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">8. Changes</h2>
          <p>
            We may update this Privacy Policy. The “Last updated” date will change when we do. Continued
            use after changes means you accept the updated policy.
          </p>
        </section>

        <p className="pt-4 text-xs text-zinc-500">
          Read our{" "}
          <Link href="/terms" className="text-indigo-600 underline dark:text-indigo-400">
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </article>
    </AppShell>
  );
}
