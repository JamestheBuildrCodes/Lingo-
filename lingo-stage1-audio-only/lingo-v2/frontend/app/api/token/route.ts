import { AccessToken } from 'livekit-server-sdk';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const room = req.nextUrl.searchParams.get('room');
  const username = req.nextUrl.searchParams.get('username') || 'User';
  const language = req.nextUrl.searchParams.get('language') || 'en';

  if (!room) {
    return NextResponse.json({ error: 'Missing room' }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  // We include the language in metadata so the Agent knows how to translate you
  const at = new AccessToken(apiKey, apiSecret, { 
    identity: username,
    metadata: JSON.stringify({ language: language }) 
  });

  at.addGrant({ 
    roomJoin: true, 
    room: room, 
    canPublish: true, 
    canSubscribe: true 
  });

  return NextResponse.json({ token: await at.toJwt() });
}
