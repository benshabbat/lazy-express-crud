// User prompt utilities using readline
import readline from 'readline';

/**
 * Create a readline interface.
 *
 * Callers that need to ask multiple sequential questions (e.g. language then
 * database) MUST create a single interface and reuse it for every prompt via
 * the same `rl` argument. Two pitfalls to avoid, both of which previously
 * caused piped/non-TTY stdin to silently produce nothing and exit code 0:
 *
 * 1. Creating a new readline.Interface per question: only the first
 *    interface ever receives input, every subsequent question waits forever
 *    on a Promise that never resolves, and since a pending Promise doesn't
 *    keep the Node event loop alive, the process exits as soon as stdin
 *    reaches EOF.
 * 2. Using `rl.question()` sequentially on a single shared interface: when
 *    piped input arrives in one chunk (e.g. `echo "2\n3" | ...`), readline
 *    emits a 'line' event for every buffered line as soon as the data
 *    arrives. If the next `rl.question()` call hasn't subscribed yet (it
 *    only runs after the previous prompt's Promise resolves, on a later
 *    microtask), that already-emitted 'line' event has no listener and is
 *    lost forever - the process again hangs until stdin EOF and silently
 *    exits with code 0.
 *
 * To avoid both, prompts are read via the interface's async iterator
 * (`rl[Symbol.asyncIterator]()`), which is created once per interface and
 * buffers every 'line' event internally regardless of when `.next()` is
 * called, so piped multi-line input is never dropped.
 * @returns {readline.Interface} Readline interface
 */
export function createPromptInterface() {
    return readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

// Map from readline.Interface -> its async line iterator, so repeated calls
// with the same shared `rl` reuse (and don't lose the buffered state of) a
// single iterator instead of creating a competing one per call.
const lineIterators = new WeakMap();

function getLineIterator(rl) {
    let iterator = lineIterators.get(rl);
    if (!iterator) {
        iterator = rl[Symbol.asyncIterator]();
        lineIterators.set(rl, iterator);
    }
    return iterator;
}

/**
 * Write a question/prompt to stdout and read the next line of input.
 * Rejects instead of hanging forever if stdin closes/ends before an answer
 * is provided (e.g. piped input with too few lines, or input from
 * /dev/null), so callers fail loudly instead of exiting silently with
 * code 0.
 * @param {readline.Interface} rl - Readline interface to use
 * @param {string} question - Question text to print before reading
 * @returns {Promise<string>} User's answer (trimmed)
 */
async function askQuestion(rl, question) {
    if (question) {
        process.stdout.write(question);
    }

    const iterator = getLineIterator(rl);
    const { value, done } = await iterator.next();

    if (done || value === undefined) {
        throw new Error(
            'Input ended before a response was provided. If you are running this ' +
            'command non-interactively (piped stdin, CI, scripts), make sure enough ' +
            'input lines are provided for every prompt, or use CLI flags (e.g. ' +
            '--lang/--db) to skip prompts entirely.'
        );
    }

    return value.trim();
}

/**
 * Ask user a question and return answer.
 * @param {string} question - Question to ask
 * @param {readline.Interface} [rl] - Optional shared readline interface. When
 *   provided it is reused (and left open) so multiple sequential prompts work
 *   correctly with piped/non-TTY stdin. When omitted, a new interface is
 *   created and closed automatically for this single question.
 * @returns {Promise<string>} User's answer
 */
export function prompt(question, rl) {
    const ownsInterface = !rl;
    const activeRl = rl || createPromptInterface();

    return askQuestion(activeRl, question).finally(() => {
        if (ownsInterface) {
            activeRl.close();
        }
    });
}

/**
 * Ask user to choose from multiple options
 * @param {string} title - Title/question
 * @param {Array<{value: string, label: string}>} options - Array of options
 * @param {string} defaultValue - Default value if invalid choice
 * @param {readline.Interface} [rl] - Optional shared readline interface (see `prompt`)
 * @returns {Promise<string>} Selected value
 */
export function promptChoice(title, options, defaultValue = null, rl) {
    const ownsInterface = !rl;
    const activeRl = rl || createPromptInterface();

    console.log(`\n${title}`);
    options.forEach((option, index) => {
        console.log(`${index + 1}. ${option.label}`);
    });

    const choiceNumbers = options.map((_, i) => String(i + 1)).join('/');

    return askQuestion(activeRl, `\nEnter your choice (${choiceNumbers}): `)
        .then((answer) => {
            const index = parseInt(answer, 10) - 1;

            if (index >= 0 && index < options.length) {
                return options[index].value;
            }

            if (defaultValue !== null) {
                console.log(`Invalid choice. Using ${defaultValue} as default.`);
                return defaultValue;
            }

            console.log('Invalid choice.');
            return null;
        })
        .finally(() => {
            if (ownsInterface) {
                activeRl.close();
            }
        });
}

/**
 * Ask user to choose language (JavaScript/TypeScript)
 * @param {readline.Interface} [rl] - Optional shared readline interface (see `prompt`)
 * @returns {Promise<string>} 'javascript' or 'typescript'
 */
export async function promptLanguage(rl) {
    return promptChoice(
        '💻 Choose your language:',
        [
            { value: 'javascript', label: 'JavaScript (ES6+)' },
            { value: 'typescript', label: 'TypeScript' }
        ],
        'javascript',
        rl
    );
}

/**
 * Ask user to choose database
 * @param {readline.Interface} [rl] - Optional shared readline interface (see `prompt`)
 * @returns {Promise<string>} 'mongodb', 'mysql', or 'memory'
 */
export async function promptDatabase(rl) {
    return promptChoice(
        '📊 Choose your database:',
        [
            { value: 'mongodb', label: 'MongoDB (NoSQL)' },
            { value: 'mysql', label: 'MySQL (SQL)' },
            { value: 'memory', label: 'In-Memory (No database - for demo)' }
        ],
        'memory',
        rl
    );
}

/**
 * Ask user for confirmation (y/n)
 * @param {string} question - Question to ask
 * @param {boolean} defaultAnswer - Default answer if empty input
 * @param {readline.Interface} [rl] - Optional shared readline interface (see `prompt`)
 * @returns {Promise<boolean>} True if yes, false if no
 */
export async function promptConfirm(question, defaultAnswer = false, rl) {
    const defaultText = defaultAnswer ? '[Y/n]' : '[y/N]';
    const answer = await prompt(`${question} ${defaultText}: `, rl);

    if (!answer) {
        return defaultAnswer;
    }

    return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}
