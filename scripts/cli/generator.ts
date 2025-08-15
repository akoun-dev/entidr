#!/usr/bin/env ts-node
const Commander = require('commander');
// @ts-expect-error - CommonJS require used for compatibility
const fs = require('fs-extra');
// @ts-expect-error - CommonJS require used for compatibility
const path = require('path');
// @ts-expect-error - CommonJS require used for compatibility
const chalk = require('chalk');
const inquirer = require('inquirer');

const program = new Commander.Command();

program
  .version('1.0.0')
  .description('Project scaffolding tool')
  .command('docs')
  .description('Generate project documentation')
  .action(async () => {
    try {
      console.log(chalk.yellow('Importing documentation generator...'));
      const { generateDocs } = require('./documentation');
      console.log(chalk.blue('Generator imported successfully'));
      await generateDocs();
      console.log(chalk.green('Documentation generated successfully!'));
    } catch (err) {
      console.error(chalk.red('Error generating documentation:'), err);
    }
  });

// Addon generator
program
  .command('addon <name>')
  .description('Generate new addon structure')
  .action(async (name: string) => {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Select addon type:',
        choices: ['Component', 'Service', 'Full Module']
      },
      {
        type: 'confirm',
        name: 'withTests',
        message: 'Include test stubs?'
      }
    ]);

    const templatePath = path.join(__dirname, '../../templates/addon-template');
    const destPath = path.join(process.cwd(), 'addons', name);

    try {
      await fs.copy(templatePath, destPath);
      
      // Customize based on options
      if (!answers.withTests) {
        await fs.remove(path.join(destPath, 'tests'));
      }

      console.log(chalk.green(`Addon ${name} created successfully!`));
    } catch (err) {
      console.error(chalk.red('Error generating addon:'), err);
    }
  });

async function generateAddon(name: string) {
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'type',
      message: 'Select addon type:',
      choices: ['Component', 'Service', 'Full Module']
    },
    {
      type: 'confirm',
      name: 'withTests',
      message: 'Include test stubs?'
    }
  ]);

  const templatePath = path.join(__dirname, '../../templates/addon-template');
  const destPath = path.join(process.cwd(), 'addons', name);

  try {
    await fs.copy(templatePath, destPath);
    
    if (!answers.withTests) {
      await fs.remove(path.join(destPath, 'tests'));
    }

    console.log(chalk.green(`Addon ${name} created successfully!`));
    return true;
  } catch (err) {
    console.error(chalk.red('Error generating addon:'), err);
    return false;
  }
}

if (require.main === module) {
  program.parse(process.argv);
}