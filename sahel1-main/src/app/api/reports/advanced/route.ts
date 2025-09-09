import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from '@tsndr/cloudflare-worker-jwt';

interface AdvancedFinancialReport {
  totalRevenues: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  revenuesByCategory: { category: string; amount: number; percentage: number }[];
  expensesByCategory: { category: string; amount: number; percentage: number }[];
  monthlyTrends: { month: string; revenue: number; expense: number; profit: number; growth: number }[];
  weeklyTrends: { week: string; revenue: number; expense: number; profit: number }[];
  branchComparison: { branch: string; revenue: number; expense: number; profit: number; transactions: number }[];
  topCustomers: { name: string; revenue: number; transactions: number; lastTransaction: string }[];
  topProducts: { name: string; revenue: number; quantity: number; profit: number }[];
  cashFlow: { date: string; inflow: number; outflow: number; balance: number }[];
  performanceMetrics: {
    revenueGrowth: number;
    expenseGrowth: number;
    profitGrowth: number;
    averageTransactionValue: number;
    customerRetention: number;
    inventoryTurnover: number;
  };
  alerts: {
    type: 'warning' | 'success' | 'error' | 'info';
    message: string;
    value?: number;
    trend?: 'up' | 'down';
  }[];
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
    const branch = searchParams.get('branch');

    // Get database instance
    const db = process.env.DB as any;

    // Build queries based on parameters
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

    if (branch && branch !== 'all') {
      revenueQuery += ' AND branch = ?';
      expenseQuery += ' AND branch = ?';
      params.push(branch);
    }

    // Execute queries
    const revenues = await db.prepare(revenueQuery).bind(...params).all();
    const expenses = await db.prepare(expenseQuery).bind(...params).all();

    const revenueData = revenues.results || [];
    const expenseData = expenses.results || [];

    // Calculate totals
    const totalRevenues = revenueData.reduce((sum: number, r: any) => sum + r.amount, 0);
    const totalExpenses = expenseData.reduce((sum: number, e: any) => sum + e.amount, 0);
    const netProfit = totalRevenues - totalExpenses;
    const profitMargin = totalRevenues > 0 ? (netProfit / totalRevenues) * 100 : 0;

    // Group by category with percentages
    const revenuesByCategory = revenueData.reduce((acc: any[], r: any) => {
      const existing = acc.find(item => item.category === r.category);
      if (existing) {
        existing.amount += r.amount;
      } else {
        acc.push({ category: r.category, amount: r.amount, percentage: 0 });
      }
      return acc;
    }, []);

    revenuesByCategory.forEach((item: any) => {
      item.percentage = totalRevenues > 0 ? (item.amount / totalRevenues) * 100 : 0;
    });

    const expensesByCategory = expenseData.reduce((acc: any[], e: any) => {
      const existing = acc.find(item => item.category === e.category);
      if (existing) {
        existing.amount += e.amount;
      } else {
        acc.push({ category: e.category, amount: e.amount, percentage: 0 });
      }
      return acc;
    }, []);

    expensesByCategory.forEach((item: any) => {
      item.percentage = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
    });

    // Calculate monthly trends with growth
    const monthlyData = new Map();
    
