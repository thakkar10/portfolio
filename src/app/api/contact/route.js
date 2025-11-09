import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Here you would typically send an email using a service like SendGrid, Resend, etc.
    // For now, we'll just log it
    console.log('Contact form submission:', { name, email, message })

    return NextResponse.json({ success: true, message: 'Message sent successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

