import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const {
      items,
      totalAmount,
      shippingFee = 0,
      discountAmount = 0,
      finalAmount,
      fullName,
      email,
      phone,
      address,
      city,
      district,
      ward,
      note,
      paymentMethod,
    } = body;

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate short numeric order code: HTX<5 digits> (e.g. HTX91845)
    // Random 5-digit number to reduce collision in practice
    const fiveDigits = (Math.floor(Math.random() * 90000) + 10000).toString();
    const orderNumber = `HTX${fiveDigits}`;

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        status: 'pending',
        payment_status: paymentMethod === 'cod' ? 'pending' : 'pending', // Mặc định là pending cho tất cả
        total_amount: totalAmount,
        shipping_fee: shippingFee,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        full_name: fullName,
        email: email || null,
        phone,
        address,
        city,
        district,
        ward,
        note: note || null,
        payment_method: paymentMethod,
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      );
    }

    // Create order items
    if (items && items.length > 0) {
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        subtotal: item.product.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // Rollback order if items fail
        await supabase.from('orders').delete().eq('id', order.id);
        return NextResponse.json(
          { error: 'Failed to create order items', details: itemsError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        order_number: order.order_number,
      },
    });
  } catch (error: any) {
    console.error('Error in create order API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

