import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;

        if (!file) {
            return NextResponse.json({ error: "Dosya seçilmedi" }, { status: 400 });
        }

        // Check file size (max 6MB for freeimage.host)
        if (file.size > 6 * 1024 * 1024) {
            return NextResponse.json({ error: "Dosya boyutu çok büyük (max 6MB)" }, { status: 400 });
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: "Sadece görsel dosyaları yükleyebilirsiniz" }, { status: 400 });
        }

        // Convert to base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64Image = buffer.toString('base64');

        // Upload to freeimage.host (no API key required)
        const formData = new FormData();
        formData.append('source', base64Image);
        formData.append('type', 'base64');
        formData.append('action', 'upload');
        formData.append('timestamp', Date.now().toString());
        formData.append('auth_token', '');

        const res = await fetch('https://freeimage.host/api/1/upload', {
            method: 'POST',
            body: formData,
        });

        const result = await res.json();

        if (result.status_code === 200 && result.image?.url) {
            return NextResponse.json({
                url: result.image.url,
                thumb: result.image.thumb?.url || result.image.url,
            });
        } else {
            // Fallback: return as data URL for small images
            if (file.size < 500 * 1024) {
                const dataUrl = `data:${file.type};base64,${base64Image}`;
                return NextResponse.json({ url: dataUrl });
            }
            console.error('freeimage.host error:', result);
            return NextResponse.json({
                error: result.error?.message || "Görsel yükleme servisi geçici olarak kullanılamıyor. Lütfen görsel URL'sini manuel olarak girin."
            }, { status: 500 });
        }
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Yükleme hatası - lütfen görsel URL'sini manuel olarak girin" }, { status: 500 });
    }
}
