const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Configure email transporter (using Gmail as example)
// IMPORTANT: Set these in Firebase Functions config:
// firebase functions:config:set gmail.email="your-email@gmail.com" gmail.password="your-app-password"
const gmailEmail = functions.config().gmail?.email;
const gmailPassword = functions.config().gmail?.password;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailEmail,
        pass: gmailPassword
    }
});

/**
 * Send email notification when a claim is created
 */
exports.sendClaimNotification = functions.firestore
    .document('claims/{claimId}')
    .onCreate(async (snap, context) => {
        const claim = snap.data();
        const claimId = context.params.claimId;

        try {
            console.log('New claim created:', claimId);
            console.log('Claim data:', claim);

            // Get the item details
            const itemDoc = await admin.firestore()
                .collection('items')
                .doc(claim.itemId)
                .get();

            if (!itemDoc.exists) {
                console.error('Item not found:', claim.itemId);
                return null;
            }

            const item = itemDoc.data();
            const ownerEmail = item.contact;
            const claimerEmail = claim.claimerEmail;
            const claimerName = claimerEmail.split('@')[0]; // Extract name from email

            // Email content
            const mailOptions = {
                from: `Lost & Found Portal <${gmailEmail}>`,
                to: ownerEmail,
                subject: `🔔 Someone claimed your ${item.type} item: ${item.name}`,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                            .item-card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #667eea; }
                            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
                            .badge { display: inline-block; background: ${item.type === 'lost' ? '#dc3545' : '#28a745'}; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>🎉 Great News!</h1>
                                <p>Someone has claimed your item</p>
                            </div>
                            <div class="content">
                                <p>Hello,</p>
                                <p>Good news! <strong>${claimerName}</strong> has claimed your ${item.type} item on the Lost & Found Portal.</p>
                                
                                <div class="item-card">
                                    <h2>${item.name} <span class="badge">${item.type.toUpperCase()}</span></h2>
                                    <p><strong>Category:</strong> ${item.category}</p>
                                    <p><strong>Description:</strong> ${item.description}</p>
                                    <p><strong>Location:</strong> ${item.location}</p>
                                    <p><strong>Date:</strong> ${item.date}</p>
                                    <p><strong>Color:</strong> ${item.color}</p>
                                </div>

                                <h3>👤 Claimed By:</h3>
                                <p><strong>Name:</strong> ${claimerName}</p>
                                <p><strong>Email:</strong> ${claimerEmail}</p>
                                ${claim.verificationDetails ? `<p><strong>Verification Details:</strong> ${claim.verificationDetails}</p>` : ''}

                                <p style="margin-top: 30px;">
                                    <a href="https://lostfoundportal-dsa.web.app" class="button">View Claim Details</a>
                                </p>

                                <p style="margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
                                    <strong>⚠️ Next Steps:</strong><br>
                                    Please verify the claimer's identity before handing over the item. You can contact them at <a href="mailto:${claimerEmail}">${claimerEmail}</a> or use the in-app messaging feature.
                                </p>
                            </div>
                            <div class="footer">
                                <p>This is an automated notification from Lost & Found Portal</p>
                                <p>© 2025 Lost & Found Portal. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };

            // Send email
            await transporter.sendMail(mailOptions);
            console.log('✅ Email sent to:', ownerEmail);

            // Update claim with notification status
            await snap.ref.update({
                emailSent: true,
                emailSentAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return null;
        } catch (error) {
            console.error('❌ Error sending email:', error);

            // Update claim with error status
            await snap.ref.update({
                emailSent: false,
                emailError: error.message
            });

            return null;
        }
    });

/**
 * Send welcome email when user signs up
 */
exports.sendWelcomeEmail = functions.auth.user().onCreate(async (user) => {
    const email = user.email;
    const displayName = user.displayName || email.split('@')[0];

    const mailOptions = {
        from: `Lost & Found Portal <${gmailEmail}>`,
        to: email,
        subject: '👋 Welcome to Lost & Found Portal!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Lost & Found Portal!</h1>
                    </div>
                    <div class="content">
                        <p>Hi ${displayName},</p>
                        <p>Thank you for joining our Lost & Found community! We're here to help you reunite with your lost items or help others find theirs.</p>
                        
                        <h3>What you can do:</h3>
                        <ul>
                            <li>📝 Report lost items</li>
                            <li>✅ Report found items</li>
                            <li>🔍 Search for your lost belongings</li>
                            <li>💬 Message other users</li>
                            <li>🎯 Get smart match suggestions</li>
                        </ul>

                        <p style="text-align: center;">
                            <a href="https://lostfoundportal-dsa.web.app" class="button">Get Started</a>
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent to:', email);
    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
    }

    return null;
});
