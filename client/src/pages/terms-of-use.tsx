import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateMetaTags } from '@/utils/seo';

export default function TermsOfUse() {
  useEffect(() => {
    updateMetaTags(
      'Terms of Use - OwnItRight Property Advisory',
      'Terms and conditions for using OwnItRight property advisory services. Understand your rights and responsibilities when using our platform.',
      'terms of use, terms and conditions, legal, property advisory, OwnItRight',
      undefined,
      `${window.location.origin}/terms-of-use`
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-4">Terms of Use</CardTitle>
            <p className="text-gray-600 text-center">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using OwnItRight's website and services ("Platform"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
              <p className="text-gray-700 mb-4">
                OwnItRight provides property advisory services including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Property search and discovery platform</li>
                <li>Professional property valuation reports</li>
                <li>Civil and MEP engineering assessments</li>
                <li>Legal due diligence tracking</li>
                <li>Property consultation and advisory services</li>
                <li>Market analysis and investment guidance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Registration</h2>
              <div className="space-y-4">
                <p className="text-gray-700">
                  To access certain features, you must register for an account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of unauthorized use</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Service Fees:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Property valuation reports: ₹2,499 per report</li>
                  <li>Civil & MEP reports: ₹2,499 per report</li>
                  <li>Consultation services: As quoted individually</li>
                </ul>
                <h3 className="text-lg font-medium mb-2">Payment Processing:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>All payments are processed securely through Razorpay</li>
                  <li>Payment is required before report delivery</li>
                  <li>All fees are inclusive of applicable taxes</li>
                  <li>Refunds are subject to our refund policy</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Service Disclaimers</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Advisory Nature:</h3>
                <p className="text-gray-700 mb-4">
                  Our services are advisory in nature. We provide information and analysis to assist in decision-making but do not guarantee specific outcomes or investment returns.
                </p>
                <h3 className="text-lg font-medium mb-2">Market Conditions:</h3>
                <p className="text-gray-700 mb-4">
                  Property values and market conditions are subject to change. Our assessments are based on available information at the time of evaluation.
                </p>
                <h3 className="text-lg font-medium mb-2">Third-Party Information:</h3>
                <p className="text-gray-700 mb-4">
                  We may rely on third-party data sources. While we strive for accuracy, we cannot guarantee the completeness or accuracy of all third-party information.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. User Responsibilities</h2>
              <p className="text-gray-700 mb-4">You agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Use the platform for lawful purposes only</li>
                <li>Provide accurate information for service delivery</li>
                <li>Not interfere with platform operations</li>
                <li>Respect intellectual property rights</li>
                <li>Not engage in fraudulent or abusive behavior</li>
                <li>Maintain confidentiality of sensitive information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content, reports, analysis, and materials provided through our platform are proprietary to OwnItRight and protected by intellectual property laws. Users may not:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Reproduce or distribute our content without permission</li>
                <li>Use our reports for commercial purposes beyond personal use</li>
                <li>Reverse engineer or attempt to extract proprietary methodologies</li>
                <li>Remove copyright or proprietary notices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                OwnItRight shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities arising from your use of our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
              <p className="text-gray-700 mb-4">
                You agree to indemnify and hold harmless OwnItRight from any claims, damages, or expenses arising from your use of the platform or violation of these terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to terminate or suspend your account and access to our services at our sole discretion, without notice, for conduct that we believe violates these terms or is harmful to other users or our business.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Governing Law</h2>
              <p className="text-gray-700 mb-4">
                These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bangalore, Karnataka.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these terms, please contact us:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>OwnItRight Property Advisory</strong><br />
                  Email: legal@ownitright.com<br />
                  Phone: +91-9876543210<br />
                  Address: Bangalore, Karnataka, India
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}