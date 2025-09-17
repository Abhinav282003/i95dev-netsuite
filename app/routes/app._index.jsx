import { useEffect, useState, useRef } from "react";
import { getCalApi } from "@calcom/embed-react";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  TextField,
  FormLayout,
  Box,
  InlineStack,
  Select,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { Client } from "@hubspot/api-client";
import nodemailer from "nodemailer";

// SMTP Email sending function
async function sendEmail(firstName, lastName, email, phone, questions) {
  try {
    // Create a transporter object using SMTP server details
    let transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // e.g., "smtp.gmail.com", "smtp.mailtrap.io"
      port: process.env.SMTP_PORT || 587, // Common ports are 587 (TLS) or 465 (SSL)
      secure: process.env.SMTP_SECURE === 'true', // true for 465 (SSL), false for other ports like 587 (TLS)
      auth: {
        user: process.env.SMTP_USER, // Your SMTP username (usually your email address)
        pass: process.env.SMTP_PASS, // Your SMTP password or app-specific password
      },
      // Optional: for self-signed certificates or specific TLS configurations
      tls: {
        rejectUnauthorized: false 
      }
    });

    // Define the email options
    let mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'NetSuite Integration'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`, // Sender address
      to: email, // Send to the form submitter's email
      subject: "Thank you for installing i95Dev NetSuite Integration", // Subject line
      text: `New contact form submission:
      
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone || 'Not provided'}
Questions: ${questions}`, // Plain text body
      html: `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Thank You - I95dev Netsuite Integration</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <!-- Hidden preheader (visible in inbox preview) -->
  <style>
    /* A small, safe media query for small screens (most clients support this) */
    @media only screen and (max-width:480px) {
      .container { width:100% !important; }
      .stack { display:block !important; width:100% !important; }
      .feature-cell { display:block !important; width:100% !important; padding-bottom:12px !important; }
      .logo { height:48px !important; }
      .h1 { font-size:22px !important; }
    }
  </style>
