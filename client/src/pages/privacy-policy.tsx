import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { updateMetaTags } from '@/utils/seo';

export default function PrivacyPolicy() {
  useEffect(() => {
    updateMetaTags(
      'Privacy Policy - OwnitWise Property Advisory',
      'Learn how OwnitWise protects your personal information and data privacy. Our comprehensive privacy policy outlines data collection, usage, and protection practices.',
      'privacy policy, data protection, personal information, OwnitWise, property advisory',
      undefined,
      `${window.location.origin}/privacy-policy`
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center mb-4">Privacy Policy</CardTitle>
            <p className="text-gray-600 text-center">Last updated: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
              <p className="text-gray-700 mb-4">
                OwnitWise ("we," "our," or "us") collects information you provide directly to us, such as when you:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Create an account or use our services</li>
                <li>Request property valuations or civil engineering reports</li>
                <li>Contact us for consultations or support</li>
                <li>Subscribe to our newsletter</li>
                <li>Participate in surveys or promotions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Types of Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Personal Information:</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Name, email address, phone number</li>
                    <li>Address and location preferences</li>
                    <li>Property interests and budget information</li>
                    <li>Payment information for reports and services</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">Usage Information:</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Property search history and preferences</li>
                    <li>Service usage patterns</li>
                    <li>Device information and IP address</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide and improve our property advisory services</li>
                <li>Generate personalized property recommendations</li>
                <li>Process payments for reports and consultations</li>
                <li>Send service updates and marketing communications (with consent)</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Comply with legal obligations and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Information Sharing</h2>
              <p className="text-gray-700 mb-4">We do not sell your personal information. We may share information in the following circumstances:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Service Providers:</strong> Third-party vendors who assist in providing our services</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                <li><strong>Consent:</strong> With your explicit permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and employee training</li>
                <li>Secure payment processing through certified providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Access and update your personal information</li>
                <li>Request deletion of your data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability</li>
                <li>Lodge complaints with data protection authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your information for as long as necessary to provide services and comply with legal obligations. Account information is typically retained for the duration of your relationship with us plus applicable retention periods.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Updates to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this privacy policy periodically. We will notify you of significant changes through email or prominent notice on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about this privacy policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>OwnItRight Property Advisory</strong><br />
                  Email: privacy@ownitright.com<br />
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