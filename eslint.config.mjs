// @ts-check

import tseslint from "typescript-eslint";
import { anStandardTS, anStandardHTML, anStandardJSON } from '@anedomansky/eslint-config';


export default tseslint.config(
    ...anStandardTS,
    ...anStandardHTML,
    ...anStandardJSON,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
);
