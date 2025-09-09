"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { 
  Package, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Edit,
  MessageSquare,
  Truck
} from "lucide-react";
import Link from "next/link";

interface ProductRequestData {
  id: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  status: 'pending' | 'approved' | 'rejected' | 'delivered';
  priority: 'low' | 'medium' | 'high';
  userId: string;
  userName: string;
  branch: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  deliveredAt?: string;
}

export default function ProductRequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<ProductRequestData | null>(null);

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/product-requests/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const requestData = await response.json();
        setRequest(requestData);
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في جلب بيانات طلب المنتج",
        });
        router.push('/product-requests');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في الاتصال بالخادم",
      });
    }
  };

  const handleApprove = async () => {
    if (!request) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/product-requests/${request.id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        toast({
          title: "نجاح",
          description: "تم الموافقة على الطلب بنجاح",
        });
        fetchRequest(); // Refresh data
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في الموافقة على الطلب",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في الاتصال بالخادم",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!request) return;

    const reason = prompt('أدخل سبب الرفض:');
    if (!reason) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/product-requests/${request.id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        toast({
          title: "نجاح",
          description: "تم رفض الطلب بنجاح",
        });
        fetchRequest(); // Refresh data
      } else {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "فشل في رفض الطلب",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في الاتصال بالخادم",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">قيد الانتظار</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">موافق عليه</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">مرفوض</Badge>;
      case 'delivered':
        return <Badge className="bg-blue-100 text-blue-800">تم التسليم</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'delivered':
        return <Truck className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800">عالية</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">متوسطة</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800">منخفضة</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const canApproveReject = hasPermission('approve_requests') && request.status === 'pending';

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/product-requests">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تفاصيل طلب المنتج</h1>
            <p className="text-gray-600 mt-2">عرض تفاصيل طلب المنتج المقدم</p>
          </div>
        </div>
        
        {canApproveReject && (
          <div className="flex gap-2">
            <Button
              onClick={handleApprove}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 ml-2" />
              موافقة
            </Button>
            <Button
              onClick={handleReject}
              disabled={loading}
              variant="destructive"
            >
              <XCircle className="h-4 w-4 ml-2" />
              رفض
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* المعلومات الأساسية */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              معلومات الطلب
            </CardTitle>
            <CardDescription>
              التفاصيل الأساسية لطلب المنتج
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{request.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(request.status)}
                  {getPriorityBadge(request.priority)}
                </div>
              </div>
              {getStatusIcon(request.status)}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">الكمية</Label>
                <div className="text-lg font-semibold">
                  {request.quantity} {request.unit}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">الفرع</Label>
                <div className="text-sm">{request.branch}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">تاريخ التقديم</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  {formatDate(request.createdAt)}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">آخر تحديث</Label>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  {formatDate(request.updatedAt)}
                </div>
              </div>

              {request.approvedAt && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">تاريخ الموافقة</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {formatDate(request.approvedAt)}
                  </div>
                </div>
              )}

              {request.deliveredAt && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">تاريخ التسليم</Label>
                  <div className="flex items-center gap-2 text-sm">
                    <Truck className="h-4 w-4 text-blue-500" />
                    {formatDate(request.deliveredAt)}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">الوصف</Label>
              <div className="p-4 bg-gray-50 rounded-lg text-sm leading-relaxed">
                {request.description}
              </div>
            </div>

            {request.rejectionReason && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  سبب الرفض
                </Label>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  {request.rejectionReason}
                </div>
              </div>
            )}

            {request.approvedBy && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-500">وافقت عليه</Label>
                <div className="text-sm">{request.approvedBy}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* معلومات مقدم الطلب */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              مقدم الطلب
            </CardTitle>
            <CardDescription>
              معلومات مقدم الطلب
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium">{request.userName}</div>
                <div className="text-sm text-gray-500">{request.branch}</div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">الحالة</span>
                {getStatusBadge(request.status)}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">الأولوية</span>
                {getPriorityBadge(request.priority)}
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">الكمية</span>
                <span className="font-medium">{request.quantity} {request.unit}</span>
              </div>
            </div>

            {canApproveReject && (
              <div className="pt-4 border-t space-y-2">
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 ml-2" />
                  موافقة
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  <XCircle className="h-4 w-4 ml-2" />
                  رفض
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}