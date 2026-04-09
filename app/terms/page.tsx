import AppShell from "@/src/components/layout/app-shell";
import Link from "next/link";

export default function TermsPage() {
  return (
    <AppShell>
      <article className="mx-auto max-w-3xl space-y-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-xs text-zinc-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">1. Agreement</h2>
          <p>
            By accessing or using 4K Sportsbook (“the Service”), you agree to these Terms. If you do not
            agree, do not use the Service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">2. Eligibility</h2>
          <p>
            You must be <strong>18 years of age or older</strong> and legally allowed to use sports
            betting products in your jurisdiction. You are responsible for complying with local laws.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">3. Accounts</h2>
          <p>
            Accounts are intentionally minimal: we only require a <strong>username</strong> and{" "}
            <strong>password</strong>. You may update your password while logged in. You must keep your
            credentials confidential. You are responsible for all activity under your account.
          </p>
          <p>
            <strong>Lost access:</strong> We do not collect email, phone, or government ID. If you forget
            your password or your account becomes locked, we cannot verify identity and{" "}
            <strong>recovery is not available</strong>. Any balance may be forfeited per our policies and
            applicable rules.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">4. Deposits</h2>
          <p>
            Deposits are submitted as requests with transaction proof. Each request must be between{" "}
            <strong>10 USDT</strong> and <strong>10,000 USDT</strong>. An administrator reviews and may
            approve or reject requests. When your <strong>first</strong> deposit is approved, a welcome
            bonus may be credited according to the rules shown in the product (e.g. a percentage of that
            deposit).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">5. Withdrawals</h2>
          <p>
            You may save external wallet addresses and request withdrawals. Withdrawals require manual
            approval. To protect the platform and users, withdrawals may only become available after you
            have received an approved first deposit, have staked more than the total of that deposit plus
            its welcome bonus, and have at least one winning settled bet. Fees on-chain are your
            responsibility unless stated otherwise.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">6. Betting</h2>
          <p>
            Odds are displayed for events we offer. Stakes are debited from your balance when a ticket is
            placed. Settlement follows the rules of each market and event status. We may void or adjust
            outcomes where the rules require it.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">7. Prohibited conduct</h2>
          <p>
            You may not manipulate the Service, use multiple accounts to abuse bonuses, or use the Service
            where it is illegal. We may suspend or terminate accounts that breach these Terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">8. Limitation of liability</h2>
          <p>
            The Service is provided “as is.” To the maximum extent permitted by law, we are not liable for
            indirect or consequential losses. Nothing in these Terms excludes liability that cannot be
            excluded by law.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">9. Changes</h2>
          <p>We may update these Terms. Continued use after changes constitutes acceptance.</p>
        </section>

        <p className="pt-4 text-xs text-zinc-500">
          See also our{" "}
          <Link href="/privacy" className="text-indigo-600 underline dark:text-indigo-400">
            Privacy Policy
          </Link>
          .
        </p>
      </article>
    </AppShell>
  );
}
