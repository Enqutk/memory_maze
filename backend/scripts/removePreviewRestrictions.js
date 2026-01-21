const fs = require('fs');
const path = require('path');

const storiesDir = path.join(__dirname, '../data/stories');

// Get all JSON files
const files = fs.readdirSync(storiesDir).filter(f => f.endsWith('.json'));

console.log(`Found ${files.length} book files. Removing preview restrictions...`);

let totalUpdated = 0;

files.forEach(file => {
  const filePath = path.join(storiesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let updated = false;
  
  // Remove preview restrictions from each chapter
  if (data.chapters && Array.isArray(data.chapters)) {
    data.chapters.forEach(chapter => {
      // Remove preview messages from content
      if (chapter.content) {
        const originalContent = chapter.content;
        chapter.content = chapter.content
          .replace(/\[Get the full book to continue reading!\]/g, '')
          .replace(/\[This is a preview\. Read the full book for the complete.*?\]/g, '')
          .replace(/\n\n+$/g, '\n\n') // Clean up trailing newlines
          .trim();
        
        if (originalContent !== chapter.content) {
          updated = true;
        }
      }
      
      // Remove preview flags
      if (chapter.isPreview !== undefined) {
        delete chapter.isPreview;
        updated = true;
      }
      if (chapter.fullBookRequired !== undefined) {
        delete chapter.fullBookRequired;
        updated = true;
      }
    });
  }
  
  // Remove whereToRead section note about preview
  if (data.whereToRead && data.whereToRead.note) {
    if (data.whereToRead.note.includes('preview') || data.whereToRead.note.includes('Preview')) {
      delete data.whereToRead.note;
      updated = true;
    }
  }
  
  if (updated) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    totalUpdated++;
    console.log(`✓ Updated: ${file}`);
  }
});

console.log(`\n✅ Complete! Updated ${totalUpdated} books.`);
console.log('All preview restrictions have been removed.');
console.log('Readers now have full access to all available content.');
