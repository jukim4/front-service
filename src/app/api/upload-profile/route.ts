import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('image') as Blob;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  // 실제 업로드 처리 로직: S3 업로드, DB 저장 등
  // 테스트로 local preview URL 반환
  const imageUrl = 'https://your.cdn.com/uploads/yourimage.jpg';

  return NextResponse.json({ url: imageUrl });
}