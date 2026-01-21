const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * IMPROVED VERSION: Fetches FULL TEXT with proper chapter extraction
 */

const storiesDir = path.join(__dirname, '../data/stories');

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function cleanText(text) {
  // Remove Gutenberg header/footer
  let cleaned = text;
  const startMatch = cleaned.match(/\*\*\* START OF (THIS|THE) PROJECT GUTENBERG.*?\*\*\*/is);
  if (startMatch) {
    cleaned = cleaned.substring(startMatch.index + startMatch[0].length);
  }
  
  const endMatch = cleaned.match(/\*\*\* END OF (THIS|THE) PROJECT GUTENBERG.*?\*\*\*/is);
  if (endMatch) {
    cleaned = cleaned.substring(0, endMatch.index);
  }
  
  return cleaned.trim();
}

function extractChapters(text) {
  const cleaned = cleanText(text);
  
  // Try different chapter patterns
  const patterns = [
    /(?:^|\n)(CHAPTER [IVXLCDM]+\.?[^\n]*)\n/gi,
    /(?:^|\n)(Chapter [IVXLCDM]+\.?[^\n]*)\n/gi,
    /(?:^|\n)(CHAPTER \d+\.?[^\n]*)\n/gi,
    /(?:^|\n)(Chapter \d+\.?[^\n]*)\n/gi,
  ];
  
  let chapters = [];
  
  for (const pattern of patterns) {
    const matches = [...cleaned.matchAll(pattern)];
    
    if (matches.length >= 5) { // Need at least 5 chapters
      for (let i = 0; i < matches.length && i < 10; i++) {
        const startIndex = matches[i].index + matches[i][0].length;
        const endIndex = matches[i + 1] ? matches[i + 1].index : cleaned.length;
        
        let content = cleaned.substring(startIndex, endIndex).trim();
        
        // Get first 4000-6000 characters (about 3-4 pages)
        if (content.length > 6000) {
          // Find a good breaking point (end of paragraph)
          const breakPoint = content.indexOf('\n\n', 5500);
          if (breakPoint > 5000) {
            content = content.substring(0, breakPoint);
          } else {
            content = content.substring(0, 6000);
          }
        }
        
        // Clean up formatting
        content = content
          .replace(/\r\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .replace(/^\s+/gm, '')
          .trim();
        
        if (content.length > 500) { // Only include if substantial content
          chapters.push({
            number: i + 1,
            title: matches[i][1].trim(),
            content: content
          });
        }
      }
      
      if (chapters.length >= 5) break; // Found good pattern
    }
  }
  
  return chapters;
}

const books = [
  {
    file: 'pride-and-prejudice.json',
    url: 'https://www.gutenberg.org/files/1342/1342-0.txt',
    name: 'Pride and Prejudice'
  },
  {
    file: 'alice-in-wonderland.json',
    url: 'https://www.gutenberg.org/files/11/11-0.txt',
    name: 'Alice in Wonderland'
  },
  {
    file: 'frankenstein.json',
    url: 'https://www.gutenberg.org/files/84/84-0.txt',
    name: 'Frankenstein'
  }
];

async function processBook(book) {
  console.log(`\n📖 ${book.name}...`);
  
  try {
    console.log('   ⬇️  Downloading full text...');
    const fullText = await fetchText(book.url);
    
    console.log('   📝 Extracting chapters...');
    const chapters = extractChapters(fullText);
    
    if (chapters.length === 0) {
      console.log('   ❌ Could not extract chapters');
      return;
    }
    
    const bookPath = path.join(storiesDir, book.file);
    const bookData = JSON.parse(fs.readFileSync(bookPath, 'utf8'));
    
    // Update chapters with full content
    bookData.chapters = chapters.map((ch, idx) => {
      const existingChapter = bookData.chapters[idx];
      return {
        chapter: ch.number,
        title: ch.title,
        content: ch.content,
        questions: existingChapter ? existingChapter.questions : [
          {
            id: `q${ch.number}-1`,
            question: `What happens in this chapter?`,
            type: 'text',
            answer: 'key events'
          },
          {
            id: `q${ch.number}-2`,
            question: 'What is the main theme of this chapter?',
            type: 'text',
            answer: 'main theme'
          }
        ]
      };
    });
    
    fs.writeFileSync(bookPath, JSON.stringify(bookData, null, 2));
    
    const avgLength = Math.round(chapters.reduce((sum, ch) => sum + ch.content.length, 0) / chapters.length);
    console.log(`   ✅ Added ${chapters.length} chapters!`);
    console.log(`   📄 Average: ${avgLength} characters (~${Math.round(avgLength / 250)} pages per chapter)`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('                ADDING FULL BOOK TEXT');
  console.log('='.repeat(70));
  console.log('\nFetching from Project Gutenberg (Legal - Public Domain)\n');
  
  for (const book of books) {
    await processBook(book);
    await new Promise(r => setTimeout(r, 2000)); // Be nice to the server
  }
  
  console.log('\n' + '='.repeat(70));
  console.log('✅ COMPLETE! Your books now have FULL MULTI-PAGE chapters!');
  console.log('='.repeat(70) + '\n');
}

main();
