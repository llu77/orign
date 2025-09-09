"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { 
  FileText, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ArrowLeft,
  Edit,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

interface RequestData {
  id: string;
  title: string;
  description: string;
  type: 'vacation' | 'leave' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high';
  userId: string;
  userName: string;
  branch: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

export default function RequestDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState<RequestData | null>(null);

  useEffect(() => {
    fetchRequest();
  }, [params.id]);

  const fetchRequest = async () => {
    try {
      const response = await fetch(`/api/employee-requests/${params.id}`, {
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
          description: "فشل في جلب بيانات الطلب",
        });
        router.push('/my-requests');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ في الاتصال بالخادم",
      });
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

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vacation': return 'إجازة';
      case 'leave': return 'مغادرة';
      case 'other': return 'أخرى';
      default: return type;
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

  const canEdit = request.status === 'pending' && request.userId === user?.id;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/my-requests">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تفاصيل الطلب</h1>
            <p className="text-gray-600 mt-2">عرض تفاصيل الطلب المقدم</p>
          </div>
        </div>
        {canEdit && (
          <Link href={`/my-requests/${request.id}/edit`}>
            <Button className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              تعديل الطلب
            </Button>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* المعلومات الأساسية */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              معلومات الطلب
            </CardTitle>
            <CardDescription>
              التفاصيل الأساسية للطلب
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
                <Label className="text-sm font-medium text-gray-500">نوع الطلب</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {getTypeLabel(request.type)}
                  </Badge>
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
                <span className="text-sm text-gray-500">النوع</span>
                <Badge variant="outline">
                  {getTypeLabel(request.type)}
                </Badge>
              </div>
            </div>

            {canEdit && (
              <div className="pt-4 border-t">
                <Link href={`/my-requests/${request.id}/edit`}>
                  <Button className="w-full">
                    <Edit className="h-4 w-4 ml-2" />
                    تعديل الطلب
                  </Button>
                </Link>
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