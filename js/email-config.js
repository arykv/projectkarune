// Email Configuration for Karune Connect
// Follow setup guide to get these values from EmailJS.com

const EMAIL_CONFIG = {
  // Get these from EmailJS dashboard
  enabled: true, // Set to true after setup
  publicKey: 'ZBokUTtJxOYrASuEs', // e.g., 'user_abc123def456'
  serviceId: 'service_i60qde7', // e.g., 'service_gmail123'
  
  templates: {
    sponsor: 'template_fg8wlpf', // e.g., 'template_sponsor123'
    volunteer: 'template_gsh0kwh' // e.g., 'template_volunteer456'
  }
};

// Initialize EmailJS (only if enabled)
if (EMAIL_CONFIG.enabled && typeof emailjs !== 'undefined') {
  emailjs.init(EMAIL_CONFIG.publicKey);
  console.log('✅ EmailJS initialized');
}

/**
 * Send sponsor notification email to shelter
 */
export async function sendSponsorEmail(shelterEmail, data) {
  if (!EMAIL_CONFIG.enabled) {
    console.log('📧 Email disabled - would have sent:', data);
    return { success: true, message: 'Email notifications disabled' };
  }

  try {
    const templateParams = {
      to_email: shelterEmail,
      shelter_name: data.shelterName,
      need_title: data.needTitle,
      sponsor_name: data.sponsorName,
      sponsor_email: data.sponsorEmail || 'Not provided',
      sponsor_type: data.sponsorType === 'monetary' ? 'Monetary Donation' : 'Direct Delivery',
      donation_amount: data.amount ? `₹${data.amount.toLocaleString()}` : ''
    };

    console.log('📧 Sending sponsor email to:', shelterEmail);
    
    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templates.sponsor,
      templateParams
    );

    console.log('✅ Email sent successfully:', response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send volunteer notification email to shelter
 */
export async function sendVolunteerEmail(shelterEmail, data) {
  if (!EMAIL_CONFIG.enabled) {
    console.log('📧 Email disabled - would have sent:', data);
    return { success: true, message: 'Email notifications disabled' };
  }

  try {
    const templateParams = {
      to_email: shelterEmail,
      shelter_name: data.shelterName,
      need_title: data.needTitle,
      volunteer_name: data.volunteerName,
      volunteer_email: data.volunteerEmail || 'Not provided',
      volunteer_skills: data.skills && data.skills.length > 0 
        ? data.skills.join(', ') 
        : 'General support'
    };

    console.log('📧 Sending volunteer email to:', shelterEmail);
    
    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templates.volunteer,
      templateParams
    );

    console.log('✅ Email sent successfully:', response);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfig() {
  if (!EMAIL_CONFIG.enabled) {
    console.warn('⚠️ Email is disabled. Enable it in email-config.js');
    return false;
  }

  if (EMAIL_CONFIG.publicKey === 'YOUR_EMAILJS_PUBLIC_KEY') {
    console.error('❌ Please configure EmailJS keys in email-config.js');
    return false;
  }

  console.log('✅ Email configuration looks good!');
  return true;
}

// Export config for inspection
export { EMAIL_CONFIG };