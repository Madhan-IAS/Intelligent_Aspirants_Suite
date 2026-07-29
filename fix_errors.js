const fs = require('fs');
const path = require('path');

const clientDir = path.join(__dirname, 'client');

function replaceInFile(filePath, searchRegex, replacement) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(searchRegex, replacement);
    fs.writeFileSync(filePath, content);
}

// 1. Fix api imports in app/*.tsx
['answers.tsx', 'current-affairs.tsx', 'pyqs.tsx', 'revision.tsx'].forEach(file => {
    replaceInFile(path.join(clientDir, 'app', file), /..\/..\/src\/services\/api/g, '../src/services/api');
});

// 2. Fix outlineStyle: 'none'
['answers.tsx', 'current-affairs.tsx', 'pyqs.tsx', 'topic/[id].tsx', 'gs/[id].tsx'].forEach(file => {
    replaceInFile(path.join(clientDir, 'app', file), /outlineStyle:\s*'none'\s*\}\}/g, 'outlineStyle: \'none\' } as any}');
});

// 3. Fix app/current-affairs.tsx parameter type
replaceInFile(path.join(clientDir, 'app', 'current-affairs.tsx'), /tag => \(/g, '(tag: string) => (');

// 4. Fix app/gs/[id].tsx state type
replaceInFile(path.join(clientDir, 'app', 'gs/[id].tsx'), /const \[topics, setTopics\] = useState\(\[\]\);/g, 'const [topics, setTopics] = useState<any[]>([]);');

// 5. Fix app/index.tsx icon name
replaceInFile(path.join(clientDir, 'app', 'index.tsx'), /name="quote"/g, 'name="chatbubble-outline"');

// 6. Fix src/components/Sidebar.tsx types
replaceInFile(path.join(clientDir, 'src', 'components', 'Sidebar.tsx'), /\{ icon, label, href \}/g, '{ icon, label, href }: { icon: any, label: string, href: string }');

console.log('Fixes applied.');
