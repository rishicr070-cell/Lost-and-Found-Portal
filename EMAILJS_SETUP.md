# Email Notifications - Simple Setup (No Node.js Required)

## Using EmailJS (Client-Side Solution)

### 1. Sign Up for EmailJS
1. Go to: https://www.emailjs.com/
2. Click "Sign Up" (Free plan: 200 emails/month)
3. Verify your email

### 2. Connect Your Email
1. Go to "Email Services"
2. Click "Add New Service"
3. Select "Gmail" (or your email provider)
4. Follow instructions to connect
5. Copy the **Service ID** (e.g., `service_abc123`)

### 3. Create Email Template
1. Go to "Email Templates"
2. Click "Create New Template"
3. Template Name: `claim_notification`
4. Copy this template:

```
Subject: 🔔 Someone claimed your {{item_type}} item: {{item_name}}

Hello {{to_name}},

Great news! Someone has claimed your {{item_type}} item on the Lost & Found Portal.

ITEM DETAILS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Name: {{item_name}}
📂 Category: {{item_category}}
📝 Description: {{item_description}}
📍 Location: {{item_location}}
📅 Date: {{item_date}}
🎨 Color: {{item_color}}

CLAIMED BY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Name: {{claimer_name}}
📧 Email: {{claimer_email}}
📋 Verification Details: {{verification_details}}
📆 Claim Date: {{claim_date}}

⚠️ IMPORTANT: Please verify the claimer's identity before handing over the item.

You can contact them at: {{claimer_email}}

Best regards,
Lost & Found Portal Team
```

4. Save template
5. Copy the **Template ID** (e.g., `template_xyz789`)

### 4. Get Public Key
1. Go to "Account" → "General"
2. Copy your **Public Key** (e.g., `abc123xyz789`)

### 5. Update Configuration
Edit `frontend/js/email-service.js`:

```javascript
this.serviceId = 'service_uawkblg';      // Your Service ID
this.templateId = 'template_qjv5n18';    // Your Template ID
this.publicKey = 'viQdnjOxPfZv3Fi09';        // Your Public Key
```

### 6. Add to HTML
Add to `index.html` before `</body>`:

```html
<!-- EmailJS SDK -->
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>

<!-- Email Service -->
<script src="js/email-service.js"></script>

<script>
    // Initialize email service
    emailService.init();
</script>
```

### 7. Use in Your Code
When a claim is created, add this:

```javascript
// Send email notification
await emailService.sendClaimNotification(
    {
        contact: item.contact,
        name: item.name,
        type: item.type,
        category: item.category,
        description: item.description,
        location: item.location,
        date: item.date,
        color: item.color
    },
    {
        name: claimerName,
        email: claimerEmail,
        verificationDetails: verificationDetails
    }
);
```

## Benefits

✅ No Node.js installation needed
✅ No server/Cloud Functions required
✅ Works directly from browser
✅ Free tier: 200 emails/month
✅ 5-minute setup
✅ Professional email templates

## Test

1. Create a test claim
2. Check the owner's email inbox
3. Should receive formatted notification

## Troubleshooting

**Emails not sending:**
- Check browser console for errors
- Verify Service ID, Template ID, Public Key are correct
- Check EmailJS dashboard for quota limits
- Make sure EmailJS script is loaded

**Template variables not working:**
- Use exact variable names: `{{to_name}}`, `{{item_name}}`, etc.
- Check template in EmailJS dashboard
