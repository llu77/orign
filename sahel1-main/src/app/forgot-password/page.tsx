"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Key, 
  Mail, 
  ArrowLeft, 
  Send, 
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال البريد الإلكتروني",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSent(true);
        toast({
          title: "نجاح",
          description: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
        });
      } else {
        const error = await response.json();
        toast({
          variant: "destructive",
          title: "خطأ",
          description: error.message || "فشل في إرسال رابط إعادة تعيين كلمة المرور",
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

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card className="w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                تم الإرسال بنجاح
              </CardTitle>
              <CardDescription>
                تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-sm text-gray-600">
                <p className="mb-4">
                  قم بفحص بريدك الإلكتروني واتباع التعليمات لإعادة تعيين كلمة المرور الخاصة بك.
                </p>
                <p>
                  إذا لم تستلم الرابط خلال بضع دقائق، تحقق من مجلد الرسائل غير المرغوب فيها.
                </p>
              </div>
              
              <div className="space-y-4">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  العودة لتسجيل الدخول
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setSent(false);
                    setEmail("");
                  }}
                  className="w-full"
                >
                  إعادة المحاولة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Key className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">نسيت كلمة المرور؟</h2>
          <p className="mt-2 text-gray-600">
            أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور
          </p>
        </div>
        
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-center">إعادة تعيين كلمة المرور</CardTitle>
            <CardDescription className="text-center">
              أدخل بريدك الإلكتروني المسجل في النظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="h-4 w-4 ml-2 text-blue-600" />
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-right"
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link href="/login" className="flex items-center text-blue-600 hover:text-blue-500">
                  <ArrowLeft className="h-4 w-4 ml-1" />
                  العودة لتسجيل الدخول
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري الإرسال...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Send className="h-4 w-4 ml-2" />
                    إرسال رابط إعادة التعيين
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>تذكرت كلمة المرور؟</p>
          <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            سجل دخولك الآن
          </Link>
        </div>
      </div>
    </div>
  );
}