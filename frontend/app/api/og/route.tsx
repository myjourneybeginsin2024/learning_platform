import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

const themes = [
    { bg: '#ffffff', text: '#111827', accent: '#e5e7eb' }, // Classic White
    { bg: '#fef3c7', text: '#451a03', accent: '#fde68a' }, // Paper / Sepia
    { bg: '#e0f2fe', text: '#0c4a6e', accent: '#bae6fd' }, // Sky
    { bg: '#d1fae5', text: '#064e3b', accent: '#a7f3d0' }, // Mint
    { bg: '#fae8ff', text: '#701a75', accent: '#f5d0fe' }, // Fuchsia
    { bg: '#06b6d4', text: '#ffffff', accent: '#0891b2' }, // Cyan (User Request - Adjusted for White Text readability with Darker Cyan or just Pure Cyan?) 
    // Pure Cyan (#00FFFF) text white is unreadable. 
    // User asked "background cyan, text white". 
    // Let's try a Teal/Dark Cyan BG for White Text to work.
    // Or if BG is Light Cyan (#cffafe), Text should be Dark.
    // I will use "Light Cyan" as per "light color background" instruction.
    { bg: '#cffafe', text: '#164e63', accent: '#a5f3fc' }, // Cyan Light
];

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Dynamic params
        // Dynamic params
        const content = searchParams.get('content')?.slice(0, 800) || '';
        const segment = searchParams.get('segment') || '1';
        const orgName = searchParams.get('org') || 'Organization';
        const themeIdx = parseInt(searchParams.get('theme') || '0');

        // Select theme (modulo to ensure safety)
        const theme = themes[themeIdx % themes.length];

        // Content Parsing: Extract only the 'Summary' section if present
        let parsedContent = content;
        const summaryMatch = content.match(/###\s*Summary\s*([\s\S]*?)(?=###|$)/i);

        if (summaryMatch && summaryMatch[1]) {
            parsedContent = summaryMatch[1].trim();
        } else {
            // Fallback: Remove all headers and just show text
            parsedContent = content
                .replace(/#{1,6}\s?.*/g, '') // Remove Header lines entirely
                .replace(/\*\*/g, '')        // Remove Bold
                .replace(/__/, '')           // Remove Italic
                .replace(/\n\s*\n/g, '\n');  // Compact newlines
        }

        const cleanContent = parsedContent;

        const len = cleanContent.length;

        // Aggressive Scaling Logic
        let fontSize = '52px';
        if (len > 600) fontSize = '20px';
        else if (len > 400) fontSize = '24px';
        else if (len > 300) fontSize = '28px';
        else if (len > 200) fontSize = '36px';
        else if (len > 100) fontSize = '42px';

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme.bg,
                        padding: '80px 60px',
                        color: theme.text,
                        fontFamily: 'sans-serif',
                    }}
                >
                    {/* Main Content Area - Centered and Clean */}
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            textAlign: 'center', // Center align for cleaner "quote" look
                            fontSize: fontSize,
                            fontWeight: 500,
                            lineHeight: 1.5,
                            letterSpacing: '-0.02em',
                            width: '100%',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word',
                            overflow: 'hidden',
                        }}
                    >
                        {cleanContent}
                    </div>
                </div>
            ),
            {
                width: 600,
                height: 900,
            },
        );
    } catch (e: any) {
        console.log(`${e.message}`);
        return new Response(`Failed to generate the image`, {
            status: 500,
        });
    }
}
