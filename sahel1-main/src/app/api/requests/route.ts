import { NextRequest, NextResponse } from 'next/server';
import { readData, addItem, updateItem, deleteItem } from '@/lib/db-storage';

// Request type definition
interface Request {
  id?: number;
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  user_id: number;
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}

// GET all requests with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const userId = searchParams.get('userId') || '';
    const priority = searchParams.get('priority') || '';
    
    let requests = readData('requests');
    
    // Apply filters
    if (status) {
      requests = requests.filter((r: Request) => r.status === status);
    }
    
    if (userId) {
      requests = requests.filter((r: Request) => r.user_id === Number(userId));
    }
    
    if (priority) {
      requests = requests.filter((r: Request) => r.priority === priority);
    }
    
    // Sort by date (newest first)
    requests.sort((a: Request, b: Request) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRequests = requests.slice(startIndex, endIndex);
    
    return NextResponse.json({
      requests: paginatedRequests,
      pagination: {
        current: page,
        total: Math.ceil(requests.length / limit),
        count: requests.length
      }
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الطلبات' },
      { status: 500 }
    );
  }
}

// POST new request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'user_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `الحقل ${field} مطلوب` },
          { status: 400 }
        );
      }
    }
    
    // Create new request
    const newRequest = {
      title: body.title,
      description: body.description || '',
      status: 'pending',
      priority: body.priority || 'medium',
      user_id: Number(body.user_id),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const savedRequest = addItem('requests', newRequest);
    
    return NextResponse.json({
      message: 'تم إنشاء الطلب بنجاح',
      request: savedRequest
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating request:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء الطلب' },
      { status: 500 }
    );
  }
}

// PUT update request
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'معرف الطلب مطلوب' },
        { status: 400 }
      );
    }
    
    const updateData = {
      title: body.title,
      description: body.description || '',
      status: body.status,
      priority: body.priority,
      admin_notes: body.admin_notes || '',
      updated_at: new Date().toISOString()
    };
    
    const updatedRequest = updateItem('requests', body.id, updateData);
    
    if (!updatedRequest) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'تم تحديث الطلب بنجاح',
      request: updatedRequest
    });
  } catch (error) {
    console.error('Error updating request:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث الطلب' },
      { status: 500 }
    );
  }
}

// DELETE request
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف الطلب مطلوب' },
        { status: 400 }
      );
    }
    
    const deleted = deleteItem('requests', Number(id));
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'تم حذف الطلب بنجاح' });
  } catch (error) {
    console.error('Error deleting request:', error);
    return NextResponse.json(
      { error: 'فشل في حذف الطلب' },
      { status: 500 }
    );
  }
}