import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Mark as dynamic to prevent build-time evaluation
export const dynamic = 'force-dynamic'

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    // Get your email from environment variable (where you want to receive contact form messages)
    const recipientEmail = process.env.CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL

    if (!recipientEmail) {
      console.error('CONTACT_EMAIL or RESEND_FROM_EMAIL is not configured')
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: `Portfolio Contact Form <onboarding@resend.dev>`, // You'll need to verify your domain with Resend to use a custom email
      to: [recipientEmail], // Your email address where you want to receive messages
      replyTo: email, // So you can reply directly to the person who contacted you
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          <div style="margin-top: 20px; line-height: 1.6;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #000; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>This message was sent from your portfolio contact form.</p>
            <p>You can reply directly to this email to respond to ${name}.</p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}

Message:
${message}

---
This message was sent from your portfolio contact form.
You can reply directly to this email to respond to ${name}.
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to send email. Please check your Resend API key and try again.' },
        { status: 500 }
      )
    }

    console.log('Email sent successfully:', data)

    return NextResponse.json({ 
      success: true, 
      message: 'Message sent successfully',
      id: data?.id 
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}

