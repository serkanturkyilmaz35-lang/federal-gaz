const fs = require('fs');
const path = require('path');

const fonts = [
    { src: 'public/fonts/Roboto-Regular-v2.ttf', dest: 'src/lib/fontRobotoRegular.ts', varName: 'robotoRegular' },
    { src: 'public/fonts/Roboto-Bold-v2.ttf', dest: 'src/lib/fontRobotoBold.ts', varName: 'robotoBold' }
];

fonts.forEach(font => {
    try {
        const srcPath = path.join(process.cwd(), font.src);
        if (!fs.existsSync(srcPath)) {
            console.error(`Source file not found: ${srcPath}`);
            return;
        }
        const fileBuffer = fs.readFileSync(srcPath);
        const base64 = fileBuffer.toString('base64');
        // valid TS file content
        const content = `export const ${font.varName} = "${base64}";\n`;
        // Using double quotes is safer than backticks if binary data somehow contains backticks, 
        // though base64 standard is A-Za-z0-9+/= so backticks aren't possible. 
        // But let's stick to standard double quotes for simplicity.

        fs.writeFileSync(path.join(process.cwd(), font.dest), content);
        console.log(`Success: Generated ${font.dest} (${base64.length} chars)`);
    } catch (e) {
        console.error(`Error processing ${font.src}:`, e);
    }
});