</head>
<body style="margin:0; padding:0; background-color:#f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%;">
  <!-- Preheader text : change to a helpful summary -->
  <div style="display:none; max-height:0px; overflow:hidden; mso-hide:all; font-size:1px; line-height:1px; color:#ffffff; opacity:0;">
    Thank you for choosing i95Dev Connector — your submission is received. Get the installation guide and book a support meeting.
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f8f9fa; width:100%;">
    <tr>
      <td align="center">
        <!-- container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="container" style="width:600px; max-width:600px; margin:40px 0; background:#ffffff; border-radius:8px; box-shadow:0 2px 20px rgba(0,0,0,0.08); overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#2c5aa0; padding:30px 20px; color:#ffffff; text-align:center;">
              <h1 style="margin:0; font-size:28px; font-weight:700; color:#ffffff; line-height:1.2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                i95Dev NetSuite Integration
              </h1>
              <p style="margin:8px 0 0; font-size:14px; color:#ffffff; opacity:0.95; line-height:1.3;">
                Streamline commerce–NetSuite workflows with i95Dev Connect for efficiency and growth
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:34px 34px 18px 34px; color:#333333;">
              <h2 style="margin:0 0 14px 0; font-size:20px; color:#2c5aa0; font-weight:600; text-align:center;">Thank You for Choosing i95Dev Connector</h2>

              <p style="margin:14px 0 0 0; font-size:15px; line-height:1.6; color:#555555; text-align:center;">
                Our team has received your submission. Please find the installation guide below. If you need support, book a meeting
                <a href="https://cal.com/nsconnect/30min?overlayCalendar=true" style="color:#2c5aa0; text-decoration:none; font-weight:600;">here</a>.
              </p>

              <!-- Features grid (table-based, two columns when wide) -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:24px;">
                <tr>
                  <!-- feature column left -->
                  <td class="feature-cell" valign="top" style="padding:12px; width:50%; min-width:260px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" style="width:36px;">
                          <div style="width:28px; height:28px; background:#2c5aa0; border-radius:50%; text-align:center; line-height:28px; color:#ffffff; font-weight:700; font-size:14px;">✓</div>
                        </td>
                        <td style="padding-left:12px; vertical-align:middle; color:#666666; font-size:14px;">
                          <strong style="display:block; color:#333333; font-size:14px;">Keep Customer Information Synced</strong>
                          Maintain consistent customer data across Shopify and NetSuite automatically
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- feature column right -->
                  <td class="feature-cell" valign="top" style="padding:12px; width:50%; min-width:260px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" style="width:36px;">
                          <div style="width:28px; height:28px; background:#2c5aa0; border-radius:50%; text-align:center; line-height:28px; color:#ffffff; font-weight:700; font-size:14px;">✓</div>
                        </td>
                        <td style="padding-left:12px; vertical-align:middle; color:#666666; font-size:14px;">
                          <strong style="display:block; color:#333333; font-size:14px;">Automate Order Processing</strong>
                          Seamless real-time order fulfillment and status updates between systems
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- second row -->
                <tr>
                  <td class="feature-cell" valign="top" style="padding:12px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" style="width:36px;">
                          <div style="width:28px; height:28px; background:#2c5aa0; border-radius:50%; text-align:center; line-height:28px; color:#ffffff; font-weight:700; font-size:14px;">✓</div>
                        </td>
                        <td style="padding-left:12px; vertical-align:middle; color:#666666; font-size:14px;">
                          <strong style="display:block; color:#333333; font-size:14px;">Maintain Accurate Stock Levels</strong>
                          Keep inventory synchronized across Shopify and NetSuite at all times
                        </td>
                      </tr>
                    </table>
                  </td>

                  <td class="feature-cell" valign="top" style="padding:12px;">
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td valign="top" style="width:36px;">
                          <div style="width:28px; height:28px; background:#2c5aa0; border-radius:50%; text-align:center; line-height:28px; color:#ffffff; font-weight:700; font-size:14px;">✓</div>
                        </td>
                        <td style="padding-left:12px; vertical-align:middle; color:#666666; font-size:14px;">
                          <strong style="display:block; color:#333333; font-size:14px;">Update Product Details Automatically</strong>
                          Sync pricing, descriptions, and inventory data across all systems
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA buttons -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:20px;">
                <tr>
                  <td align="center" style="padding-top:18px; padding-bottom:6px;">
                    <!-- Light button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block; margin-right:8px;">
                      <tr>
                        <td align="center" style="background:#e0e0e0; border-radius:6px;">
                          <a href="https://drive.google.com/file/d/10Ugn7mNB0SEu5XBe_feeCSrtVcmkR-Tl/view?usp=sharing" target="_blank" style="display:inline-block; padding:12px 22px; color:#333333; text-decoration:none; font-weight:600; font-size:14px;">
                            Installation Guide
                          </a>
                        </td>
                      </tr>
                    </table>

                    <!-- Primary button -->
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-block;">
                      <tr>
                        <td align="center" style="background:#2c5aa0; border-radius:6px;">
                          <a href="https://clouduat2.i95-dev.com" target="_blank" style="display:inline-block; padding:12px 22px; color:#ffffff; text-decoration:none; font-weight:600; font-size:14px;">
                            Get Started
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa; padding:18px 20px; border-top:1px solid #e9ecef; color:#666666; font-size:13px; text-align:center;">
              <div style="font-size:13px; color:#666666;">
                © 2024 I95Dev. All rights reserved. | Enterprise Integration Solutions
              </div>
              <div style="margin-top:8px; font-size:12px; color:#888888;">
                Passionate about eCommerce &amp; Business Integration
              </div>
            </td>
          </tr>

        </table>
        <!-- /container -->
      </td>
    </tr>
  </table>
