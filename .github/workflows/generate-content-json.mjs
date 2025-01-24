import fs from 'fs';
import path from 'path';

const contentDir = 'landing';
const sections = [];

// Czytaj wszystkie pliki w katalogu content
const files = fs.readdirSync(contentDir);

// Grupuj pliki według ich prefiksu (np. "01-hero")
const groupedFiles = files.reduce((acc, file) => {
  const prefix = file.split('.')[0];
  if (!acc[prefix]) acc[prefix] = { video: {} };
  
  const ext = path.extname(file).toLowerCase();
  if (ext === '.md') {
    acc[prefix].content = `${process.env.CONTENT_SERVER}/${file}`;
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
