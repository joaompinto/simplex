import { codeStyles } from './code.js';
import { containerStyles } from './container.js';
import { copyStyles } from './copy.js';
import { indicatorStyles } from './indicator.js';
import { inputStyles } from './input.js';
import { markdownStyles } from './markdown.js';
import { messageStyles } from './message.js';
import { noticeStyles } from './notice.js';
import { scrollbarStyles } from './scrollbar.js';
import { themeStyles } from './theme.js';

const copyButtonStyles = `
.code-block-wrapper {
    position: relative;
}

.code-copy-button {
    display: none;
    top: 4px;
    right: 4px;
}

.code-block-wrapper:hover .code-copy-button {
    display: block;
}
`;

// Combine all styles in a logical order
export const styles = `
    /* Theme variables */
    ${themeStyles}

    /* Layout */
    ${containerStyles}
    ${scrollbarStyles}
    ${messageStyles}
    ${indicatorStyles}

    /* Components */
    ${inputStyles}
    ${markdownStyles}
    ${codeStyles}
    ${copyButtonStyles}
    ${copyStyles}
    ${noticeStyles}
`;

export * from './code.js';
export * from './container.js';
export * from './copy.js';
export * from './indicator.js';
export * from './input.js';
export * from './markdown.js';
export * from './message.js';
export * from './notice.js';
export * from './scrollbar.js';
export * from './theme.js';
