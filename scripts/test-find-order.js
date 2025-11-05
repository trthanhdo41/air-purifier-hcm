/**
 * Script test tìm order trong Supabase
 * Test nhiều cách query khác nhau cho đến khi tìm được HTX35345
 * 
 * Run: node scripts/test-find-order.js
 */

const { createClient } = require('@supabase/supabase-js');

// Load env từ .env.local
require('dotenv').config({ path: '.env.local' });

const ORDER_CODE_TO_FIND = 'HTX35345';

async function testFindOrder() {
  console.log('🔍 Starting test to find order:', ORDER_CODE_TO_FIND);
  console.log('');

  // Kiểm tra env variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('📋 Environment Variables:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.log('  NEXT_PUBLIC_SUPABASE_ANON_KEY:', anonKey ? anonKey.substring(0, 20) + '...' : 'MISSING');
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? serviceKey.substring(0, 20) + '...' : 'MISSING');
  console.log('');

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing Supabase credentials!');
    process.exit(1);
  }

  // Test 1: Dùng SERVICE_ROLE_KEY (bypass RLS)
  console.log('========================================');
  console.log('TEST 1: Query with SERVICE_ROLE_KEY');
  console.log('========================================');
  
  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // Test 1a: Query all orders
  console.log('\n1a. Query ALL orders:');
  const { data: allOrders, error: allError } = await adminClient
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (allError) {
    console.error('  ❌ Error:', allError.message);
  } else {
    console.log(`  ✅ Found ${allOrders?.length || 0} total orders`);
    console.log('  First 10 order_numbers:', allOrders?.slice(0, 10).map(o => o.order_number));
    
    // Tìm HTX35345 trong list
    const foundInList = allOrders?.find(o => o.order_number === ORDER_CODE_TO_FIND);
    if (foundInList) {
      console.log(`  ✅ FOUND ${ORDER_CODE_TO_FIND} in list!`, {
        order_number: foundInList.order_number,
        payment_status: foundInList.payment_status,
        status: foundInList.status,
        id: foundInList.id,
      });
    } else {
      console.log(`  ❌ ${ORDER_CODE_TO_FIND} NOT FOUND in list`);
    }
  }

  // Test 1b: Direct query by order_number
  console.log('\n1b. Direct query by order_number (eq):');
  const { data: directOrder, error: directError } = await adminClient
    .from('orders')
    .select('*')
    .eq('order_number', ORDER_CODE_TO_FIND)
    .maybeSingle();

  if (directError) {
    console.error('  ❌ Error:', directError.message);
  } else if (directOrder) {
    console.log('  ✅ FOUND order!', {
      order_number: directOrder.order_number,
      payment_status: directOrder.payment_status,
      status: directOrder.status,
      id: directOrder.id,
    });
  } else {
    console.log('  ❌ Order NOT FOUND');
  }

  // Test 1c: Query with ilike (case-insensitive)
  console.log('\n1c. Query with ilike (case-insensitive):');
  const { data: ilikeOrders, error: ilikeError } = await adminClient
    .from('orders')
    .select('*')
    .ilike('order_number', ORDER_CODE_TO_FIND);

  if (ilikeError) {
    console.error('  ❌ Error:', ilikeError.message);
  } else {
    console.log(`  ✅ Found ${ilikeOrders?.length || 0} orders`);
    if (ilikeOrders && ilikeOrders.length > 0) {
      console.log('  Orders:', ilikeOrders.map(o => ({
        order_number: o.order_number,
        payment_status: o.payment_status,
      })));
    }
  }

  // Test 1d: Query with textSearch
  console.log('\n1d. Query with textSearch:');
  const { data: searchOrders, error: searchError } = await adminClient
    .from('orders')
    .select('*')
    .textSearch('order_number', ORDER_CODE_TO_FIND);

  if (searchError) {
    console.error('  ❌ Error:', searchError.message);
  } else {
    console.log(`  ✅ Found ${searchOrders?.length || 0} orders`);
    if (searchOrders && searchOrders.length > 0) {
      console.log('  Orders:', searchOrders.map(o => ({
        order_number: o.order_number,
        payment_status: o.payment_status,
      })));
    }
  }

  // Test 2: Dùng ANON_KEY (có RLS)
  console.log('\n========================================');
  console.log('TEST 2: Query with ANON_KEY (with RLS)');
  console.log('========================================');
  
  if (anonKey) {
    const anonClient = createClient(supabaseUrl, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    console.log('\n2a. Query ALL orders with ANON_KEY:');
    const { data: anonOrders, error: anonError } = await anonClient
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (anonError) {
      console.error('  ❌ Error:', anonError.message);
    } else {
      console.log(`  ✅ Found ${anonOrders?.length || 0} total orders`);
      console.log('  First 5 order_numbers:', anonOrders?.slice(0, 5).map(o => o.order_number));
      
      const foundInAnonList = anonOrders?.find(o => o.order_number === ORDER_CODE_TO_FIND);
      if (foundInAnonList) {
        console.log(`  ✅ FOUND ${ORDER_CODE_TO_FIND} with ANON_KEY!`);
      } else {
        console.log(`  ❌ ${ORDER_CODE_TO_FIND} NOT FOUND with ANON_KEY (RLS blocking?)`);
      }
    }
  }

  // Test 3: Check database directly với raw SQL
  console.log('\n========================================');
  console.log('TEST 3: Raw SQL query');
  console.log('========================================');
  
  const { data: sqlData, error: sqlError } = await adminClient
    .rpc('exec_sql', { 
      sql: `SELECT * FROM orders WHERE order_number = '${ORDER_CODE_TO_FIND}' LIMIT 1` 
    });

  if (sqlError) {
    console.error('  ❌ Error (expected if RPC not defined):', sqlError.message);
  } else {
    console.log('  ✅ SQL Result:', sqlData);
  }

  // Summary
  console.log('\n========================================');
  console.log('SUMMARY');
  console.log('========================================');
  console.log(`Target order: ${ORDER_CODE_TO_FIND}`);
  console.log(`Total orders in DB: ${allOrders?.length || 0}`);
  console.log(`Found in all orders list: ${allOrders?.some(o => o.order_number === ORDER_CODE_TO_FIND) ? '✅ YES' : '❌ NO'}`);
  console.log(`Found by direct query: ${directOrder ? '✅ YES' : '❌ NO'}`);
  
  if (directOrder || allOrders?.some(o => o.order_number === ORDER_CODE_TO_FIND)) {
    console.log('\n🎉 SUCCESS! Order found. Use this query method in API.');
  } else {
    console.log('\n❌ FAILED to find order. Check:');
    console.log('  1. Supabase URL is correct');
    console.log('  2. Service role key has correct permissions');
    console.log('  3. Order actually exists in database');
  }
}

// Run test
testFindOrder().catch(console.error);

