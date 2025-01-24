import fs from 'fs';
import path from 'path';

const contentDir = 'landing';
const sections = [];

// Czytaj wszystkie pliki w katalogu content
const files = fs.readdirSync(contentDir);

// Funkcja do przetwarzania zawartości pliku MD
function processMarkdownContent(content) {
  const parts = [];
  
  // Szukaj znaczników collapse
  const collapseRegex = /<!--collapse-->([\s\S]*?)<!--end-collapse-->/g;
  let lastIndex = 0;
  let match;
  
  // Znajdź wszystkie wystąpienia znaczników collapse
  while ((match = collapseRegex.exec(content)) !== null) {
    // Znajdź początek linii ze znacznikiem collapse
    const lineStart = content.lastIndexOf('\n', match.index) + 1;
    
    // Dodaj tekst przed sekcją collapse (z pominięciem linii ze znacznikiem)
    if (lastIndex < lineStart) {
      const beforeText = content.slice(lastIndex, lineStart).trim();
      if (beforeText) {
        parts.push({ content: beforeText });
      }
    }
    
    // Wyodrębnij nagłówek z linii zawierającej znacznik
    const collapseLine = content.slice(lineStart, match.index + match[0].indexOf('\n'));
    const header = collapseLine.replace('<!--collapse-->', '').trim();
    
    parts.push({
      collapse: true,
      header: header,
      content: match[1].trim()
    });
    
    lastIndex = match.index + match[0].length;
  }
  
  // Dodaj pozostały tekst po ostatnim znaczniku
  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex).trim();
    if (remainingText) {
      parts.push({ content: remainingText });
    }
  }
  
  return parts.length > 0 ? parts : [{ content: content.trim() }];
}

// Grupuj pliki według ich prefiksu (np. "01-hero")
const groupedFiles = files.reduce((acc, file) => {
  const prefix = file.split('.')[0];
  if (!acc[prefix]) acc[prefix] = { video: {} };
  
  const ext = path.extname(file).toLowerCase();
  if (ext === '.md') {
    const content = fs.readFileSync(path.join(contentDir, file), 'utf-8');
    acc[prefix].content = processMarkdownContent(content);
  } else if (ext === '.webm') {
    acc[prefix].video.webm = `${process.env.CONTENT_SERVER}/${file}`;
  } else if (ext === '.mp4') {
    acc[prefix].video.mp4 = `${process.env.CONTENT_SERVER}/${file}`;
  }
  
  return acc;
}, {});

// Konwertuj zgrupowane pliki na format wyjściowy
for (const [prefix, files] of Object.entries(groupedFiles)) {
  sections.push({
    id: prefix,
    ...files
  });
}

// Zapisz jako JSON
const output = { sections };
fs.mkdirSync('.github/output/landing/', { recursive: true }, (err) => {})
fs.writeFileSync('.github/output/landing/content.json', JSON.stringify(output, null, 2)); 
