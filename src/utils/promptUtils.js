// User prompt utilities using readline
import readline from 'readline';

/**
 * Create readline interface
 * @returns {readline.Interface} Readline interface
 */
function createInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

/**
 * Ask user a question and return answer
 * @param {string} question - Question to ask
 * @returns {Promise<string>} User's answer
 */
export function prompt(question) {
    return new Promise((resolve) => {
        const rl = createInterface();
        
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

/**
 * Ask user to choose from multiple options
 * @param {string} title - Title/question
 * @param {Array<{value: string, label: string}>} options - Array of options
 * @param {string} defaultValue - Default value if invalid choice
 * @returns {Promise<string>} Selected value
 */
export function promptChoice(title, options, defaultValue = null) {
    return new Promise((resolve) => {
        const rl = createInterface();
        
        console.log(`\n${title}`);
        options.forEach((option, index) => {
            console.log(`${index + 1}. ${option.label}`);
        });
        
        const choiceNumbers = options.map((_, i) => String(i + 1)).join('/');
        rl.question(`\nEnter your choice (${choiceNumbers}): `, (answer) => {
            rl.close();
            
            const choice = answer.trim();
            const index = parseInt(choice) - 1;
            
            if (index >= 0 && index < options.length) {
                resolve(options[index].value);
            } else {
                if (defaultValue !== null) {
                    console.log(`Invalid choice. Using ${defaultValue} as default.`);
                    resolve(defaultValue);
                } else {
                    console.log('Invalid choice.');
                    resolve(null);
                }
            }
        });
    });
}

/**
 * Ask user to choose language (JavaScript/TypeScript)
 * @returns {Promise<string>} 'javascript' or 'typescript'
 */
export async function promptLanguage() {
    return promptChoice(
        '💻 Choose your language:',
        [
            { value: 'javascript', label: 'JavaScript (ES6+)' },
            { value: 'typescript', label: 'TypeScript' }
        ],
        'javascript'
    );
}

/**
 * Ask user to choose database
 * @returns {Promise<string>} 'mongodb', 'mysql', or 'memory'
 */
export async function promptDatabase() {
    return promptChoice(
        '📊 Choose your database:',
        [
            { value: 'mongodb', label: 'MongoDB (NoSQL)' },
            { value: 'mysql', label: 'MySQL (SQL)' },
            { value: 'memory', label: 'In-Memory (No database - for demo)' }
        ],
        'memory'
    );
}

/**
 * Ask user for confirmation (y/n)
 * @param {string} question - Question to ask
 * @param {boolean} defaultAnswer - Default answer if empty input
 * @returns {Promise<boolean>} True if yes, false if no
 */
export async function promptConfirm(question, defaultAnswer = false) {
    const defaultText = defaultAnswer ? '[Y/n]' : '[y/N]';
    const answer = await prompt(`${question} ${defaultText}: `);
    
    if (!answer) {
        return defaultAnswer;
    }
    
    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}
