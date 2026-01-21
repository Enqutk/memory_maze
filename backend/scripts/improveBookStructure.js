const fs = require('fs').promises;
const path = require('path');

const STORIES_DIR = path.join(__dirname, '../data/stories');

// Improved book structure with previews and links to real books
async function improveBookStructure() {
  try {
    console.log('📚 Improving book structure...\n');
    
    const files = await fs.readdir(STORIES_DIR);
    let updatedCount = 0;
    
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      
      const filePath = path.join(STORIES_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const book = JSON.parse(content);
      
      // Add purchase/borrow links (Ethiopia-friendly options)
      book.whereToRead = {
        // Free/Open Access (Best for Ethiopia)
        gutenbergLink: `https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(book.title)}`,
        archiveLink: `https://archive.org/search.php?query=${encodeURIComponent(book.title)}`,
        
        // Purchase Options
        amazonLink: `https://www.amazon.com/s?k=${encodeURIComponent(book.title)}`,
        googleBooksLink: `https://books.google.com/books?q=${encodeURIComponent(book.title)}`,
        
        // Info & Reviews
        goodreadsLink: `https://www.goodreads.com/search?q=${encodeURIComponent(book.title)}`,
        wikipediaLink: `https://en.wikipedia.org/wiki/${encodeURIComponent(book.title.replace(/\s+/g, '_'))}`,
        
        note: '📖 This is a preview. Access the full book through the links below!'
      };
      
      // Add author info if not present
      if (!book.author) {
        book.author = 'Classic Author';
      }
      
      // Update chapter structure - make it clear these are PREVIEWS
      if (book.chapters && book.chapters.length > 0) {
        book.chapters = book.chapters.map(chapter => ({
          ...chapter,
          isPreview: true,
          fullBookRequired: true,
          content: chapter.content.length > 500 
            ? chapter.content.substring(0, 500) + '...\n\n[Get the full book to continue reading!]'
            : chapter.content + '\n\n[This is a preview. Read the full book for the complete chapter!]'
        }));
      }
      
      // Add educational disclaimer
      book.educationalNote = 'This platform helps you practice reading comprehension. Summary content is provided for educational purposes. Please purchase or borrow the complete book to read the full story and support the author.';
      
      // Save updated book
      await fs.writeFile(filePath, JSON.stringify(book, null, 2), 'utf-8');
      console.log(`✅ Updated "${book.title}"`);
      updatedCount++;
    }
    
    console.log(`\n🎉 Updated ${updatedCount} books with purchase links and previews!\n`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  improveBookStructure();
}

module.exports = { improveBookStructure };
