import {evaluateInDock} from './evaluateInDock.ts';

export const clickDockButton = async (text: string) => {
    const clickScript = `(() => {
        const button = [...document.querySelectorAll('button')].find(candidate => candidate.innerText.trim() === ${JSON.stringify(text)});

        button?.click();

        return Boolean(button);
    })()`;

    const isClicked = await evaluateInDock<boolean>(clickScript);

    if (!isClicked) {
        throw new Error(`The dock has no button "${text}"`);
    }
};
