const fs = require('fs');
const path = require('path');

const FORBIDDEN = [
    { pattern: /any/g, message: '❌ NO "any" allowed! Use proper types.' },
    { pattern: /console\.log/g, message: '❌ NO "console.log" allowed! Use proper logging.' },
    { pattern: /constructor\(/g, message: '⚠️ Check constructor injection. Use inject() if possible.' },
];

function scanDir(dir) {
    const files = fs.readdirSync(dir);
    let errors = 0;

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            errors += scanDir(fullPath);
        } else if (file.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf-8');

            FORBIDDEN.forEach(rule => {
                if (rule.pattern.test(content)) {
                    console.error(`File: ${fullPath}`);
                    console.error(rule.message);
                    errors++;
                }
            });
        }
    }
    return errors;
}

console.log('🔍 Running Angular Cleanup...');
const errors = scanDir(path.join(__dirname, 'src'));

if (errors > 0) {
    console.error(`\n💥 Found ${errors} violations! Fix them or face the mines.`);
    process.exit(1);
} else {
    console.log('✅ Code looks clean. Good job.');
}
