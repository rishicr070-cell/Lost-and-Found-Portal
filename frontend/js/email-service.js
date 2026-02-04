/**
 * Email Notification Service using EmailJS
 * No server/Cloud Functions needed - works from browser
 */

class EmailNotificationService {
    constructor() {
        // EmailJS credentials
        this.serviceId = 'service_uawkblg';
        this.templateId = 'template_5p2v3x7';
        this.publicKey = 'viQdnjOxPfZv3Fi09';
        this.initialized = false;
    }

    /**
     * Initialize EmailJS
     */
    init() {
        if (typeof emailjs === 'undefined') {
            console.error('EmailJS library not loaded');
            return false;
        }

        emailjs.init(this.publicKey);
        this.initialized = true;
        console.log('✅ Email service initialized');
        return true;
    }

    /**
     * Send claim notification email
     */
    async sendClaimNotification(itemData, claimerData) {
        if (!this.initialized) {
            console.error('❌ Email service not initialized');
            return false;
        }

        try {
            const templateParams = {
                to_email: itemData.contact,
                to_name: itemData.contact.split('@')[0],
                item_name: itemData.name,
                item_type: itemData.type,
                item_category: itemData.category,
                item_description: itemData.description,
                item_location: itemData.location,
                item_date: itemData.date,
                item_color: itemData.color,
                claimer_name: claimerData.name,
                claimer_email: claimerData.email,
                verification_details: claimerData.verificationDetails || 'Not provided',
                claim_date: new Date().toLocaleDateString()
            };

            console.log('📧 Sending email notification...');
            console.log('Service ID:', this.serviceId);
            console.log('Template ID:', this.templateId);
            console.log('To:', templateParams.to_email);
            console.log('Template params:', templateParams);

            const response = await emailjs.send(
                this.serviceId,
                this.templateId,
                templateParams
            );

            console.log('✅ Email sent successfully:', response);
            alert('✅ Email sent to ' + itemData.contact);
            return true;

        } catch (error) {
            console.error('❌ Email send failed:', error);
            console.error('Error text:', error.text);
            console.error('Error status:', error.status);
            alert('❌ Email failed: ' + error.text);
            return false;
        }
    }

    /**
     * Test email function - sends a test email
     */
    async testEmail(testEmail) {
        if (!this.initialized) {
            console.error('❌ Email service not initialized');
            return false;
        }

        try {
            const templateParams = {
                to_email: testEmail,
                to_name: 'Test User',
                item_name: 'Test Wallet',
                item_type: 'lost',
                item_category: 'Accessories',
                item_description: 'Black leather wallet',
                item_location: 'Library',
                item_date: '2025-02-05',
                item_color: 'Black',
                claimer_name: 'John Doe',
                claimer_email: 'john@example.com',
                verification_details: 'Test claim',
                claim_date: new Date().toLocaleDateString()
            };

            console.log('📧 Sending test email to:', testEmail);
            const response = await emailjs.send(
                this.serviceId,
                this.templateId,
                templateParams
            );

            console.log('✅ Test email sent:', response);
            alert('✅ Test email sent to ' + testEmail);
            return true;

        } catch (error) {
            console.error('❌ Test email failed:', error);
            alert('❌ Test failed: ' + error.text);
            return false;
        }
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(userEmail) {
        if (!this.initialized) return false;

        try {
            const templateParams = {
                to_email: userEmail,
                to_name: userEmail.split('@')[0]
            };

            await emailjs.send(
                this.serviceId,
                'welcome_template', // Create this template in EmailJS
                templateParams
            );

            console.log('✅ Welcome email sent');
            return true;
        } catch (error) {
            console.error('❌ Welcome email failed:', error);
            return false;
        }
    }
}

// Initialize service
const emailService = new EmailNotificationService();

// Make globally accessible
window.emailService = emailService;

console.log('✓ Email notification service loaded');
