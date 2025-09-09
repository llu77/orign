import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from '@tsndr/cloudflare-worker-jwt';

interface FinancialReport {
  totalRevenues: number;
  totalExpenses: number;
  netProfit: number;
  revenuesByCategory: { category: string; amount: number }[];
  expensesByCategory: { category: string; amount: number }[];
  monthlyTrends: { month: string; revenue: number; expense: number }[];
  topRevenues: { description: string; amount: number; date: string }[];
  topExpenses: { description: string; amount: number; date: string }[];
}

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ error: 'الرجاء تسجيل الدخول' }, { status: 401 });
    }

    const isValid = await jwtVerify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (!isValid) {
      return NextResponse.json({ error: 'جلسة غير صالحة' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build the base queries
    let revenueQuery = 'SELECT * FROM revenues WHERE 1=1';
    let expenseQuery = 'SELECT * FROM expenses WHERE 1=1';
    const params: any[] = [];

    if (startDate) {
      revenueQuery += ' AND date >= ?';
      expenseQuery += ' AND date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      revenueQuery += ' AND date <= ?';
      expenseQuery += ' AND date <= ?';
      params.push(endDate);
    }

    // Get database instance
    const db = process.env.DB as any;

    // Execute queries
    const revenues = await db.prepare(revenueQuery).bind(...params).all();
    const expenses = await db.prepare(expenseQuery).bind(...params).all();

    // Calculate totals
    const totalRevenues = revenues.results?.reduce((sum: number, r: any) => sum + r.amount, 0) || 0;
    const totalExpenses = expenses.results?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
    const netProfit = totalRevenues - totalExpenses;

    // Group by category
    const revenuesByCategory = revenues.results?.reduce((acc: any[], r: any) => {
      const existing = acc.find(item => item.category === r.category);
      if (existing) {
        existing.amount += r.amount;
      } else {
        acc.push({ category: r.category, amount: r.amount });
      }
      return acc;
    }, []) || [];

    const expensesByCategory = expenses.results?.reduce((acc: any[], e: any) => {
      const existing = acc.find(item => item.category === e.category);
      if (existing) {
        existing.amount += e.amount;
      } else {
        acc.push({ category: e.category, amount: e.amount });
      }
      return acc;
    }, []) || [];

    // Calculate monthly trends
    const monthlyData = new Map();
    
    revenues.results?.forEach((r: any) => {
      const month = new Date(r.date).toISOString().substring(0, 7);
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { revenue: 0, expense: 0 });
      }
      monthlyData.get(month).revenue += r.amount;
    });

    expenses.results?.forEach((e: any) => {
      const month = new Date(e.date).toISOString().substring(0, 7);
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { revenue: 0, expense: 0 });
      }
      monthlyData.get(month).expense += e.amount;
    });

    const monthlyTrends = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('ar-SA', { month: 'short', year: 'numeric' }),
        revenue: data.revenue,
        expense: data.expense
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Get top revenues and expenses
    const topRevenues = revenues.results
      ?.sort((a: any, b: any) => b.amount - a.amount)
      .slice(0, 5)
      .map((r: any) => ({
        description: r.description || 'بدون وصف',
        amount: r.amount,
        date: r.date
      })) || [];

    const topExpenses = expenses.results
      ?.sort((a: any, b: any) => b.amount - a.amount)
      .slice(0, 5)
      .map((e: any) => ({
        description: e.description || 'بدون وصف',
        amount: e.amount,
        date: e.date
      })) || [];

    const report: FinancialReport = {
      totalRevenues,
      totalExpenses,
      netProfit,
      revenuesByCategory,
      expensesByCategory,
      monthlyTrends,
      topRevenues,
      topExpenses
    };

    return NextResponse.json(report);

  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء التقرير' },
      { status: 500 }
    );
  }
}