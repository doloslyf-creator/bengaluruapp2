import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateMetaTags } from '@/utils/seo';

export default function RefundPolicy() {
  useEffect(() => {
    updateMetaTags(
      'Refund Policy - OwnItRight Property Advisory',
      'OwnItRight refund policy for property reports and advisory services. Learn about eligibility, process, and timelines for refunds.',
      'refund policy, money back guarantee, property reports, valuation reports, OwnItRight',
      undefined,
      `${window.location.origin}/refund-policy`
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-4">Refund Policy</CardTitle>
            <p className="text-gray-600 text-center">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Overview</h2>
              <p className="text-gray-700 mb-4">
                At OwnItRight, we are committed to providing high-quality property advisory services. This refund policy outlines the circumstances under which refunds may be granted for our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Refund Eligibility</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Property Valuation Reports:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Full Refund:</strong> If we cannot deliver the report within 7 business days</li>
                  <li><strong>Partial Refund (50%):</strong> If the report contains significant factual errors that affect valuation</li>
                  <li><strong>No Refund:</strong> If the report is delivered as specified and meets quality standards</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">Civil & MEP Reports:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Full Refund:</strong> If we cannot access the property for inspection within 10 business days</li>
                  <li><strong>Partial Refund (70%):</strong> If major structural assessments are incomplete due to access limitations</li>
                  <li><strong>No Refund:</strong> If basic analysis and recommendations are provided as promised</li>
                </ul>

                <h3 className="text-lg font-medium mb-2">Consultation Services:</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Full Refund:</strong> If consultation is cancelled by us or if we fail to provide scheduled service</li>
                  <li><strong>No Refund:</strong> If consultation is completed as scheduled</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Non-Refundable Circumstances</h2>
              <p className="text-gray-700 mb-4">Refunds will not be provided in the following situations:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Change of mind after report delivery</li>
                <li>Disagreement with professional assessment or market conditions</li>
                <li>External factors affecting property value (market fluctuations, policy changes)</li>
                <li>Reports delivered within specified timelines and quality standards</li>
                <li>Consultation services already rendered</li>
                <li>Third-party costs incurred (government fees, inspection charges)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Refund Request Process</h2>
              <div className="space-y-4">
                <h3 className="text-lg font-medium mb-2">Step 1: Contact Us</h3>
                <p className="text-gray-700 mb-4">
                  Email us at refunds@ownitright.com with your order details and reason for refund request within 7 days of service delivery.
                </p>

                <h3 className="text-lg font-medium mb-2">Step 2: Review Process</h3>
                <p className="text-gray-700 mb-4">
                  Our team will review your request within 3-5 business days and may request additional information or clarification.
                </p>

                <h3 className="text-lg font-medium mb-2">Step 3: Decision</h3>
                <p className="text-gray-700 mb-4">
                  You will receive a written decision regarding your refund request, including the amount (if applicable) and processing timeline.
                </p>

                <h3 className="text-lg font-medium mb-2">Step 4: Processing</h3>
                <p className="text-gray-700 mb-4">
                  Approved refunds will be processed within 7-10 business days to the original payment method.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Required Information for Refund Requests</h2>
              <p className="text-gray-700 mb-4">Please include the following information in your refund request:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Order number and payment transaction ID</li>
                <li>Service type and date of purchase</li>
                <li>Detailed reason for refund request</li>
                <li>Supporting documentation (if applicable)</li>
                <li>Contact information for follow-up</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Refund Processing Timeline</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li><strong>Credit Cards:</strong> 5-7 business days</li>
                  <li><strong>Debit Cards:</strong> 7-10 business days</li>
                  <li><strong>Net Banking:</strong> 3-5 business days</li>
                  <li><strong>UPI/Wallets:</strong> 1-3 business days</li>
                </ul>
                <p className="text-sm text-gray-600 mt-4">
                  *Processing times may vary depending on your bank or payment provider
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Quality Assurance</h2>
              <p className="text-gray-700 mb-4">
                To minimize refund requests, we maintain strict quality standards:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Licensed and experienced professionals conduct all assessments</li>
                <li>Standardized methodologies and industry best practices</li>
                <li>Multiple quality checks before report delivery</li>
                <li>Clear communication throughout the service process</li>
                <li>Customer feedback integration for continuous improvement</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                If you are not satisfied with our refund decision, you may:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Request escalation to our senior management team</li>
                <li>Provide additional evidence or documentation</li>
                <li>Seek mediation through consumer protection forums</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Modifications to Refund Policy</h2>
              <p className="text-gray-700 mb-4">
                OwnItRight reserves the right to modify this refund policy at any time. Changes will be effective immediately upon posting on our website. Continued use of our services constitutes acceptance of the modified policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For refund requests or questions about this policy:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Refund Department</strong><br />
                  Email: refunds@ownitright.com<br />
                  Phone: +91-9876543210<br />
                  Support Hours: Monday-Friday, 9 AM - 6 PM IST<br />
                  Address: OwnItRight Property Advisory, Bangalore, Karnataka, India
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}