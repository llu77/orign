
"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DollarSign, FileText, Plus, Edit, Trash2, Search } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import RevenueForm from '@/components/revenue-form';

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: React.ElementType }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
);

export default function RevenuesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [revenues, setRevenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState(null);
  
  const filteredRevenues = React.useMemo(() => {
    if (!revenues || !Array.isArray(revenues)) return [];
    
    return revenues.filter(revenue => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        revenue.description?.toLowerCase().includes(searchLower) ||
        revenue.category?.toLowerCase().includes(searchLower) ||
        revenue.amount?.toString().includes(searchTerm)
      );
    });
  }, [revenues, searchTerm]);

  const fetchRevenues = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/revenues', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRevenues(data.revenues || []);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في جلب الإيرادات",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteRevenue = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الإيراد؟')) return;
    
    try {
      const response = await fetch(`/api/revenues?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        toast({
          title: "نجاح",
          description: "تم حذف الإيراد بنجاح",
        });
        fetchRevenues();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حذف الإيراد",
      });
    }
  };

  useEffect(() => {
    fetchRevenues();
  }, []);

  const handleEditRevenue = (revenue) => {
    setEditingRevenue(revenue);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingRevenue(null);
  };
  
  const totalRevenue = filteredRevenues.reduce((acc, curr) => acc + (curr.amount || 0), 0);


  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">الإيرادات</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="ml-2 h-4 w-4" />
          {showForm ? "إلغاء" : "إضافة إيراد"}
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <StatCard title="إجمالي الإيرادات" value={`${totalRevenue.toLocaleString()} ريال`} icon={DollarSign} />
        <StatCard title="عدد الإيرادات" value={filteredRevenues.length.toString()} icon={FileText} />
      </div>

      {showForm && (
        <div className="mb-8">
          <RevenueForm 
            onSuccess={() => {
              handleFormClose();
              fetchRevenues();
            }}
            initialData={editingRevenue}
            onCancel={handleFormClose}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>قائمة الإيرادات</CardTitle>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في الإيرادات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : filteredRevenues.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      لا توجد إيرادات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRevenues.map((revenue) => (
                    <TableRow key={revenue.id}>
                      <TableCell>
                        <div className="font-medium">{revenue.description || 'لا يوجد وصف'}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{revenue.category}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {(revenue.amount || 0).toLocaleString()} ريال
                      </TableCell>
                      <TableCell>
                        {revenue.date ? format(new Date(revenue.date), 'PPP', { locale: ar }) : 'غير محدد'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRevenue(revenue)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteRevenue(revenue.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