</body>
</html>
      `, // HTML body
    };

    // Send the email
    let info = await transporter.sendMail(mailOptions);
    console.log("SMTP Email sent successfully: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending SMTP email:", error);
    return { success: false, error: error.message };
  }
}

// Validation utility functions
function validateEmail(email) {
  // Stricter regex: valid email with only letters allowed after final dot
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
}
const validateName = (name) =>
  /^[a-zA-Z\s'-]+$/.test(name || "") && name.trim().length >= 2;
const validatePhone = (phoneNumber, countryCode) => {
  if (!phoneNumber || phoneNumber.trim() === "") return true; // Optional field
  // Remove all non-digit characters for validation
  const cleanPhone = phoneNumber.replace(/[^\d]/g, "");
  // Should be between 7-12 digits (without country code)
  return cleanPhone.length >= 7 && cleanPhone.length <= 12;
};

// Country codes data
const COUNTRY_CODES = [
  { label: "🇺🇸 United States (+1)", value: "+1" },
  { label: "🇮🇳 India (+91)", value: "+91" },
  { label: "🇬🇧 United Kingdom (+44)", value: "+44" },
  { label: "🇨🇦 Canada (+1)", value: "+1" },
  { label: "🇦🇺 Australia (+61)", value: "+61" },
  { label: "🇩🇪 Germany (+49)", value: "+49" },
  { label: "🇫🇷 France (+33)", value: "+33" },
  { label: "🇯🇵 Japan (+81)", value: "+81" },
  { label: "🇨🇳 China (+86)", value: "+86" },
  { label: "🇧🇷 Brazil (+55)", value: "+55" },
  { label: "🇲🇽 Mexico (+52)", value: "+52" },
  { label: "🇷🇺 Russia (+7)", value: "+7" },
  { label: "🇰🇷 South Korea (+82)", value: "+82" },
  { label: "🇮🇹 Italy (+39)", value: "+39" },
  { label: "🇪🇸 Spain (+34)", value: "+34" },
  { label: "🇳🇱 Netherlands (+31)", value: "+31" },
  { label: "🇸🇪 Sweden (+46)", value: "+46" },
  { label: "🇳🇴 Norway (+47)", value: "+47" },
  { label: "🇩🇰 Denmark (+45)", value: "+45" },
  { label: "🇫🇮 Finland (+358)", value: "+358" },
];

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }) => {
  await authenticate.admin(request);

  const formData = await request.formData();
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");
  const email = formData.get("email");
  const countryCode = formData.get("countryCode");
  const phoneNumber = formData.get("phoneNumber");
  const phone = countryCode && phoneNumber ? `${countryCode} ${phoneNumber.trim()}` : null;
  const questions = formData.get("questions");

  // Server-side validation
  const errors = {};
  if (!firstName?.trim()) errors.firstName = "First name is required";
  else if (firstName.trim().length < 2) errors.firstName = "At least 2 characters";
  else if (firstName.trim().length > 50) errors.firstName = "Max 50 characters";
  else if (!validateName(firstName.trim())) errors.firstName = "Only letters, spaces, - and '";

  if (!lastName?.trim()) errors.lastName = "Last name is required";
  else if (lastName.trim().length < 2) errors.lastName = "At least 2 characters";
  else if (lastName.trim().length > 50) errors.lastName = "Max 50 characters";
  else if (!validateName(lastName.trim())) errors.lastName = "Only letters, spaces, - and '";

  if (!email?.trim()) errors.email = "Email is required";
  else if (email.trim().length > 254) errors.email = "Email too long";
  else if (!validateEmail(email.trim())) errors.email = "Invalid email";

  if (phoneNumber?.trim() && !validatePhone(phoneNumber.trim(), countryCode)) {
    errors.phoneNumber = "Invalid phone number format";
  }

  if (!questions?.trim()) errors.questions = "Questions field is required";
  else if (questions.trim().length < 10) errors.questions = "Minimum 10 characters";
  else if (questions.trim().length > 1000) errors.questions = "Max 1000 characters";

  if (Object.keys(errors).length > 0) {
    return { success: false, errors, message: "Please fix the validation errors" };
  }

  try {
    // Always save to Supabase database first
    console.log("Saving to Supabase database");
    
    // Check for duplicates
    const existing = await prisma.contactForm.findFirst({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) {
      return {
        success: false,
        message: "A submission with this email already exists. Please use a different email or contact support.",
      };
    }

    // Save to Supabase database
    const savedContact = await prisma.contactForm.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        questions: questions.trim(),
      },
    });
    console.log("Successfully saved to Supabase:", savedContact.id);

    // Try HubSpot as additional integration (non-blocking)
    if (process.env.HUBSPOT_API_KEY) {
      try {
        console.log("Attempting to create HubSpot contact");
        const hubspotClient = new Client({ accessToken: process.env.HUBSPOT_API_KEY });
        
        const contactProperties = {
          firstname: firstName.trim(),
          lastname: lastName.trim(),
          email: email.trim().toLowerCase(),
          ...(phone && { phone: phone.trim() }),
          hs_content_membership_notes: questions.trim()
        };

        await hubspotClient.crm.contacts.basicApi.create({
          properties: contactProperties
        });
        console.log("HubSpot contact created successfully");
      } catch (hubspotError) {
        console.error("HubSpot creation failed (non-critical):", hubspotError);
        // Continue anyway since Supabase save succeeded
      }
    }

    // Send SMTP email notification
    try {
      console.log("Sending SMTP email notification");
      const emailResult = await sendEmail(firstName.trim(), lastName.trim(), email.trim(), phone, questions.trim());
      if (emailResult.success) {
        console.log("SMTP email sent successfully:", emailResult.messageId);
      } else {
        console.error("SMTP email failed (non-critical):", emailResult.error);
      }
    } catch (emailError) {
      console.error("SMTP email error (non-critical):", emailError);
      // Continue anyway since Supabase save succeeded
    }

    return { success: true, message: "Form submitted successfully! Our team will contact you soon." };
  } catch (error) {
    console.error("Form submission error:", error);
    return { success: false, message: "Failed to submit form. Please try again later." };
  }
};

export default function Index() {
  const fetcher = useFetcher();
  const shopify = useAppBridge();

  const isLoading =
    ["loading", "submitting"].includes(fetcher.state) && fetcher.formMethod === "POST";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    countryCode: "+1",
    phoneNumber: "",
    questions: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [calReady, setCalReady] = useState(false);

  // Initialize Cal.com
  useEffect(() => {
    (async function () {
      try {
        const cal = await getCalApi({"namespace":"30min"});
        cal("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
        setCalReady(true);
      } catch (error) {
        // console.error("Cal.com initialization failed:", error);
      }
    })();
  }, []);

  // Function to open Cal.com popup
  const openCalPopup = async () => {
    try {
      // console.log("Attempting to open Cal.com popup...");
      // Try to click the hidden button to trigger Cal.com popup
      const calButton = document.getElementById("cal-trigger-button");
      if (calButton) {
        calButton.click();
        // console.log("Cal.com popup triggered via button click");
      } else {
        // Fallback to API method
        const cal = await getCalApi({"namespace":"30min"});
        if (cal) {
          // console.log("Opening Cal.com popup via API...");
          cal("open", {
            calLink: "nsconnect/30min",
            namespace: "30min",
            config: {"layout":"month_view"}
          });
        } else {
          // console.error("Cal API not ready");
        }
      }
    } catch (error) {
      // console.error("Failed to open Cal.com popup:", error);
    }
  };

  // Handle result of submit
  useEffect(() => {
    if (fetcher.data?.success) {
      shopify.toast.show(fetcher.data.message, { duration: 1500 });

      // reset form
      setFormData({ firstName: "", lastName: "", email: "", countryCode: "+1", phoneNumber: "", questions: "" });
      setErrors({});
      setTouched({});
      
      // Open Cal.com popup after successful submission
      setTimeout(() => {
        if (calReady) {
          openCalPopup();
        } else {
          // console.log("Cal not ready, retrying...");
          setTimeout(() => openCalPopup(), 1000);
        }
      }, 1000);
    } else if (fetcher.data?.success === false) {
      if (fetcher.data.errors) setErrors(fetcher.data.errors);
      shopify.toast.show(fetcher.data.message, { isError: true });
    }
  }, [fetcher.data, shopify]);

  // Client-side validation
  const validateField = (field, value) => {
    let error = "";
    if (field === "firstName" || field === "lastName") {
      if (!value?.trim()) error = `${field === "firstName" ? "First" : "Last"} name is required`;
      else if (value.trim().length < 2) error = "At least 2 characters";
      else if (value.trim().length > 50) error = "Max 50 characters";
      else if (!validateName(value.trim())) error = "Only letters, spaces, - and '";
    } else if (field === "email") {
      if (!value?.trim()) error = "Email is required";
      else if (value.trim().length > 254) error = "Email too long";
      else if (!validateEmail(value.trim())) error = "Invalid email";
    } else if (field === "phoneNumber") {
      if (value?.trim() && !validatePhone(value.trim())) error = "Invalid phone number format";
    } else if (field === "countryCode") {
      // Country code doesn't need validation as it's from dropdown
    } else if (field === "questions") {
      if (!value?.trim()) error = "Questions field is required";
      else if (value.trim().length < 10) error = "Minimum 10 characters";
      else if (value.trim().length > 1000) error = "Max 1000 characters";
    }
    return error;
  };

  const handleSubmit = () => {
    // Validate before submission
    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
      shopify.toast.show("Please fix the validation errors", { isError: true });
      return;
    }

    const form = new FormData();
    Object.entries(formData).forEach(([k, v]) => form.append(k, v));
    fetcher.submit(form, { method: "POST" });
  };

  const handleInputChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };
  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  return (
    <Page>
      <TitleBar title="NetSuite Integration" />
      <Layout>
        <Layout.Section>
          {/* Header Image */}
          <Box paddingBlockEnd="10">
            <div
              style={{
                width: "100%",
                height: "210px",
                backgroundImage: "url(/V1.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                borderRadius: "12px",
              }}
            />
          </Box>

          <Card>
            <BlockStack gap="600">
              <Box paddingInline="400" paddingBlock="400">
                <BlockStack gap="300">
                  <InlineStack align="center">
                    <Text as="h1" variant="headingXl" alignment="center">
                      Shopify NetSuite Integration
                    </Text>
                  </InlineStack>
                  <InlineStack align="center">
                    <Text variant="bodyLg" as="p" tone="subdued" alignment="center">
                      Fill out this form and our team will reach out to onboard you
                    </Text>
                  </InlineStack>
                </BlockStack>
              </Box>

              <Box paddingInline="400" paddingBlockEnd="400">
                <FormLayout>
                  <FormLayout.Group>
                    <TextField
                      label="First Name"
                      value={formData.firstName}
                      onChange={handleInputChange("firstName")}
                      onBlur={handleBlur("firstName")}
                      autoComplete="given-name"
                      required
                      error={errors.firstName}
                      maxLength={50}
                    />
                    <TextField
                      label="Last Name"
                      value={formData.lastName}
                      onChange={handleInputChange("lastName")}
                      onBlur={handleBlur("lastName")}
                      autoComplete="family-name"
                      required
                      error={errors.lastName}
                      maxLength={50}
                    />
                  </FormLayout.Group>

                  <TextField
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    onBlur={handleBlur("email")}
                    autoComplete="email"
                    required
                    error={errors.email}
                    maxLength={254}
                  />

                  <FormLayout.Group>
                    <Select
                      label="Country Code (Optional)"
                      options={COUNTRY_CODES}
                      value={formData.countryCode}
                      onChange={handleInputChange("countryCode")}
                    />
                    <TextField
                      label="Phone Number (Optional)"
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={handleInputChange("phoneNumber")}
                      onBlur={handleBlur("phoneNumber")}
                      autoComplete="tel"
                      placeholder="555-123-4567"
                      helpText="Enter your phone number without country code"
                      error={errors.phoneNumber}
                      maxLength={15}
                    />
                  </FormLayout.Group>

                  <TextField
                    label="Questions, Needs, or Challenges"
                    value={formData.questions}
                    onChange={handleInputChange("questions")}
                    onBlur={handleBlur("questions")}
                    multiline={4}
                    helpText={
                      <span>
                        By supplying my contact information, I authorize i95Dev to contact me
                        regarding its products and services. See our{" "}
                        <a
                          href="https://www.i95dev.com/privacy-policy/"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#005bd3", textDecoration: "underline" }}
                        >
                          Privacy Policy
                        </a>{" "}
                        for more details.
                      </span>
                    }
                    required
                    error={errors.questions}
                    maxLength={1000}
                  />

                  <Box paddingBlockStart="400">
                    <InlineStack align="center">
                      <Button
                        primary
                        loading={isLoading}
                        onClick={handleSubmit}
                        size="large"
                        disabled={isLoading}
                      >
                        {isLoading ? "Submitting..." : "Submit"}
                      </Button>
                    </InlineStack>
                  </Box>

                  {/* Hidden Cal.com trigger button */}
                  <button
                    style={{ display: "none" }}
                    data-cal-namespace="30min"
                    data-cal-link="nsconnect/30min"
                    data-cal-config='{"layout":"month_view"}'
                    id="cal-trigger-button"
                  >
                    Schedule Meeting
                  </button>
                </FormLayout>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}