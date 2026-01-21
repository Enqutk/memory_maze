const fs = require('fs').promises;
const path = require('path');

const STORIES_DIR = path.join(__dirname, '../data/stories');

async function cleanGeneratedBooks() {
  try {
    console.log('🧹 Cleaning generated books...\n');
    
    const files = await fs.readdir(STORIES_DIR);
    let deletedCount = 0;
    
    for (const file of files) {
      // Match pattern: book-XXX-theme.json
      if (file.match(/^book-\d{3}-\w+\.json$/)) {
        const filePath = path.join(STORIES_DIR, file);
        await fs.unlink(filePath);
        console.log(`🗑️  Deleted ${file}`);
        deletedCount++;
      }
    }
    
    console.log(`\n✅ Cleaned up ${deletedCount} generated books!`);
    
    // Show remaining books
    const remainingFiles = await fs.readdir(STORIES_DIR);
    const realBooks = remainingFiles.filter(f => f.endsWith('.json'));
    
    console.log(`\n📚 Remaining books (${realBooks.length}):`);
    for (const file of realBooks) {
      const filePath = path.join(STORIES_DIR, file);
      const content = JSON.parse(await fs.readFile(filePath, 'utf-8'));
      console.log(`   - ${content.title}${content.author ? ` by ${content.author}` : ''}`);
    }
    
  } catch (error) {
    console.error('❌ Error cleaning books:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanGeneratedBooks();
}

module.exports = { cleanGeneratedBooks };
