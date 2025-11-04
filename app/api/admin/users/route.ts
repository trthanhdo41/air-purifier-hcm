import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Check if user is admin
async function isAdmin() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    // Check if user is admin
    return user.email === 'admin@hoithoxanh.com' || user.user_metadata?.role === 'admin';
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    // Check if user is admin
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get all users
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Format users data
    const users = (data?.users || []).map((user: any) => ({
      id: user.id,
      email: user.email,
      phone: user.user_metadata?.phone || user.phone || null,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      role: user.user_metadata?.role || (user.email === 'admin@hoithoxanh.com' ? 'admin' : 'user'),
      name: user.user_metadata?.full_name || user.user_metadata?.name,
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const body = await request.json();
    const { email, password, name, phone, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: name || null,
        phone: phone || null,
        role: role || 'user',
      },
    });

    if (error) {
      console.error('Error creating user:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name,
        phone: data.user.user_metadata?.phone,
        role: data.user.user_metadata?.role || 'user',
      },
    });
  } catch (error: any) {
    console.error('Error in POST route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const body = await request.json();
    const { id, email, password, name, phone, role } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update user
    const updateData: any = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    
    // Merge with existing metadata
    const { data: existingUser } = await supabase.auth.admin.getUserById(id);
    const existingMetadata = existingUser?.user?.user_metadata || {};
    
    updateData.user_metadata = {
      ...existingMetadata,
      ...(name !== undefined && { full_name: name }),
      ...(phone !== undefined && { phone: phone || null }),
      ...(role !== undefined && { role: role || 'user' }),
    };

    const { data, error } = await supabase.auth.admin.updateUserById(id, updateData);

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name,
        phone: data.user.user_metadata?.phone,
        role: data.user.user_metadata?.role || 'user',
      },
    });
  } catch (error: any) {
    console.error('Error in PUT route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Missing Supabase configuration' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Prevent deleting admin account
    const { data: user } = await supabase.auth.admin.getUserById(id);
    if (user?.user?.email === 'admin@hoithoxanh.com') {
      return NextResponse.json(
        { error: 'Cannot delete admin account' },
        { status: 400 }
      );
    }

    // Delete user
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      console.error('Error deleting user:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error in DELETE route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