    revenueData.forEach((r: any) => {
      const month = new Date(r.date).toISOString().substring(0, 7);
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { revenue: 0, expense: 0, profit: 0 });
      }
      monthlyData.get(month).revenue += r.amount;
    });

    expenseData.forEach((e: any) => {
      const month = new Date(e.date).toISOString().substring(0, 7);
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { revenue: 0, expense: 0, profit: 0 });
      }
      monthlyData.get(month).expense += e.amount;
    });

    monthlyData.forEach((data, month) => {
      data.profit = data.revenue - data.expense;
    });

    const monthlyTrends = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('ar-SA', { month: 'short', year: 'numeric' }),
        revenue: data.revenue,
        expense: data.expense,
        profit: data.profit,
        growth: 0 // Will be calculated below
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());

    // Calculate growth rates
    for (let i = 1; i < monthlyTrends.length; i++) {
      const prevRevenue = monthlyTrends[i - 1].revenue;
      const currentRevenue = monthlyTrends[i].revenue;
      monthlyTrends[i].growth = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    }

    // Calculate weekly trends
    const weeklyData = new Map();
    
    revenueData.forEach((r: any) => {
      const date = new Date(r.date);
      const week = getWeekNumber(date);
      const weekKey = `${date.getFullYear()}-W${week}`;
      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, { revenue: 0, expense: 0, profit: 0 });
      }
      weeklyData.get(weekKey).revenue += r.amount;
    });

    expenseData.forEach((e: any) => {
      const date = new Date(e.date);
      const week = getWeekNumber(date);
      const weekKey = `${date.getFullYear()}-W${week}`;
      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, { revenue: 0, expense: 0, profit: 0 });
      }
      weeklyData.get(weekKey).expense += e.amount;
    });

    weeklyData.forEach((data) => {
      data.profit = data.revenue - data.expense;
    });

    const weeklyTrends = Array.from(weeklyData.entries())
      .map(([week, data]) => ({
        week: week,
        revenue: data.revenue,
        expense: data.expense,
        profit: data.profit
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8); // Last 8 weeks

    // Branch comparison
    const branchComparison = [];
    
    for (const branchName of ['laban', 'tuwaiq']) {
      const branchRevenues = revenueData.filter((r: any) => r.branch === branchName);
      const branchExpenses = expenseData.filter((e: any) => e.branch === branchName);
      
      const branchRevenue = branchRevenues.reduce((sum: number, r: any) => sum + r.amount, 0);
      const branchExpense = branchExpenses.reduce((sum: number, e: any) => sum + e.amount, 0);
      const branchProfit = branchRevenue - branchExpense;
      const branchTransactions = branchRevenues.length + branchExpenses.length;

      branchComparison.push({
        branch: branchName,
        revenue: branchRevenue,
        expense: branchExpense,
        profit: branchProfit,
        transactions: branchTransactions
      });
    }

    // Top customers (simplified - using customer data from revenues)
    const customerData = new Map();
    revenueData.forEach((r: any) => {
      const customerName = r.customerName || 'عميل غير معروف';
      if (!customerData.has(customerName)) {
        customerData.set(customerName, { revenue: 0, transactions: 0, lastTransaction: r.date });
      }
      customerData.get(customerName).revenue += r.amount;
      customerData.get(customerName).transactions += 1;
      if (new Date(r.date) > new Date(customerData.get(customerName).lastTransaction)) {
        customerData.get(customerName).lastTransaction = r.date;
      }
    });

    const topCustomers = Array.from(customerData.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Top products (simplified)
    const productData = new Map();
    revenueData.forEach((r: any) => {
      const productName = r.productName || 'منتج غير معروف';
      if (!productData.has(productName)) {
        productData.set(productName, { revenue: 0, quantity: 0, profit: 0 });
      }
      productData.get(productName).revenue += r.amount;
      productData.get(productName).quantity += r.quantity || 1;
      productData.get(productName).profit += r.profit || r.amount * 0.3; // Assuming 30% profit margin
    });

    const topProducts = Array.from(productData.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Cash flow analysis
    const cashFlowData = new Map();
    const allDates = [...new Set([...revenueData.map((r: any) => r.date), ...expenseData.map((e: any) => e.date)])].sort();
    
    allDates.forEach(date => {
      const dayRevenues = revenueData.filter((r: any) => r.date === date).reduce((sum: number, r: any) => sum + r.amount, 0);
      const dayExpenses = expenseData.filter((e: any) => e.date === date).reduce((sum: number, e: any) => sum + e.amount, 0);
      const dayBalance = dayRevenues - dayExpenses;
      
      cashFlowData.set(date, {
        date: new Date(date).toLocaleDateString('ar-SA'),
        inflow: dayRevenues,
        outflow: dayExpenses,
        balance: dayBalance
      });
    });

    const cashFlow = Array.from(cashFlowData.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Performance metrics
    const totalTransactions = revenueData.length + expenseData.length;
    const averageTransactionValue = totalTransactions > 0 ? (totalRevenues + totalExpenses) / totalTransactions : 0;
    
    // Calculate growth rates
    const revenueGrowth = monthlyTrends.length > 1 ? 
      ((monthlyTrends[monthlyTrends.length - 1].revenue - monthlyTrends[0].revenue) / monthlyTrends[0].revenue) * 100 : 0;
    
    const expenseGrowth = monthlyTrends.length > 1 ? 
      ((monthlyTrends[monthlyTrends.length - 1].expense - monthlyTrends[0].expense) / monthlyTrends[0].expense) * 100 : 0;
    
    const profitGrowth = monthlyTrends.length > 1 ? 
      ((monthlyTrends[monthlyTrends.length - 1].profit - monthlyTrends[0].profit) / Math.abs(monthlyTrends[0].profit || 1)) * 100 : 0;

    // Generate alerts
    const alerts = [];
    
    if (profitMargin < 10) {
      alerts.push({
        type: 'warning' as const,
        message: 'هامش الربح منخفض',
        value: profitMargin,
        trend: profitMargin < 5 ? 'down' : undefined
      });
    }
    
    if (revenueGrowth < 0) {
      alerts.push({
        type: 'error' as const,
        message: 'انخفاض في الإيرادات',
        value: revenueGrowth,
        trend: 'down'
      });
    }
    
    if (expenseGrowth > 20) {
      alerts.push({
        type: 'warning' as const,
        message: 'زيادة كبيرة في المصروفات',
        value: expenseGrowth,
        trend: 'up'
      });
    }
    
    if (netProfit > 0) {
      alerts.push({
        type: 'success' as const,
        message: 'الأرباح إيجابية',
        value: netProfit,
        trend: 'up'
      });
    }
    
    if (totalTransactions < 50) {
      alerts.push({
        type: 'info' as const,
        message: 'عدد المعاملات منخفض',
        value: totalTransactions
      });
    }

    const report: AdvancedFinancialReport = {
      totalRevenues,
      totalExpenses,
      netProfit,
      profitMargin,
      revenuesByCategory,
      expensesByCategory,
      monthlyTrends,
      weeklyTrends,
      branchComparison,
      topCustomers,
      topProducts,
      cashFlow,
      performanceMetrics: {
        revenueGrowth,
        expenseGrowth,
        profitGrowth,
        averageTransactionValue,
        customerRetention: 85, // Mock data
        inventoryTurnover: 12.5 // Mock data
      },
      alerts
    };

    return NextResponse.json(report);

  } catch (error) {
    console.error('Advanced report generation error:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء التقرير المتقدم' },
      { status: 500 }
    );
  }
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}