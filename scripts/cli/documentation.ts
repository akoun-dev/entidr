const fs = require('fs-extra');
const { promisify } = require('util');
const path = require('path');
const chalk = require('chalk');
const { glob } = require('glob');
const parse = require('comment-parser');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

// Polyfill pour fs-extra.ensureDir
async function ensureDir(dir: string): Promise<void> {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code !== 'EEXIST') throw err;
  }
}

interface CommentBlock {
  description: string;
  tags: Array<{
    tag: string;
    name: string;
    description: string;
  }>;
}

interface DocEntry {
  file: string;
  comments: CommentBlock[];
}

async function generateDocs(): Promise<void> {
  try {
    console.log(chalk.yellow('\n=== Starting documentation generation ==='));
    console.log(chalk.blue(`Current directory: ${process.cwd()}`));
    
    // Find all TypeScript files
    console.log(chalk.blue('\nSearching for TypeScript files...'));
    const files = await glob('src/**/*.ts');
    console.log(chalk.blue(`Found ${files.length} TypeScript files:`));
    files.forEach((file: string) => console.log(chalk.gray(`- ${file}`)));
    
    const docs: DocEntry[] = [];

    // Parse each file for documentation comments
    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const parsed = parse(content);
      
      console.log(chalk.yellow(`\nProcessing ${file}...`));
      if (parsed.length > 0) {
        console.log(chalk.green(`Found ${parsed.length} comment blocks`));
        console.log(chalk.blue('Example comment:'));
        console.log(parsed[0]);
        docs.push({
          file: path.relative(process.cwd(), file),
          comments: parsed.map((c: CommentBlock) => ({
            description: c.description,
            tags: c.tags || []
          }))
        });
      } else {
        console.log(chalk.yellow('No documentation comments found'));
      }
      
    }
    
    exports.generateDocs = generateDocs;
    console.log(chalk.green('Documentation generator ready'));

    // Generate markdown documentation
    const outputPath = path.join(process.cwd(), 'docs', 'API.md');
    let markdown = '# API Documentation\n\n';

    docs.forEach(entry => {
      markdown += `## ${entry.file}\n\n`;
      entry.comments.forEach(comment => {
        markdown += `${comment.description}\n\n`;
        if (comment.tags.length > 0) {
          markdown += `**Tags:**\n`;
          comment.tags.forEach(tag => {
            markdown += `- @${tag.tag} ${tag.name ? tag.name + ' ' : ''}${tag.description}\n`;
          });
          markdown += '\n';
        }
      });
    });

    console.log(chalk.blue('Ensuring docs directory exists...'));
    await ensureDir(path.dirname(outputPath));
    console.log(chalk.green('Directory ready'));
    
    console.log(chalk.blue('Writing documentation file...'));
    console.log(chalk.gray('Preview:\n' + markdown.substring(0, 500) + '...'));
    await fs.writeFile(outputPath, markdown);
    console.log(chalk.green(`Documentation generated at ${outputPath}`));
    console.log(chalk.gray(`Content length: ${markdown.length} bytes`));
  } catch (err) {
    console.error(chalk.red('Error generating documentation:'), err);
    throw err;
  }
}