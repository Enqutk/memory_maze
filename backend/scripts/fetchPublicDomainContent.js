const fs = require('fs');
const path = require('path');

/**
 * This script identifies which books in our library are public domain
 * and can legally have full content added from sources like Project Gutenberg.
 * 
 * For LOCAL TESTING ONLY - You must manually fetch content from legal sources.
 */

const storiesDir = path.join(__dirname, '../data/stories');

// Books that are definitively in the PUBLIC DOMAIN (no copyright restrictions)
const publicDomainBooks = {
  'pride-and-prejudice.json': {
    title: 'Pride and Prejudice',
    gutenbergId: 1342,
    gutenbergUrl: 'https://www.gutenberg.org/files/1342/1342-0.txt',
    year: 1813
  },
  'frankenstein.json': {
    title: 'Frankenstein',
    gutenbergId: 84,
    gutenbergUrl: 'https://www.gutenberg.org/files/84/84-0.txt',
    year: 1818
  },
  'alice-in-wonderland.json': {
    title: "Alice's Adventures in Wonderland",
    gutenbergId: 11,
    gutenbergUrl: 'https://www.gutenberg.org/files/11/11-0.txt',
    year: 1865
  },
  'great-expectations.json': {
    title: 'Great Expectations',
    gutenbergId: 1400,
    gutenbergUrl: 'https://www.gutenberg.org/files/1400/1400-0.txt',
    year: 1861
  },
  'moby-dick.json': {
    title: 'Moby-Dick',
    gutenbergId: 2701,
    gutenbergUrl: 'https://www.gutenberg.org/files/2701/2701-0.txt',
    year: 1851
  },
  'dracula.json': {
    title: 'Dracula',
    gutenbergId: 345,
    gutenbergUrl: 'https://www.gutenberg.org/files/345/345-0.txt',
    year: 1897
  },
  'jane-eyre.json': {
    title: 'Jane Eyre',
    gutenbergId: 1260,
    gutenbergUrl: 'https://www.gutenberg.org/files/1260/1260-0.txt',
    year: 1847
  },
  'the-adventures-of-tom-sawyer.json': {
    title: 'The Adventures of Tom Sawyer',
    gutenbergId: 74,
    gutenbergUrl: 'https://www.gutenberg.org/files/74/74-0.txt',
    year: 1876
  },
  'the-adventures-of-huckleberry-finn.json': {
    title: 'Adventures of Huckleberry Finn',
    gutenbergId: 76,
    gutenbergUrl: 'https://www.gutenberg.org/files/76/76-0.txt',
    year: 1884
  },
  'treasure-island.json': {
    title: 'Treasure Island',
    gutenbergId: 120,
    gutenbergUrl: 'https://www.gutenberg.org/files/120/120-0.txt',
    year: 1883
  },
  'the-picture-of-dorian-gray.json': {
    title: 'The Picture of Dorian Gray',
    gutenbergId: 174,
    gutenbergUrl: 'https://www.gutenberg.org/files/174/174-0.txt',
    year: 1890
  },
  'the-time-machine.json': {
    title: 'The Time Machine',
    gutenbergId: 35,
    gutenbergUrl: 'https://www.gutenberg.org/files/35/35-0.txt',
    year: 1895
  },
  'the-war-of-the-worlds.json': {
    title: 'The War of the Worlds',
    gutenbergId: 36,
    gutenbergUrl: 'https://www.gutenberg.org/files/36/36-0.txt',
    year: 1898
  },
  'around-the-world-in-eighty-days.json': {
    title: 'Around the World in Eighty Days',
    gutenbergId: 103,
    gutenbergUrl: 'https://www.gutenberg.org/files/103/103-0.txt',
    year: 1873
  },
  'the-jungle-book.json': {
    title: 'The Jungle Book',
    gutenbergId: 236,
    gutenbergUrl: 'https://www.gutenberg.org/files/236/236-0.txt',
    year: 1894
  },
  'the-call-of-the-wild.json': {
    title: 'The Call of the Wild',
    gutenbergId: 215,
    gutenbergUrl: 'https://www.gutenberg.org/files/215/215-0.txt',
    year: 1903
  },
  'white-fang.json': {
    title: 'White Fang',
    gutenbergId: 910,
    gutenbergUrl: 'https://www.gutenberg.org/files/910/910-0.txt',
    year: 1906
  },
  'peter-pan.json': {
    title: 'Peter Pan',
    gutenbergId: 16,
    gutenbergUrl: 'https://www.gutenberg.org/files/16/16-0.txt',
    year: 1911
  },
  'the-secret-garden.json': {
    title: 'The Secret Garden',
    gutenbergId: 113,
    gutenbergUrl: 'https://www.gutenberg.org/files/113/113-0.txt',
    year: 1911
  },
  'a-christmas-carol.json': {
    title: 'A Christmas Carol',
    gutenbergId: 46,
    gutenbergUrl: 'https://www.gutenberg.org/files/46/46-0.txt',
    year: 1843
  },
  'robinson-crusoe.json': {
    title: 'Robinson Crusoe',
    gutenbergId: 521,
    gutenbergUrl: 'https://www.gutenberg.org/files/521/521-0.txt',
    year: 1719
  },
  'gullivers-travels.json': {
    title: "Gulliver's Travels",
    gutenbergId: 829,
    gutenbergUrl: 'https://www.gutenberg.org/files/829/829-0.txt',
    year: 1726
  }
};

console.log('='.repeat(60));
console.log('PUBLIC DOMAIN BOOKS ANALYSIS');
console.log('='.repeat(60));
console.log('');
console.log(`Found ${Object.keys(publicDomainBooks).length} books that are PUBLIC DOMAIN.`);
console.log('These books can legally have full text added for local testing.');
console.log('');
console.log('📚 PUBLIC DOMAIN BOOKS (Safe to add full content):');
console.log('-'.repeat(60));

Object.entries(publicDomainBooks).forEach(([filename, info]) => {
  console.log(`✓ ${info.title} (${info.year})`);
  console.log(`  File: ${filename}`);
  console.log(`  Project Gutenberg: ${info.gutenbergUrl}`);
  console.log('');
});

console.log('='.repeat(60));
console.log('');
console.log('📖 NEXT STEPS:');
console.log('');
console.log('1. For full book content, you can:');
console.log('   - Download text from the Project Gutenberg URLs above');
console.log('   - Manually split into chapters and add to JSON files');
console.log('   - Use Gutenberg API or web scraping (legally)');
console.log('');
console.log('2. For COPYRIGHTED books (Harry Potter, Hunger Games, etc.):');
console.log('   ⚠️  CANNOT legally reproduce full text');
console.log('   - Keep as summaries only');
console.log('   - Or remove from your local version');
console.log('');
console.log('3. I can help you create a script to automatically fetch');
console.log('   and format Project Gutenberg content if you want!');
console.log('');
console.log('='.repeat(60));

// Count all books
const allFiles = fs.readdirSync(storiesDir).filter(f => f.endsWith('.json'));
const copyrightedCount = allFiles.length - Object.keys(publicDomainBooks).length;

console.log('');
console.log('📊 SUMMARY:');
console.log(`   Total books: ${allFiles.length}`);
console.log(`   Public domain: ${Object.keys(publicDomainBooks).length} (can add full text)`);
console.log(`   Copyrighted: ${copyrightedCount} (keep as summaries)`);
console.log('');
