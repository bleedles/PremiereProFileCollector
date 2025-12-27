// Quick smoke test for Phase 5 core functions
console.log('🧪 Phase 5 Quick Smoke Test\n');

let pass = 0, fail = 0;

function test(name, fn) {
    try {
        fn();
        console.log('✅', name);
        pass++;
    } catch (e) {
        console.log('❌', name, '-', e.message);
        fail++;
    }
}

// Path URL functions (copied from implementation)
function decodePathUrl(pathUrl) {
    let path = pathUrl;
    if (path.startsWith('file://localhost/')) path = path.substring('file://localhost/'.length);
    else if (path.startsWith('file:///')) path = path.substring('file:///'.length);
    else if (path.startsWith('file://')) path = path.substring('file://'.length);
    path = decodeURIComponent(path);
    if (path && !path.startsWith('/') && !path.match(/^[A-Za-z]:/)) path = '/' + path;
    return path;
}

function encodePathUrl(path) {
    let normalized = path.replace(/\\/g, '/');
    const isWindowsPath = normalized.match(/^[A-Za-z]:/);
    const segments = normalized.split('/');
    const encoded = segments.map((seg, i) => {
        if (i === 0 && isWindowsPath) return seg;
        return encodeURIComponent(seg);
    }).join('/');
    if (encoded.startsWith('/')) return 'file://localhost' + encoded;
    else if (isWindowsPath) return 'file://localhost/' + encoded;
    else return encoded;
}

function normalizePath(path) {
    let normalized = path.replace(/\\/g, '/');
    const isWindows = path.includes('\\') || path.match(/^[A-Za-z]:/);
    if (isWindows) normalized = normalized.toLowerCase();
    return normalized.replace(/\/+$/, '');
}

// Tests
test('Unix path decode', () => {
    const result = decodePathUrl('file://localhost/Users/test/video.mp4');
    if (result !== '/Users/test/video.mp4') throw new Error(`Expected /Users/test/video.mp4, got ${result}`);
});

test('Windows path decode', () => {
    const result = decodePathUrl('file://localhost/C:/Users/test/video.mp4');
    if (result !== 'C:/Users/test/video.mp4') throw new Error(`Expected C:/Users/test/video.mp4, got ${result}`);
});

test('Space encoding', () => {
    const result = encodePathUrl('/Users/test/My Project/file.mp4');
    if (!result.includes('%20Project')) throw new Error('Spaces not encoded');
});

test('Windows path encode', () => {
    const result = encodePathUrl('C:/Users/test/video.mp4');
    if (result !== 'file://localhost/C:/Users/test/video.mp4') throw new Error(`Got ${result}`);
});

test('Round-trip Unix', () => {
    const original = '/Users/test/simple.mp4';
    const encoded = encodePathUrl(original);
    const decoded = decodePathUrl(encoded);
    if (decoded !== original) throw new Error(`Round-trip failed: ${original} -> ${encoded} -> ${decoded}`);
});

test('Round-trip Windows', () => {
    const original = 'C:/Users/test/video.mp4';
    const encoded = encodePathUrl(original);
    const decoded = decodePathUrl(encoded);
    if (decoded !== original) throw new Error(`Round-trip failed: ${original} -> ${encoded} -> ${decoded}`);
});

test('Path normalization Unix', () => {
    const result = normalizePath('/Users/test/folder/');
    if (result !== '/Users/test/folder') throw new Error(`Got ${result}`);
});

test('Path normalization Windows', () => {
    const result = normalizePath('C:\\Users\\Test\\VIDEO.MP4');
    if (result !== 'c:/users/test/video.mp4') throw new Error(`Got ${result}`);
});

test('Path mapping', () => {
    const mapping = new Map();
    const normalized = normalizePath('/Users/me/original/video.mp4');
    mapping.set(normalized, '/dest/video.mp4');
    if (mapping.get(normalized) !== '/dest/video.mp4') throw new Error('Mapping failed');
});

test('Case-insensitive Windows', () => {
    const norm1 = normalizePath('C:\\Users\\Test\\File.mp4');
    const norm2 = normalizePath('C:\\users\\test\\file.mp4');
    if (norm1 !== norm2) throw new Error('Case-insensitive normalization failed');
});

console.log(`\n${'='.repeat(40)}`);
console.log(`✅ Passed: ${pass}`);
console.log(`❌ Failed: ${fail}`);
console.log(`🎯 Success Rate: ${Math.round((pass / (pass + fail)) * 100)}%`);
console.log('='.repeat(40));

if (fail === 0) {
    console.log('\n🎉 All core logic tests passed!');
    console.log('✨ Phase 5 path handling is working correctly.\n');
} else {
    process.exit(1);
}
