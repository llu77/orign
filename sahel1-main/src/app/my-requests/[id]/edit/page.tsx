"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { 
  FileText, 
  Save, 
  ArrowLeft, 
  AlertTriangle
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
  branch: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditRequestPage() {
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
        
        // Check if user can edit this request
        if (requestData.userId !== user?.id || requestData.status !== 'pending') {
          toast({
            variant: "destructive",
            title: "خطأ",
            description: "لا يمكنك تعديل هذا الطلب",
          });
          router.push('/my-requests');
          return;
        }
        
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

  const handleInputChange = (field: keyof RequestData, value: any) => {
    if (request) {
      setRequest({ ...request, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!request) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/employee-requests/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          title: request.title,
          description: request.description,
          type: request.type,
          priority: request.priority,
        }),
      });

      if (response.ok) {
        toast({
          title: "نجاح",
          description: "تم تحديث الطلب بنجاح",
        });
        router.push('/my-requests');
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "خطأ",
          description: error.message || "فشل في تحديث الطلب",
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

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/my-requests/${request.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 ml-2" />
              العودة
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">تعديل الطلب</h1>
            <p className="text-gray-600 mt-2">تعديل بيانات الطلب</p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Save className="h-4 w-4" />
          )}
          حفظ التغييرات
        </Button>
      </div>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">
            تعديل الطلب
          </CardTitle>
          <CardDescription>
            تحديث بيانات الطلب
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                يمكنك فقط تعديل الطلبات التي تكون حالتها "قيد الانتظار"
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">عنوان الطلب</Label>
            <Input
              id="title"
              value={request.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="text-right"
              placeholder="أدخل عنوان الطلب"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type">نوع الطلب</Label>
              <Select
                value={request.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vacation">إجازة</SelectItem>
                  <SelectItem value="leave">مغادرة</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">الأولوية</Label>
              <Select
                value={request.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={request.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="min-h-[120px] text-right resize-none"
              placeholder="أدخل وصفاً تفصيلياً للطلب..."
            />
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  جاري الحفظ...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save className="h-5 w-5 ml-2" />
                  حفظ التغييرات
                </div>
              )}
            </Button>
            
            <Link href={`/my-requests/${request.id}`}>
              <Button variant="outline" className="flex-1">
                إلغاء
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}