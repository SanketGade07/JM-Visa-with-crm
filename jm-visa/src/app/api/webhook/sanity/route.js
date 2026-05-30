import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Webhook handler for Sanity content changes
export async function POST(request) {
  try {
    // Verify webhook signature (optional but recommended)
    const signature = request.headers.get('sanity-webhook-signature');
    const webhookSecret = process.env.SANITY_WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      // Verify the signature matches (implement signature verification if needed)
      console.log('🔐 Webhook signature verification (implement if needed)');
    }
    
    // Get the webhook payload
    const body = await request.json();
    
    console.log('📡 Received Sanity webhook:', {
      type: body._type,
      id: body._id,
      operation: body.operation || 'unknown'
    });
    
    // Check if this is a relevant content type that should trigger sitemap update
    const relevantTypes = ['post', 'category'];
    
    if (body._type && relevantTypes.includes(body._type)) {
      console.log('🔄 Triggering sitemap revalidation for content type:', body._type);
      
      // Revalidate the sitemap route to force regeneration
      revalidatePath('/sitemap.xml');
      
      // Also revalidate blog pages if it's a post
      if (body._type === 'post') {
        revalidatePath('/blog');
        if (body.slug?.current) {
          revalidatePath(`/blog/${body.slug.current}`);
        }
      }
      
      // Revalidate category pages if it's a category
      if (body._type === 'category') {
        if (body.slug?.current) {
          revalidatePath(`/blog/category/${body.slug.current}`);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: `Sitemap revalidated for ${body._type} change`,
        timestamp: new Date().toISOString(),
        revalidated: ['/sitemap.xml']
      });
    }
    
    // If not a relevant content type, just acknowledge
    return NextResponse.json({
      success: true,
      message: 'Webhook received but no action needed',
      timestamp: new Date().toISOString(),
      contentType: body._type
    });
    
  } catch (error) {
    console.error('❌ Error processing Sanity webhook:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({
    message: 'Sanity webhook endpoint is active',
    timestamp: new Date().toISOString(),
    supportedMethods: ['POST'],
    contentTypes: ['post', 'category']
  });
}