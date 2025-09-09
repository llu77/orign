import { NextRequest, NextResponse } from 'next/server';
import { readData, addItem, updateItem, deleteItem } from '@/lib/db-storage';

// Product Request type definition
interface ProductRequest {
  id?: number;
  title: string;
  description: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'delivered';
  user_id: number;
  admin_notes?: string;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
}

// GET all product requests with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const userId = searchParams.get('userId') || '';
    
    let productRequests = readData('product_requests');
    
    // Apply filters
    if (status) {
      productRequests = productRequests.filter((pr: ProductRequest) => pr.status === status);
    }
    
    if (userId) {
      productRequests = productRequests.filter((pr: ProductRequest) => pr.user_id === Number(userId));
    }
    
    // Sort by date (newest first)
    productRequests.sort((a: ProductRequest, b: ProductRequest) => 
      new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
    );
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRequests = productRequests.slice(startIndex, endIndex);
    
    return NextResponse.json({
      productRequests: paginatedRequests,
      pagination: {
        current: page,
        total: Math.ceil(productRequests.length / limit),
        count: productRequests.length
      }
    });
  } catch (error) {
    console.error('Error fetching product requests:', error);
    return NextResponse.json(
      { error: 'فشل في جلب طلبات المنتجات' },
      { status: 500 }
    );
  }
}

// POST new product request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'quantity', 'user_id'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `الحقل ${field} مطلوب` },
          { status: 400 }
        );
      }
    }
    
    // Calculate total price if unit price is provided
    const totalPrice = body.unit_price ? Number(body.quantity) * Number(body.unit_price) : undefined;
    
    // Create new product request
    const newProductRequest = {
      title: body.title,
      description: body.description,
      quantity: Number(body.quantity),
      unit_price: body.unit_price ? Number(body.unit_price) : undefined,
      total_price: totalPrice,
      status: 'pending',
      user_id: Number(body.user_id),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const savedRequest = addItem('product_requests', newProductRequest);
    
    return NextResponse.json({
      message: 'تم إنشاء طلب المنتج بنجاح',
      productRequest: savedRequest
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product request:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء طلب المنتج' },
      { status: 500 }
    );
  }
}

// PUT update product request
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }
    
    const requests = readProductRequests();
    const index = requests.findIndex((r: any) => r.id === body.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Product request not found' },
        { status: 404 }
      );
    }
    
    requests[index] = {
      ...requests[index],
      ...body,
      updated_at: new Date().toISOString()
    };
    
    writeProductRequests(requests);
    
    return NextResponse.json(requests[index]);
  } catch (error) {
    console.error('Error updating product request:', error);
    return NextResponse.json(
      { error: 'Failed to update product request' },
      { status: 500 }
    );
  }
}

// DELETE product request
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }
    
    const requests = readProductRequests();
    const filtered = requests.filter((r: any) => r.id !== id);
    
    if (filtered.length === requests.length) {
      return NextResponse.json(
        { error: 'Product request not found' },
        { status: 404 }
      );
    }
    
    writeProductRequests(filtered);
    
    return NextResponse.json({ message: 'Product request deleted successfully' });
  } catch (error) {
    console.error('Error deleting product request:', error);
    return NextResponse.json(
      { error: 'Failed to delete product request' },
      { status: 500 }
    );
  }
}