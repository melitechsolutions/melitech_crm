import React from "react";
import { FileText, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function TermsAndConditions() {
  const [, navigate] = useLocation();
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-900 dark:to-blue-950">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <a href="/" className="inline-flex items-center gap-2 text-blue-100 hover:text-white mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </a>
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-100" />
            <h1 className="text-3xl font-bold text-white">Terms & Conditions</h1>
          </div>
          <p className="text-blue-100 mt-2">Last updated: December 2024</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-3">1. Agreement to Terms</h2>
              <p>
                These Terms and Conditions constitute a legally binding agreement made between you ("you," "your" or "User")
                and Melitech CRM ("Company," "we," "us," or "our"), concerning your access to and use of the Platform,
                including all its associated features and functionalities.
              </p>
              <p>
                You agree that by accessing the Platform, you have read, understood, and agree to be bound by all of these
                Terms and Conditions. If you do not agree with our terms, then please do not access or use our Platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">2. Use License</h2>
              <p>
                Unless otherwise stated, Company owns the intellectual property rights to all material on the Platform.
                All intellectual property rights are reserved. You may access this for personal, non-commercial use
                subject to restrictions set in these Terms and Conditions.
              </p>
              <p>You must not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Republish material from the Platform without proper attribution</li>
                <li>Sell, rent, or sub-license material from the Platform</li>
                <li>Reproduce, duplicate, or copy material from the Platform for commercial purposes</li>
                <li>Redistribute content from the Platform unless content is specifically made for redistribution</li>
                <li>Access or attempt to gain unauthorized access to any portion of the Platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">3. User Responsibilities</h2>
              <p>As a user of the Platform, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain the confidentiality of your Account credentials</li>
                <li>Accept responsibility for all activities conducted under your Account</li>
                <li>Not use the Platform for any illegal or unauthorized purpose</li>
                <li>Not interfere with the normal operation of the Platform or its servers</li>
                <li>Not transmit any viruses, malware, or harmful code</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">4. Payment Terms</h2>
              <p>
                If you choose to use any paid services or features on the Platform:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You agree to pay all fees or charges that you incur</li>
                <li>We will bill you according to the payment plan you selected</li>
                <li>You authorize us to charge your payment method for all amounts due</li>
                <li>Payment must be made in the currency specified at the time of purchase</li>
                <li>All sales are final unless otherwise stated</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">5. Refund Policy</h2>
              <p>
                Refunds, if applicable, are handled on a case-by-case basis as determined by Company. To request a refund,
                you must contact our support team within 30 days of the transaction. We reserve the right to deny refund
                requests that do not meet our guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">6. Disclaimer of Warranties</h2>
              <p>
                The Platform is provided "as is" and "as available" without warranties of any kind. To the maximum extent
                permitted by law, Company disclaims all warranties, express or implied, including but not limited to
                warranties of merchantability, fitness for a particular purpose, and non-infringement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">7. Limitation of Liability</h2>
              <p>
                In no event shall Company, its directors, employees, or agents be liable to you or any third party for any
                direct, indirect, incidental, special, punitive, or consequential damages arising from or related to your
                use of the Platform, even if Company has been advised of the possibility of such damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">8. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Company and its officers, directors, employees, agents,
                and successors from and against any and all claims, damages, liabilities, costs, and expenses (including
                reasonable attorneys' fees) arising from or related to your use of the Platform or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">9. Termination</h2>
              <p>
                Company may terminate or suspend your Account and access to the Platform at any time, in our sole discretion,
                with or without cause, if you violate any provision of these Terms and Conditions or engage in any conduct
                that is unlawful or harmful.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">10. Governing Law</h2>
              <p>
                These Terms and Conditions are governed by and construed in accordance with the laws of Kenya, and you
                irrevocably submit to the exclusive jurisdiction of the courts located in Kenya.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-3">11. Contact Information</h2>
              <p>
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Email:</strong> legal@melitech.com
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Changes to Terms
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                Company reserves the right to modify these Terms and Conditions at any time.
                Your continued use of the Platform means you accept the changes.
              </p>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                &copy; 2024 Melitech CRM. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <a
                  href="/privacy-policy"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                >
                  Privacy Policy
                </a>
                <a
                  href="/documentation"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                >
                  Documentation
                </a>
                <a
                  href="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm"
                >
                  Home
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }
