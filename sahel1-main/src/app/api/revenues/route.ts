import { NextRequest, NextResponse } from 'next/server';
import { readData, addItem, updateItem, deleteItem, getItemsByDate } from '@/lib/db-storage';

// Revenue type definition
interface Revenue {
  id?: number;
  amount: number;
  date: string;
  description?: string;
  category: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
}

// GET all revenues with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    
    let revenues = readData('revenues');
    
    // Apply filters
    if (search) {
      revenues = revenues.filter((r: Revenue) => 
        r.description?.toLowerCase().includes(search.toLowerCase()) ||
        r.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category) {
      revenues = revenues.filter((r: Revenue) => r.category === category);
    }
    
    if (startDate) {
      revenues = revenues.filter((r: Revenue) => r.date >= startDate);
    }
    
    if (endDate) {
      revenues = revenues.filter((r: Revenue) => r.date <= endDate);
    }
    
    // Sort by date (newest first)
    revenues.sort((a: Revenue, b: Revenue) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRevenues = revenues.slice(startIndex, endIndex);
    
    return NextResponse.json({
      revenues: paginatedRevenues,
      pagination: {
        current: page,
        total: Math.ceil(revenues.length / limit),
        count: revenues.length
      }
    });
  } catch (error) {
    console.error('Error fetching revenues:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الإيرادات' },
      { status: 500 }
    );
  }
}

// POST new revenue
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['amount', 'date', 'category', 'user_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `الحقل ${field} مطلوب` },
          { status: 400 }
        );
      }
    }
    
    // Create new revenue
    const newRevenue = {
      amount: Number(body.amount),
      date: body.date,
      description: body.description || '',
      category: body.category,
      user_id: Number(body.user_id),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const savedRevenue = addItem('revenues', newRevenue);
    
    return NextResponse.json({
      message: 'تمت إضافة الإيراد بنجاح',
      revenue: savedRevenue
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating revenue:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء الإيراد' },
      { status: 500 }
    );
  }
}

// PUT update revenue
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'معرف الإيراد مطلوب' },
        { status: 400 }
      );
    }
    
    const updateData = {
      amount: Number(body.amount),
      date: body.date,
      description: body.description || '',
      category: body.category,
      updated_at: new Date().toISOString()
    };
    
    const updatedRevenue = updateItem('revenues', body.id, updateData);
    
    if (!updatedRevenue) {
      return NextResponse.json(
        { error: 'الإيراد غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'تم تحديث الإيراد بنجاح',
      revenue: updatedRevenue
    });
  } catch (error) {
    console.error('Error updating revenue:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث الإيراد' },
      { status: 500 }
    );
  }
}

// DELETE revenue
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف الإيراد مطلوب' },
        { status: 400 }
      );
    }
    
    const deleted = deleteItem('revenues', Number(id));
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'الإيراد غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'تم حذف الإيراد بنجاح' });
  } catch (error) {
    console.error('Error deleting revenue:', error);
    return NextResponse.json(
      { error: 'فشل في حذف الإيراد' },
      { status: 500 }
    );
  }
}