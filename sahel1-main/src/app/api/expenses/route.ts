import { NextRequest, NextResponse } from 'next/server';
import { readData, addItem, updateItem, deleteItem, getItemsByDate } from '@/lib/db-storage';

// Expense type definition
interface Expense {
  id?: number;
  amount: number;
  date: string;
  description?: string;
  category: string;
  user_id: number;
  created_at?: string;
  updated_at?: string;
}

// GET all expenses with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    
    let expenses = readData('expenses');
    
    // Apply filters
    if (search) {
      expenses = expenses.filter((e: Expense) => 
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (category) {
      expenses = expenses.filter((e: Expense) => e.category === category);
    }
    
    if (startDate) {
      expenses = expenses.filter((e: Expense) => e.date >= startDate);
    }
    
    if (endDate) {
      expenses = expenses.filter((e: Expense) => e.date <= endDate);
    }
    
    // Sort by date (newest first)
    expenses.sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedExpenses = expenses.slice(startIndex, endIndex);
    
    return NextResponse.json({
      expenses: paginatedExpenses,
      pagination: {
        current: page,
        total: Math.ceil(expenses.length / limit),
        count: expenses.length
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'فشل في جلب المصروفات' },
      { status: 500 }
    );
  }
}

// POST new expense
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
    
    // Create new expense
    const newExpense = {
      amount: Number(body.amount),
      date: body.date,
      description: body.description || '',
      category: body.category,
      user_id: Number(body.user_id),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const savedExpense = addItem('expenses', newExpense);
    
    return NextResponse.json({
      message: 'تمت إضافة المصروف بنجاح',
      expense: savedExpense
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء المصروف' },
      { status: 500 }
    );
  }
}

// PUT update expense
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: 'معرف المصروف مطلوب' },
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
    
    const updatedExpense = updateItem('expenses', body.id, updateData);
    
    if (!updatedExpense) {
      return NextResponse.json(
        { error: 'المصروف غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      message: 'تم تحديث المصروف بنجاح',
      expense: updatedExpense
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث المصروف' },
      { status: 500 }
    );
  }
}

// DELETE expense
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'معرف المصروف مطلوب' },
        { status: 400 }
      );
    }
    
    const deleted = deleteItem('expenses', Number(id));
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'المصروف غير موجود' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'تم حذف المصروف بنجاح' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: 'فشل في حذف المصروف' },
      { status: 500 }
    );
  }
}