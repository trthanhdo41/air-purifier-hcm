import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * Check payment status cho order
 * 
 * Query params:
 * - orderCode: string
 * 
 * Response:
 * {
 *   success: boolean,
 *   isPaid: boolean,
 *   order?: object
 * }
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawCode = searchParams.get('orderCode');
    const debug = searchParams.get('debug') === '1';

    if (!rawCode) {
      return NextResponse.json(
        { success: false, error: 'Missing orderCode' },
        { status: 400 }
      );
    }

    // DÙNG CHÍNH XÁC GIỐNG ADMIN PAGE - createClient() với ANON_KEY
    // Admin page: createClient() -> createBrowserClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
    // Check API: Tạo client với CHÍNH XÁC cùng URL và ANON_KEY (không dùng SERVICE_ROLE_KEY)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    
    console.log('🔌 Check API - Connected to Supabase (SAME AS ADMIN PAGE):', {
      url: supabaseUrl?.substring(0, 30) + '...',
      keyType: 'ANON_KEY (same as admin page)',
    });

    // QUERY GIỐNG HỆT ADMIN PAGE - Query tất cả orders rồi filter (như admin page)
    // Admin page: supabase.from("orders").select("*").order("created_at", { ascending: false })
    // Check API: Query tất cả orders, sau đó filter theo order_number (giống admin page filter)
    const orderNumber = rawCode.trim();
    
    console.log('🔍 Check API - Querying ALL orders (like admin page):', { 
      orderNumber,
      table: 'orders',
    });

    // Query TẤT CẢ orders (giống hệt admin page)
    const { data: allOrders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Check API - Error querying orders:', error.message);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          debug: {
            orderNumber,
            error: error.message,
          },
        },
        {
          status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      );
    }

    console.log('🔍 Check API - Total orders found:', allOrders?.length || 0);
    console.log('🔍 Check API - Looking for orderNumber:', orderNumber);
    console.log('🔍 Check API - First 10 order_numbers in DB:', 
      allOrders?.slice(0, 10).map(o => o.order_number) || []
    );

    // Filter theo order_number (giống admin page filter)
    const order = Array.isArray(allOrders) 
      ? allOrders.find(o => 
          o.order_number === orderNumber || 
          o.order_number === orderNumber.trim() ||
          o.order_number?.trim() === orderNumber ||
          o.order_number?.toUpperCase() === orderNumber.toUpperCase()
        )
      : null;
    
    console.log('🔍 Check API - Order found?', order ? 'YES' : 'NO');
    if (order) {
      console.log('🔍 Check API - Found order:', {
        order_number: order.order_number,
        payment_status: order.payment_status,
        status: order.status,
      });
    }

    if (!order) {
      console.error('❌ Check API - Order not found:', { 
        orderNumber, 
        totalOrders: allOrders?.length || 0,
        sampleOrderNumbers: allOrders?.slice(0, 5).map(o => o.order_number) || [],
      });
      
      // Log tất cả order_numbers để debug
      if (allOrders && allOrders.length > 0) {
        console.log('📋 Check API - All order_numbers in DB:', 
          allOrders.map(o => o.order_number).slice(0, 20)
        );
      }
      
      return NextResponse.json(
        {
          success: true,
          isPaid: false,
          order: null,
          payment_status: 'pending',
          debug: {
            orderNumber,
            totalOrders: allOrders?.length || 0,
            found: 0,
            message: 'Order not found in Supabase',
            sampleOrderNumbers: allOrders?.slice(0, 5).map(o => o.order_number) || [],
          },
        },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      );
    }

    console.log('✅ Check API - Order found:', {
      order_number: order.order_number,
      payment_status: order.payment_status,
      status: order.status,
      id: order.id,
    });

    // Check nếu đã thanh toán (giống admin page check payment_status)
    const isPaid = order.payment_status === 'paid';

    console.log('✅ Check API - Final result (like admin page):', {
      orderNumber,
      order_number: order.order_number,
      payment_status: order.payment_status,
      status: order.status,
      isPaid,
      order_id: order.id,
    });

    // TRẢ VỀ ORDER (giống admin page trả về order với payment_status)
    return NextResponse.json(
      {
        success: true,
        isPaid,
        order: order, // Trả về order giống admin page
        payment_status: order.payment_status, // payment_status từ Supabase
        debug: {
          orderNumber,
          order_number: order.order_number,
          payment_status: order.payment_status,
          status: order.status,
          order_id: order.id,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );

  } catch (error: any) {
    console.error('❌ Error checking payment status:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

function normalizeOrderCode(input: string): string {
  if (!input) return input;
  const s = input.trim().toUpperCase();
  // Short code preferred: HTX<5-8 digits>, with or without dash/space
  const short1 = s.match(/^HTX(\d{5,8})$/);
  if (short1) return `HTX${short1[1]}`;
  const short2 = s.match(/^HTX\s*-?\s*(\d{5,8})$/);
  if (short2) return `HTX${short2[1]}`;
  // Legacy formats: keep as-is to still allow lookups
  const legacy1 = s.match(/^HTX-(\d{13})-([A-Z0-9]+)$/);
  if (legacy1) return s;
  return s;
}
