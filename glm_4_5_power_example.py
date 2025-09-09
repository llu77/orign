import requests
import json
import time

# --- إعدادات الأساس ---
API_KEY = "59329ed08ecf4830855114e61f6c6a77.pb0GWVNB5A0XRH10"  # استبدل هذا بمفتاحك الفعلي
API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"
MODEL_NAME = "glm-4.5-pro"  # النموذج الأقوى (بدلاً من الفلاش)

# --- دالة لإرسال الطلب ---
def query_glm(prompt, temperature=0.7, max_tokens=1000, stream=False):
    """
    إرسال طلب إلى نموذج GLM-4.5 (الأقوى)
    
    Args:
        prompt (str): النص المدخل
        temperature (float): تنوع الإجابة (0-1.5)
        max_tokens (int): أقصى طول للإجابة (زيادة للنموذج القوي)
        stream (bool): تمكين التدفق الفوري
        
    Returns:
        dict: استجابة النموذج أو رسالة خطأ
    """
    payload = {
        "model": MODEL_NAME,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": stream
    }
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        start_time = time.time()
        response = requests.post(API_URL, json=payload, headers=headers, timeout=60)
        
        # التحقق من حالة الاستجابة
        response.raise_for_status()
        
        # معالجة الاستجابة
        result = response.json()
        
        if stream:
            # معالجة الاستجابة المتدفق
            full_response = ""
            for chunk in response.iter_lines():
                if chunk:
                    chunk_data = json.loads(chunk[6:])  # إزالة بداية "data: "
                    if "choices" in chunk_data:
                        content = chunk_data["choices"][0]["delta"].get("content", "")
                        full_response += content
                        print(content, end="", flush=True)
            return {"content": full_response, "time": time.time() - start_time}
        else:
            # معالجة الاستجابة العادية
            content = result["choices"][0]["message"]["content"]
            return {
                "content": content,
                "usage": result.get("usage", {}),
                "time": time.time() - start_time
            }
            
    except requests.exceptions.RequestException as e:
        return {"error": f"خطأ في الاتصال: {str(e)}"}
    except json.JSONDecodeError:
        return {"error": "خطأ في معالجة JSON"}
    except KeyError:
        return {"error": "استجابة غير متوقعة من الخادم"}

# --- أمثلة الاستخدام ---
if __name__ == "__main__":
    # مثال 1: استدعاء عادي مع نموذج قوي
    print("--- مثال 1: استدعاء عادي (نموذج قوي) ---")
    response = query_glm(
        "اكتب تحليلاً مفصلاً لتأثير الذكاء الاصطناعي على الاقتصاد العالمي مع أمثلة واقعية",
        temperature=0.5,
        max_tokens=1500
    )
    if "error" not in response:
        print(f"\nالإجابة: {response['content']}")
        print(f"زمن الاستجابة: {response['time']:.2f} ثانية")
        print(f"استخدام التوكنز: {response['usage']}")
    else:
        print(response["error"])
    
    # مثال 2: استدعاء متقدم (نموذج قوي + تدفق)
    print("\n\n--- مثال 2: استدعاء متقدم (نموذج قوي + تدفق) ---")
    print("الإجابة المتدفق:")
    response = query_glm(
        "اكتب ملخصاً علمياً لبحث في الفيزياء الكم مع تفسيرات بسيطة",
        temperature=0.3,
        max_tokens=2000,
        stream=True
    )
    if "error" not in response:
        print(f"\nزمن الاستجابة: {response['time']:.2f} ثانية")
    else:
        print(response["error"])
    
    # مثال 3: توليد كود متقدم
    print("\n\n--- مثال 3: توليد كود متقدم ---")
    response = query_glm("""
    اكتب دالة بايثون لحل مسألة البرمجة الديناميكية:
    "أوجد أطول تتابع متزايد في مصفوفة"
    
    مع:
    1. شرح خوارزمية
    2. كود كامل مع تعليقات
    3. مثال تشغيلي
    """, max_tokens=1800)
    if "error" not in response:
        print(response["content"])
    else:
        print(response["error"])