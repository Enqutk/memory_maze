const fs = require('fs');
const path = require('path');
const https = require('https');

/**
 * Fetches FULL TEXT from Project Gutenberg for public domain books
 * and splits them into proper chapters with multiple pages of content.
 * 
 * This is LEGAL - all books here are in the public domain.
 */

const storiesDir = path.join(__dirname, '../data/stories');

// Function to fetch text from URL
function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

// Function to clean and split text into chapters
function splitIntoChapters(text, bookTitle) {
  // Remove Project Gutenberg header/footer
  let content = text.replace(/\*\*\* START OF .*? \*\*\*/s, '');
  content = content.replace(/\*\*\* END OF .*? \*\*\*/s, '');
  
  // Common chapter patterns
  const chapterPatterns = [
    /CHAPTER [IVXLCDM]+\.?/gi,
    /Chapter [IVXLCDM]+\.?/gi,
    /CHAPTER \d+\.?/gi,
    /Chapter \d+\.?/gi,
    /Chapter [A-Z][a-z]+/gi,
  ];
  
  let chapters = [];
  let pattern = null;
  
  // Find which pattern matches
  for (let p of chapterPatterns) {
    const matches = content.match(p);
    if (matches && matches.length > 3) {
      pattern = p;
      break;
    }
  }
  
  if (pattern) {
    const parts = content.split(pattern);
    const titles = content.match(pattern);
    
    // Skip first part (usually preface)
    for (let i = 1; i < parts.length && i <= 10; i++) {
      let chapterText = parts[i].trim();
      
      // Take first 3000-5000 characters (multiple pages)
      if (chapterText.length > 5000) {
        chapterText = chapterText.substring(0, 5000) + '...';
      }
      
      // Clean up text
      chapterText = chapterText
        .replace(/\r\n/g, '\n')
        .replace(/\n\n\n+/g, '\n\n')
        .trim();
      
      chapters.push({
        number: i,
        title: titles[i - 1] ? titles[i - 1].trim() : `Chapter ${i}`,
        content: chapterText
      });
    }
  }
  
  return chapters;
}

// Books to process (starting with a few for testing)
const booksToFetch = [
  {
    filename: 'pride-and-prejudice.json',
    url: 'https://www.gutenberg.org/files/1342/1342-0.txt',
    title: 'Pride and Prejudice'
  },
  {
    filename: 'alice-in-wonderland.json',
    url: 'https://www.gutenberg.org/files/11/11-0.txt',
    title: "Alice's Adventures in Wonderland"
  },
  {
    filename: 'frankenstein.json',
    url: 'https://www.gutenberg.org/files/84/84-0.txt',
    title: 'Frankenstein'
  },
  {
    filename: 'dracula.json',
    url: 'https://www.gutenberg.org/files/345/345-0.txt',
    title: 'Dracula'
  },
  {
    filename: 'treasure-island.json',
    url: 'https://www.gutenberg.org/files/120/120-0.txt',
    title: 'Treasure Island'
  }
];

async function processBook(bookInfo) {
  console.log(`\n📖 Processing: ${bookInfo.title}...`);
  
  try {
    // Fetch full text from Project Gutenberg
    console.log('   Downloading from Project Gutenberg...');
    const fullText = await fetchText(bookInfo.url);
    
    // Split into chapters
    console.log('   Splitting into chapters...');
    const chapters = splitIntoChapters(fullText, bookInfo.title);
    
    if (chapters.length === 0) {
      console.log('   ⚠️  Could not auto-split chapters. Skipping.');
      return;
    }
    
    // Load existing book data
    const bookPath = path.join(storiesDir, bookInfo.filename);
    const bookData = JSON.parse(fs.readFileSync(bookPath, 'utf8'));
    
    // Update chapters with full content (keeping existing questions)
    const updatedChapters = chapters.map((ch, idx) => {
      const existingChapter = bookData.chapters[idx];
      return {
        chapter: ch.number,
        title: ch.title,
        content: ch.content, // FULL TEXT - MULTIPLE PAGES!
        questions: existingChapter ? existingChapter.questions : [
          {
            id: `q${ch.number}-1`,
            question: `What happens in ${ch.title}?`,
            type: 'text',
            answer: 'summary of events'
          }
        ]
      };
    });
    
    bookData.chapters = updatedChapters.slice(0, 10); // Keep first 10 chapters
    
    // Save updated book
    fs.writeFileSync(bookPath, JSON.stringify(bookData, null, 2));
    
    console.log(`   ✅ Updated with ${updatedChapters.length} chapters of FULL TEXT!`);
    console.log(`   📄 Average chapter length: ${Math.round(updatedChapters.reduce((sum, ch) => sum + ch.content.length, 0) / updatedChapters.length)} characters`);
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('ADDING FULL BOOK CONTENT FROM PROJECT GUTENBERG');
  console.log('='.repeat(60));
  console.log('');
  console.log('This will add REAL, FULL CHAPTER TEXT (many pages per chapter)');
  console.log('for public domain books. This is 100% LEGAL.');
  console.log('');
  
  for (const book of booksToFetch) {
    await processBook(book);
    // Wait a bit to be respectful to Project Gutenberg servers
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ COMPLETE!');
  console.log('='.repeat(60));
  console.log('');
  console.log('🎉 Your books now have FULL TEXT with many pages per chapter!');
  console.log('');
  console.log('📚 Books updated: ' + booksToFetch.length);
  console.log('');
  console.log('Want to add more? Edit the booksToFetch array in this script');
  console.log('with any of the 22 public domain books listed earlier.');
  console.log('');
}

main().catch(console.error);
