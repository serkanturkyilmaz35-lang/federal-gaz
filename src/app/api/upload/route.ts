import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
    let file: File | null = null;
    let base64Image: string = "";

    try {
        const data = await request.formData();
        file = data.get("file") as unknown as File;

        if (!file) {
            return NextResponse.json({ error: "Dosya seçilmedi" }, { status: 400 });
        }

        // Check file size (max 6MB)
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
        base64Image = buffer.toString('base64');

        // Upload to freeimage.host (try external service first)
        try {
            const formData = new FormData();
            formData.append('source', base64Image);
            formData.append('type', 'base64');
            formData.append('action', 'upload');
            formData.append('timestamp', Date.now().toString());
            // No auth token needed for free upload

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
            }

            console.warn('freeimage.host returned non-200 status:', result);
            // If service fails, throw to trigger fallback
            throw new Error('External upload service failed');

        } catch (externalError) {
            console.warn('External upload failed, attempting fallback:', externalError);

            // Fallback: return as data URL for images < 3MB
            if (file.size < 3 * 1024 * 1024) {
                const dataUrl = `data:${file.type};base64,${base64Image}`;
                return NextResponse.json({ url: dataUrl });
            }

            throw new Error(`Dosya dış servise yüklenemedi ve veritabanı için çok büyük (${(file.size / 1024 / 1024).toFixed(2)}MB). Lütfen 3MB altı görsel deneyin.`);
        }

    } catch (error: any) {
        console.error("Upload error:", error);

        // Final catch-all fallback if we have the file data
        if (file && base64Image && file.size < 3 * 1024 * 1024) {
            const dataUrl = `data:${file.type};base64,${base64Image}`;
            return NextResponse.json({ url: dataUrl });
        }

        return NextResponse.json({
            error: error.message || "Yükleme hatası - lütfen görsel URL'sini manuel olarak girin"
        }, { status: 500 });
    }
}
